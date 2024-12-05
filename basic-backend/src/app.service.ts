import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Queue } from 'bullmq';

import { EnqueMessagePayload, EnqueMessageResponse } from './entity';

@Injectable()
export class AppService {
  constructor(
    // @InjectQueue('request_queue') private queue: Queue,
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  // async enqueData(payload: EnqueMessagePayload, transactionId: string): Promise<EnqueMessageResponse> {
  //   const { messageId } = payload;

  //   await this.queue.add('message', {
  //     messageId,
  //     transactionId,
  //   });

  //   return {
  //     result: 'success',
  //     receivedMessageId: messageId,
  //   };
  // }

  async enqueDataV2(payload: EnqueMessagePayload, transactionId: string): Promise<EnqueMessageResponse> {
    Logger.log(`AppService.enqueDataV2] `);

    const { messageId } = payload;

    const emitResult = this.kafkaClient.emit('message', {
      messageId,
      transactionId,
    });

    // Observable in async function: all is well ?
    emitResult.subscribe({
      next: (data) => {
        Logger.log(`AppService.enqueDataV2] data: ${JSON.stringify(data)}`);
        return;
      },
      error: (error) => {
        Logger.error(`AppService.enqueDataV2] error: ${error}`);
        return;
      },
    });

    return {
      result: 'success',
      receivedMessageId: messageId,
    };
  }
}
