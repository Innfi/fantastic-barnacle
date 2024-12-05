import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as fs from 'fs';
import { RedisModule } from '@liaoliaots/nestjs-redis';

import { EventLogWriterES } from '../common/log.writer.es/writer.es';
import { MessageHistory } from './message.entity';
import { QueueReceiver } from './receiver';
import { WorkloadReceiverController } from './controller';

@Module({
  imports: [
    // TypeOrmModule.forFeature([MessageHistory]),
    // BullModule.registerQueue({ name: 'response_queue' }),
    // RedisModule.forRoot({
    //   config: {
    //     host: process.env.REDIS_HOST ?? 'localhost',
    //     port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
    //   },
    //   readyLog: true,
    // }),
    ClientsModule.register([
      {
        name: 'KAFKA_CLIENT',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'basic-backend',
            brokers: [process.env.KAFKA_BROKER ?? 'localhost:9092'],
          },
          consumer: {
            groupId: 'barnacle1'
          },
        }
      },
    ]),
    // ElasticsearchModule.register({
    //   node: process.env.ES_URL ?? 'http://localhost:9200',
    //   auth: {
    //     username: 'elastic',
    //     password: process.env.ELASTIC_PASSWORD ?? 'test'
    //   },
    //   tls: {
    //     ca: fs.readFileSync(process.env.CA_PATH),
    //     rejectUnauthorized: false,
    //   },
    // }),
  ],
  controllers: [WorkloadReceiverController],
  providers: [
    // QueueReceiver, 
    // EventLogWriterES
  ],
  exports: [
    // QueueReceiver, 
    // EventLogWriterES
  ],
})
export class WorkloadReceiverModule{}

