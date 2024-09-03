import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  Logger.log(`basic-backend] port: ${process.env.PORT}`);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
