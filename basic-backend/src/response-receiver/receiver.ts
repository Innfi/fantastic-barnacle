import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { Job } from "bullmq";

interface ResponsePayload {
  id: number;
  messageId: number;
  createdAt: Date;
}

@Injectable()
@Processor('response_queue')
export class QueueReceiver extends WorkerHost {
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

  private async saveMessage(data: unknown): Promise<void> {
    Logger.log(`saveMesasge] payload: ${JSON.stringify(data)}`);
    try {
      const payload = data as ResponsePayload;
      if (!payload) {
        Logger.log(`saveMessage] invalid payload`);
        return;
      }

      Logger.log(`${payload.messageId}] response id: ${payload.id}`);
    } catch (err: unknown) {
      Logger.error((err as Error).stack);
    }
  }
}
