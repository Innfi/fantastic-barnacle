import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QueueReceiver } from './receiver';
import { MessageHistory } from './entity';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'queue'
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.RDB_HOST || 'localhost',
      port: process.env.RDB_PORT ? parseInt(process.env.RDB_PORT) : 3306,
      username: 'root',
      password: 'read_this_you_bot',
      database: 'test',
    }),
    TypeOrmModule.forFeature([MessageHistory]),
  ],
  controllers: [AppController],
  providers: [AppService, QueueReceiver],
})
export class AppModule {}
