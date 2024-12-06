import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import * as fs from 'fs';
import { RedisModule } from '@liaoliaots/nestjs-redis';

import { EventLogWriterES } from '../common/log.writer.es/writer.es';
import { MessageHistory } from './message.entity';
import { QueueReceiver } from './receiver';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageHistory]),
    BullModule.registerQueue({ name: 'response_queue' }),
    RedisModule.forRoot({
      config: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
      },
      readyLog: true,
    }),
    ElasticsearchModule.register({
      node: process.env.ES_URL ?? 'http://localhost:9200',
      auth: {
        username: 'elastic',
        password: process.env.ELASTIC_PASSWORD ?? 'test'
      },
      tls: {
        ca: fs.readFileSync(process.env.CA_PATH),
        rejectUnauthorized: false,
      },
    }),
  ],
  providers: [
    QueueReceiver, 
    EventLogWriterES
  ],
  exports: [
    QueueReceiver, 
    EventLogWriterES
  ],
})
export class WorkloadReceiverModule{}

