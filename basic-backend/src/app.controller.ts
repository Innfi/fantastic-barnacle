import { Body, Controller, Get, Logger, Post, Req } from '@nestjs/common';
import { Request } from 'express';

import { AppService } from './app.service';
import { Coupon, EnqueMessagePayload, EnqueMessageResponse } from './entity';

export class PostGenerateCouponsPayload {
  targetProductId: number;
  discountRate: number;
  validUntil: Date;
}

export interface PostGenerateCouponsResponse {
  targetProductId: number;
  couponsCount: number;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('enque')
  async enqueMessage(
    @Req() request: Request,
    @Body() payload: EnqueMessagePayload
  ): Promise<EnqueMessageResponse> {
    const transactionId = request.header['transactionId'] as string;
    return await this.appService.enqueData(payload, transactionId);
  }

  @Post('/coupon/generate')
  postGenerateCoupons(payload: PostGenerateCouponsPayload): PostGenerateCouponsResponse {
    // TODO: implement
    Logger.log(`postGenerateCoupons] ${payload.targetProductId}`);

    return {
      targetProductId: payload.targetProductId,
      couponsCount: 1000,
    };
  }

  @Post('/coupon/issue')
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
