import { APP_INTERCEPTOR } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MongooseModule } from '@nestjs/mongoose';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { LoggingInterceptor } from './common/logging.interceptor';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ResponseReceiverModule } from './response-receiver/module';
import { CouponModule } from './coupon/module';

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
    EventEmitterModule.forRoot(),
    ElasticsearchModule.register({
      node: process.env.ES_URL ?? 'http://localhost:9200',
    }),
    ResponseReceiverModule,
    CouponModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    }
  ],
})
export class AppModule {}
