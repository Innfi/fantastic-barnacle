import { Body, Controller, Logger, Post, Req } from "@nestjs/common";
import { Request } from 'express';

import { Coupon, PostGenerateCouponsPayload, PostGenerateCouponsResponse, PostIssueCouponPayload } from "./entity";
import { CounponService } from "./service";

@Controller('/coupon')
export class CouponController {
  constructor(private readonly service: CounponService) {}

  @Post('generate')
  async postGenerateCoupons(
    @Req() request: Request,
    @Body() payload: PostGenerateCouponsPayload
  ): Promise<PostGenerateCouponsResponse> {
    const transactionId = request.header['transactionId'] as string;
    Logger.log(`postGenerateCoupons] ${transactionId}, ${payload.targetProductId}`);

    return await this.service.generateCoupon(transactionId, payload);
  }

  @Post('issue')
  async postIssueCoupon(
    @Req() request: Request,
    @Body() payload: PostIssueCouponPayload
  ): Promise<Coupon> {
    const transactionId = request.header['transactionId'] as string;
    //TODO: implement coupon issuing / user entity

    return {
      uuid: 'test',
      targetProductId: 2,
      discountRate: 10,
      createdAt: new Date(),
      validUntil: new Date(),
    };
  }
}
