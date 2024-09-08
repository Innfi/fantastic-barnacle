import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MessageHistory } from './messge.entity';
import { QueueReceiver } from './receiver';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageHistory]),
  ],
  providers: [QueueReceiver],
})
export class WorkloadReceiverModule{}

