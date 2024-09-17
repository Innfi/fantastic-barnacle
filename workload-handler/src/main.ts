import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';

import { AppModule } from './app.module';

async function bootstrap() {
  Logger.log(`---- ${process.env.MONGODB_URL}`);

  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT || 3010);
}
bootstrap();
