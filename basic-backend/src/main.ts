import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';

import { transactionIdMiddleware } from './common/middleware';
import { AppModule } from './app.module';

async function bootstrap() {
  Logger.log(`basic-backend] port: ${process.env.PORT}`);
  Logger.log(`basic-backend] broker: ${process.env.KAFKA_BROKER}`);

  const app = await NestFactory.create(AppModule);
  app.use(transactionIdMiddleware);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
