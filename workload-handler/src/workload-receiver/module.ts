import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { MongooseModule } from '@nestjs/mongoose';

import { BarnacleLog, BarnacleLogSchema } from '../common/schema';
import { MessageHistory } from './message.entity';
import { QueueReceiver } from './receiver';
import { EventLogger } from './event.logger';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageHistory]),
    BullModule.registerQueue({ name: 'response_queue' }),
    MongooseModule.forFeature([
      { name: BarnacleLog.name, schema: BarnacleLogSchema },
    ]),
  ],
  providers: [QueueReceiver, EventLogger],
})
export class WorkloadReceiverModule{}

