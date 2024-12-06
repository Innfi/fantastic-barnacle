import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

import { EnqueMessagePayload, EnqueMessageResponse } from './entity';

@Injectable()
export class AppService {
  constructor(@InjectQueue('request_queue') private queue: Queue) {}

  getHello(): string {
    return 'Hello World!';
  }

  async enqueData(payload: EnqueMessagePayload, transactionId: string): Promise<EnqueMessageResponse> {
    const { messageId } = payload;

    await this.queue.add('message', {
      messageId,
      transactionId,
    });

    return {
      result: 'success',
      receivedMessageId: messageId,
    };
  }
}
