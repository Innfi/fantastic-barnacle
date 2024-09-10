import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  Logger.log(`basic-backend] port: ${process.env.PORT}`);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
