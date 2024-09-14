import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';

import { transactionIdMiddleware } from './common/middleware';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(transactionIdMiddleware);
  Logger.log(`basic-backend] port: ${process.env.PORT}`);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
