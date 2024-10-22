import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { Queue } from "bullmq";
import { RedisService } from "@liaoliaots/nestjs-redis";

import { Coupon, PostGenerateCouponsPayload, PostGenerateCouponsResponse, PostIssueCouponPayload } from "./entity";
import Redis from "ioredis";

@Injectable()
export class CounponService {
  private readonly redisClient: Redis | null;

  constructor(
    private readonly redisService: RedisService,
    @InjectQueue('request_queue') private queue: Queue
  ) {
    this.redisClient = this.redisService.getOrThrow();
  }

  async generateCoupon(transactionId: string, payload: PostGenerateCouponsPayload): Promise<PostGenerateCouponsResponse> {
    Logger.log(`CouponService.generateCoupon] ${JSON.stringify(payload)}`);

    await this.queue.add('generateCoupon', {
      transactionId,
      payload,
    });

    return {
      status: 'pending',
      targetProductId: payload.targetProductId,
      couponsCount: payload.couponsCount,
    };
  }

  async issueCoupon(transactionId: string, payload: PostIssueCouponPayload): Promise<Coupon> {
    Logger.log(`CouponService.issueCoupon] ${transactionId}`);

    const expectedCouponValue = await this.redisClient.get('dummykey_userid');

    return {
      uuid: 'test',
      targetProductId: 2,
      discountRate: 10,
      createdAt: new Date(),
      validUntil: new Date(),
    };
  }
}
