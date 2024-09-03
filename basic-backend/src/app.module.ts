import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { AppController } from './app.controller';
import { AppService } from './app.service';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
