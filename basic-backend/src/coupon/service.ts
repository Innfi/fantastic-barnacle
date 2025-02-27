import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { Queue } from "bullmq";
import Redis from "ioredis";
import { RedisService } from "@liaoliaots/nestjs-redis";
import { backOff } from "exponential-backoff";

import { Coupon, PostGenerateCouponsPayload, PostGenerateCouponsResponse, PostIssueCouponPayload } from "./entity";

interface IssueResult {
  result: 'ok' | 'error';
  coupon: Coupon | null;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

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

    const expectedCouponValue = await this.tryGetCoupon(payload.userId);
    if (!expectedCouponValue) {
      Logger.error('issueCoupon] redisClient.get() failed');
      throw new InternalServerErrorException();
    }
    const issueResult = JSON.parse(expectedCouponValue) as IssueResult;
    if (!issueResult || issueResult.result !== 'ok') {
      Logger.error('issueCoupon] parse failed');
      throw new InternalServerErrorException();
    }

    return issueResult.coupon;
  }

  private async tryGetCoupon(userId: number): Promise<string> {
    try {
      return await backOff(async () => {
        const stringFromRedis = await this.redisClient.get(`issueresult-${userId}`);
        if (!stringFromRedis || stringFromRedis.length <= 0) {
          return Promise.reject();
        }
        return stringFromRedis;
      }, {
        jitter: 'full',
        maxDelay: 5000
      });
    } catch (err: unknown) {
      return undefined;
    }
  }
}
