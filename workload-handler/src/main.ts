import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { AppModule } from './app.module';

async function bootstrap() {
  Logger.log(`workload-handler] port: ${process.env.PORT}`);
  Logger.log(`workload-handler] broker: ${process.env.KAFKA_BROKER}`);

  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'workload-handler',
        brokers: [process.env.KAFKA_BROKER ?? 'localhost:9092'],
      },
      consumer: {
        groupId: 'barnacle1',
      },
    },
  });

  await app.listen(process.env.PORT || 3010);
}
bootstrap();
