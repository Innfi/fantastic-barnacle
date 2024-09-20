import { InjectQueue, Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Job, Queue } from "bullmq";
import { DataSource } from "typeorm";

import { MessageHistory } from "./message.entity";
import { EVENT_NAME_LOGGING } from "./event.logger";

interface MessagePayload {
  messageId: number;
  transactionId: string;
}

@Injectable()
@Processor('request_queue')
export class QueueReceiver extends WorkerHost {
  constructor(
    private eventEmitter: EventEmitter2,
    @InjectQueue('response_queue') private queue: Queue,
    private readonly dataSource: DataSource
  ) { super(); }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'message':
        await this.saveMessage(job.data);
        break;
      default:
        Logger.error(`process] invalid name: ${job.name}`);
        break;
    }
  }

  private async saveMessage(data: unknown): Promise<void> {
    try {
      const payload = data as MessagePayload;
      if (!payload) {
        Logger.error(`saveMessage] invalid payload`);
        return;
      }
      const { messageId, transactionId } = payload;

      const saveResult = await this.dataSource.manager.save(MessageHistory, {
        messageId,
      });

      Logger.log(`new entity id: ${saveResult.id}`);

      await this.queue.add('message_response', {
        id: saveResult.id,
        messageId: saveResult.messageId,
        createdAt: saveResult.createdAt,
        transactionId,
      });

      this.eventEmitter.emit(EVENT_NAME_LOGGING, {
        transactionId,
        messageId,
        createdAt: saveResult.createdAt,
      });

    } catch (err: unknown) {
      Logger.error((err as Error).stack);
    }
  }
}
