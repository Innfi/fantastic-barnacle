import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class AppService {
  constructor(@InjectQueue('queue') private queue: Queue) {}

  getHello(): string {
    return 'Hello World!';
  }

  async enqueData(id: number): Promise<number> {
    await this.queue.add('enque', {
      messageId: id,
    });

    return id;
  }
}
