import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';

import { AppModule } from './app.module';

async function bootstrap() {
  Logger.log(`workload-handler] port: ${process.env.PORT}`);
  Logger.log(`workload-handler] broker: ${process.env.KAFKA_BROKER}`);

  const app = await NestFactory.create(AppModule);

  await app.listen(process.env.PORT || 3010);
}
bootstrap();
