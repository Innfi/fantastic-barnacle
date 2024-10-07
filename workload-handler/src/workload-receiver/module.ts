import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';

import { MessageHistory } from './message.entity';
import { QueueReceiver } from './receiver';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageHistory]),
    BullModule.registerQueue({ name: 'response_queue' }),
  ],
  providers: [QueueReceiver],
})
export class WorkloadReceiverModule{}

