import { APP_INTERCEPTOR } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { BarnacleLog, BarnacleLogSchema } from './common/log.schema';
import { LoggingInterceptor } from './common/logging.interceptor';
import { LogWriterMongo } from './common/log.writer.mongo';
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
    MongooseModule.forRoot(process.env.MONGODB_URL ?? 'mongodb://root:test@localhost:27017/log'),
    MongooseModule.forFeature([
      { name: BarnacleLog.name, schema: BarnacleLogSchema },
    ]),
    ResponseReceiverModule,
    CouponModule,
  ],
  controllers: [AppController],
  providers: [
    LogWriterMongo,
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    }
  ],
})
export class AppModule {}
