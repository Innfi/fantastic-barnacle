import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { DataSource } from "typeorm";

import { MessageHistory } from "./entity";

interface MessagePayload {
  messageId: number;
}

@Injectable()
@Processor('queue')
export class QueueReceiver extends WorkerHost {
  constructor(private readonly dataSource: DataSource) { super(); }

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
    const payload = data as MessagePayload;

    Logger.log(`messageId: ${payload.messageId}`);

    const saveResult = await this.dataSource.manager.save(MessageHistory, {
      messageId: payload.messageId,
    });

    Logger.log(`new entity id: ${saveResult.id}`);
  }
}