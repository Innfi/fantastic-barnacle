import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WorkloadReceiverModule } from './workload-receiver/module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
      },
    }),
    BullModule.registerQueue({ name: 'request_queue' }),
    BullModule.registerQueue({ name: 'response_queue' }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.RDB_HOST || 'localhost',
      port: process.env.RDB_PORT ? parseInt(process.env.RDB_PORT) : 3306,
      username: 'root',
      password: 'read_this_you_bot',
      database: 'test',
      entities: [__dirname + '/../**/*.entity.{js,ts}'],
    }),
    MongooseModule.forRoot(process.env.MONGODB_URL ?? 'mongodb://localhost:27017', {
      user: 'root',
      pass: 'test',
      dbName: 'log',
    }),
    WorkloadReceiverModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
