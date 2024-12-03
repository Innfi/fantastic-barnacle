import { APP_INTERCEPTOR } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { readFileSync } from 'fs';
import { RedisModule } from '@liaoliaots/nestjs-redis';

import { LogWriterES } from './common/log.writer.es/writer.es';
import { LoggingInterceptor } from './common/logging.interceptor';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ResponseReceiverModule } from './response-receiver/module';
import { CouponModule } from './coupon/module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
      },
    }),
    BullModule.registerQueue({ name: 'request_queue' }),
    BullModule.registerQueue({ name: 'response_queue' }),
    RedisModule.forRoot({
      config: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
      },
      readyLog: true,
    }),
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
    EventEmitterModule.forRoot(),
    ElasticsearchModule.register({
      node: process.env.ES_URL ?? 'http://localhost:9200',
      auth: {
        username: 'elastic',
        password: process.env.ELASTIC_PASSWORD ?? 'test'
      },
      tls: {
        ca: readFileSync(process.env.CA_PATH),
        rejectUnauthorized: false,
      },
    }),
    ResponseReceiverModule,
    CouponModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    LogWriterES,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    }
  ],
})
export class AppModule {}
