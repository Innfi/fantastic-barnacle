import { InjectQueue, Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { Job, Queue } from "bullmq";
import { DataSource } from "typeorm";

import { MessageHistory } from "./messge.entity";

interface MessagePayload {
  messageId: number;
}

@Injectable()
@Processor('request_queue')
export class QueueReceiver extends WorkerHost {
  constructor(
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

      const saveResult = await this.dataSource.manager.save(MessageHistory, {
        messageId: payload.messageId,
      });

      Logger.log(`new entity id: ${saveResult.id}`);

      await this.queue.add('message_response', {
        id: saveResult.id,
        messageId: saveResult.messageId,
        createdAt: saveResult.createdAt,
      });

    } catch (err: unknown) {
      Logger.error((err as Error).stack);
    }
  }
}