import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';

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
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'mysql-compose',
      port: 3306,
      username: 'innfi',
      password: 'test',
      database: 'test'
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
