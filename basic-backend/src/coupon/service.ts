import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, Logger, NotImplementedException } from "@nestjs/common";
import { Queue } from "bullmq";

import { PostGenerateCouponsPayload, PostGenerateCouponsResponse } from "./entity";

@Injectable()
export class CounponService {
  constructor(@InjectQueue('request_queue') private queue: Queue) {}

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
}
