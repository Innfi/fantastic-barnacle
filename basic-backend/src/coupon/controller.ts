import { Body, Controller, Logger, Post, Req } from "@nestjs/common";
import { Request } from 'express';

import { Coupon, PostGenerateCouponsPayload, PostGenerateCouponsResponse } from "./entity";
import { CounponService } from "./service";

@Controller('/coupon')
export class CouponController {
  constructor(private readonly service: CounponService) {}

  @Post('generate')
  postGenerateCoupons(
    @Req() request: Request,
    @Body() payload: PostGenerateCouponsPayload
  ): PostGenerateCouponsResponse {
    const transactionId = request.header['transactionId'] as string;
    Logger.log(`postGenerateCoupons] ${transactionId}, ${payload.targetProductId}`);

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
