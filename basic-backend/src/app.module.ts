import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QueueReceiver } from './receiver';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        // FIXME: read connection data from env
        host: 'redis-compose',
        port: 6379
      },
    }),
    BullModule.registerQueue({
      name: 'queue'
    }),
  ],
  controllers: [AppController],
  providers: [AppService, QueueReceiver],
})
export class AppModule {}
