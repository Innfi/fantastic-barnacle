import { Controller, Injectable, Logger, Post } from "@nestjs/common";

import { Coupon } from "./entity";
import { CounponService } from "./service";

export class PostGenerateCouponsPayload {
  targetProductId: number;
  discountRate: number;
  validUntil: Date;
}

export interface PostGenerateCouponsResponse {
  targetProductId: number;
  couponsCount: number;
}

@Controller('/coupon')
export class CouponController {
  constructor(private readonly service: CounponService) {}

  @Post('generate')
  postGenerateCoupons(payload: PostGenerateCouponsPayload): PostGenerateCouponsResponse {
    // TODO: implement
    Logger.log(`postGenerateCoupons] ${payload.targetProductId}`);

    return {
      targetProductId: payload.targetProductId,
      couponsCount: 1000,
    };
  }

  @Post('issue')
  postIssueCoupon(): Coupon {
    //TODO: implement coupon issuing / user entity

    return {
      uid: 1,
      name: 'coupon-default',
      targetProductId: 2,
      discountRate: 10,
      createdAt: new Date(),
      validUntil: new Date(),
    };
  }
}
