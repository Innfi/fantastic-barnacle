import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OnEvent } from '@nestjs/event-emitter';

import { Request } from 'express';
import { Model } from 'mongoose';

import { BarnacleLog } from './schema';
import { EVENT_LOG_HTTP, EVENT_WORKLOAD_HANDLER_RESP } from './event.key';

interface HttpLogPayload {
  request: {
    transactionId: string;
    path: string;
    query: object;
    params: object;
    body: object;
  };
  response: object;
}

@Injectable()
export class LogEventHandler {
  constructor(
    @InjectModel(BarnacleLog.name) private logModel: Model<BarnacleLog>
  ) {
    Logger.log('EventHandler] ');
  }

  @OnEvent(EVENT_LOG_HTTP)
  async handleLoggingEventHttp(payload: Readonly<HttpLogPayload>): Promise<void> {
    Logger.log(`handleLogginEventHttp] ${payload.request.transactionId}`);
    const { request, response } = payload;

    const updateResult = await this.logModel.updateOne(
      { transactionId: { $eq: request.transactionId } },
      {
        $set: {
          'request': {
            'path': request.path,
            'query': request.query,
            'params': request.params,
            'body': request.body,
          },
          'response': response,
        },
      },
      {
        upsert: true,
      },
    );

    Logger.log(`handlerLoggingEventHttp] updateResult: ${JSON.stringify(updateResult)}`);
  }

  @OnEvent(EVENT_WORKLOAD_HANDLER_RESP)
  async handleLoggingEventWorkload(payload: Readonly<object & { transactionId: string }>): Promise<void> {
    Logger.log(`handleLoggingEventWorkload] ${payload.transactionId}`);

    const updateResult = await this.logModel.updateOne(
      { transactionId: { $eq: payload.transactionId } },
      { $set: { 'queue.resp': payload } },
      { upsert: true },
    );

    Logger.log(`handleLoggingEventWorkload] updateResult: ${JSON.stringify(updateResult)}`);
  }
}