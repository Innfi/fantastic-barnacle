import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WorkloadReceiverModule } from './workload-receiver/module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    // BullModule.forRoot({
    //   connection: {
    //     host: process.env.REDIS_HOST ?? 'localhost',
    //     port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
    //   },
    // }),
    // BullModule.registerQueue({ name: 'request_queue' }),
    // BullModule.registerQueue({ name: 'response_queue' }),
    // TypeOrmModule.forRoot({
    //   type: 'mysql',
    //   host: process.env.RDB_HOST || 'localhost',
    //   port: process.env.RDB_PORT ? parseInt(process.env.RDB_PORT) : 3306,
    //   username: process.env.RDB_USERNAME,
    //   password: process.env.RDB_PASSWORD,
    //   database: 'test',
    //   entities: [__dirname + '/../**/*.entity.{js,ts}'],
    // }),
    // WorkloadReceiverModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
