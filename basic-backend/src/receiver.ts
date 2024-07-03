import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";

@Processor('queue')
export class QueueReceiver extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'enque':
        Logger.log(`process] enque: ${JSON.stringify(job.data)}`);
        break;
      default:
        Logger.error(`process] invalid name: ${job.name}`);
        break;
    }
  }
}