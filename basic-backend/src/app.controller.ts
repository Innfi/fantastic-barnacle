import { Body, Controller, Get, Logger, Post, Req } from '@nestjs/common';
import { Request } from 'express';

import { AppService } from './app.service';
import { EnqueMessagePayload, EnqueMessageResponse } from './entity';

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
    Logger.log(`transactionId: ${transactionId}`);

    return await this.appService.enqueData(payload, transactionId);
  }

  @Post('v2/enque')
  async enqueMessageV2(
    @Req() request: Request,
    @Body() payload: EnqueMessagePayload
  ): Promise<EnqueMessageResponse> {
    const transactionId = request.header['transactionId'] as string;
    Logger.log(`transactionId: ${transactionId}`);

    return await this.appService.enqueData(payload, transactionId);
  }
}
