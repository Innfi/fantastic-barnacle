import { InjectQueue, Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { Job, Queue } from "bullmq";
import { DataSource } from "typeorm";

import { MessageHistory } from "./messge.entity";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";

interface MessagePayload {
  messageId: number;
  transactionId: string;
}

interface TransactionLoggingEventPayload {
  messageId: number;
  transactionId: string;
  createdAt: Date;
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
    Logger.log(`saveMesasge] payload: ${JSON.stringify(data)}`);
    try {
      const payload = data as MessagePayload;
      if (!payload) {
        Logger.log(`saveMessage] invalid payload`);
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
      });

      this.eventEmitter.emit('transaction', {
        transactionId,
        messageId,
        createdAt: saveResult.createdAt,
      });

    } catch (err: unknown) {
      Logger.error((err as Error).stack);
    }
  }

  @OnEvent('transaction')
  eventHandlerTransaction(payload: TransactionLoggingEventPayload): void {
    const { messageId, transactionId, createdAt } = payload;
    Logger.log(`eventHandlerTransaction] transactionId: ${transactionId}`);

    // todo: internal event handler?
  }
}