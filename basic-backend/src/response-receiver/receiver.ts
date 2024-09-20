import { Injectable, Logger } from "@nestjs/common";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Job } from "bullmq";

import { EVENT_WORKLOAD_HANDLER_RESP } from "../common/event.key";

type WorkloadHandlerResponse = object & { transactionId: string };

@Injectable()
@Processor('response_queue')
export class QueueReceiver extends WorkerHost {
  constructor(private eventEmitter: EventEmitter2) {
    Logger.log('QueueReceiver()');
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'message_response':
        await this.saveMessage(job.data);
        break;
      default:
        Logger.error(`process] invalid name: ${job.name}`);
        break;
    }
  }

  private async saveMessage(data: object): Promise<void> {
    Logger.log(`saveMessage] payload: ${JSON.stringify(data)}`);

    try {
      const response = data as WorkloadHandlerResponse;
      Logger.log(`saveMessage] response: ${JSON.stringify(response)}`);
      if (!response.transactionId) {
        Logger.error(`saveMessage] no transactionId`);
        return;
      }

      this.eventEmitter.emit(EVENT_WORKLOAD_HANDLER_RESP, response);

    } catch (err: unknown) {
      Logger.error((err as Error).stack);
    }
  }
}
