import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { Queue } from "bullmq";
import Redis from "ioredis";
import { RedisService } from "@liaoliaots/nestjs-redis";

import { Coupon, PostGenerateCouponsPayload, PostGenerateCouponsResponse, PostIssueCouponPayload } from "./entity";

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

    await this.queue.add('issueCoupon', { transactionId, payload });

    // possible approaches: exponential backoff or retry by fixed interval
    const expectedCouponValue = await this.redisClient.get(`issueresult${payload.userId}`);
    if (!expectedCouponValue) {
      Logger.error('issueCoupon] redisClient.get() failed');
      throw new InternalServerErrorException();
    }
    const newCoupon = JSON.parse(expectedCouponValue) as Coupon;
    if (!newCoupon) {
      Logger.error('issueCoupon] parse failed');
      throw new InternalServerErrorException();
    }

    return newCoupon;
  }
}
