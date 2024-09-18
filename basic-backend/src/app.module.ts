import { APP_INTERCEPTOR } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MongooseModule } from '@nestjs/mongoose';

import { LoggingInterceptor } from './common/logger';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ResponseReceiverModule } from './response-receiver/module';

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
    MongooseModule.forRoot(process.env.MONGODB_URL ?? 'mongodb://root:test@localhost:27017/log'),
    ResponseReceiverModule,
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
