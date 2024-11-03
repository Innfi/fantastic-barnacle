import { InjectQueue, Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Job, Queue } from "bullmq";
import { DataSource } from "typeorm";
import { v4 } from 'uuid';
import Redis from "ioredis";
import { RedisService } from "@liaoliaots/nestjs-redis";

import { EVENT_NAME_LOGGING } from "../common/log.writer.es/writer.es";
import { MessageHistory } from "./message.entity";
import { Coupon } from "./coupon.entity";

interface MessagePayload {
  transactionId: string;
  messageId: number;
}

interface CouponPayload {
  targetProductId: number;
  discountRate: number;
  validUntil: Date;
	couponsCount: number;
}

interface GenerateCouponsRequest {
  transactionId: string;
  payload: CouponPayload;
}

interface IssueCouponsRequest {
  transactionId: string;
  payload: {
    targetProductId: number;
    userId: number;
  };
}

const COUPON_QUEUE = 'coupon_queue';

@Injectable()
@Processor('request_queue')
export class QueueReceiver extends WorkerHost {
  private readonly redisClient: Redis | null;

  constructor(
    private eventEmitter: EventEmitter2,
    @InjectQueue('response_queue') private queue: Queue,
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService
  ) { 
    super(); 
    this.redisClient = this.redisService.getOrThrow();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'message':
        await this.saveMessage(job.data);
        break;
      case 'generateCoupon':
        await this.generateCoupons(job.data);
        break;
      case 'issueCoupon':
        await this.issueCoupon(job.data);
        break;
      default:
        Logger.error(`process] invalid name: ${job.name}`);
        break;
    }
  }

  private async saveMessage(data: unknown): Promise<void> {
    try {
      const payload = data as MessagePayload;
      if (!payload) {
        Logger.error(`saveMessage] invalid payload`);
        return;
      }
      const { messageId, transactionId } = payload;

      const saveResult = await this.dataSource.manager.save(MessageHistory, {
        messageId,
      });

      Logger.log(`new entity id: ${saveResult.id}`);

      await this.queue.add('message_response', {
        id: saveResult.id,
        messageId: saveResult.messageId,
        createdAt: saveResult.createdAt,
        transactionId,
      });

      this.eventEmitter.emit(EVENT_NAME_LOGGING, {
        transactionId,
        data: {
          messageId,
          createdAt: saveResult.createdAt,
        },
      });

    } catch (err: unknown) {
      Logger.error((err as Error).stack);
    }
  }

  private async generateCoupons(data: unknown): Promise<void> {
    try {
      const couponsPayload = data as GenerateCouponsRequest;
      if (!couponsPayload) {
        Logger.error(`generateCoupons] invalid payload`);
        return;
      }
      const { transactionId, payload } = couponsPayload;

      if (!payload.couponsCount || payload.couponsCount <= 0) {
        Logger.error(`generateCouponse] invalid count`);
        return;
      }

      const entities = this.toCouponEntities(payload);
      await this.dataSource.manager.save(Coupon, entities);

      for (const entity of entities) {
        await this.redisClient.rpush(COUPON_QUEUE, entity.uuid);

        this.eventEmitter.emit(EVENT_NAME_LOGGING, {
          transactionId,
          data: { newCoupon: entity }
        });
      }

    } catch (err: unknown) {
      Logger.error((err as Error).stack);
    }
  }

  private toCouponEntities(payload: CouponPayload): Partial<Coupon>[] {
    const { targetProductId, discountRate, validUntil, couponsCount } = payload;

    const entities: Partial<Coupon>[] = [];

    for(let i=0;i<couponsCount;i++) {
      const newCoupon: Partial<Coupon>= {
        uuid: v4(),
        targetProductId,
        discountRate,
        validUntil,
      };

      entities.push(newCoupon);
    }

    return entities;
  }

  private async issueCoupon(data: unknown): Promise<void> {
    try {
      const couponsPayload = data as IssueCouponsRequest;
      if (!couponsPayload) {
        Logger.error(`issueConpon] invalid payload`);
        return;
      }

      const { transactionId, payload } = couponsPayload;
      const { targetProductId, userId } = payload;
      Logger.log(`targetProductId: ${targetProductId}`);
      Logger.log(`userId: ${userId}`);


      const uuid = await this.redisClient.rpop(COUPON_QUEUE);
      if (!uuid || uuid.length <= 0) {
        await this.redisClient.set(`issueresult-${userId}`, JSON.stringify({
          result: 'err',
          coupon: null,
        }));

        this.eventEmitter.emit(EVENT_NAME_LOGGING, {
          transactionId,
          data: { userId, err: 'invalid uuid' }
        });

        return;
      }
      const coupon = await this.dataSource.manager.findOne(Coupon, { where: { uuid }});
      if (!coupon) {
        await this.redisClient.set(`issueresult-${userId}`, JSON.stringify({
          result: 'err',
          coupon: null,
        }));

        this.eventEmitter.emit(EVENT_NAME_LOGGING, {
          transactionId,
          data: { userId, uuid, err: 'invalid coupon' }
        });
        return;
      }

      await this.redisClient.set(`issueresult-${userId}`, JSON.stringify({
        result: 'ok',
        coupon,
      }));

      this.eventEmitter.emit(EVENT_NAME_LOGGING, {
        transactionId,
        data: { userId, uuid, issuedAt: new Date(), }
      });

    } catch (err: unknown) {
      Logger.error((err as Error).stack);
    }
  }
}
