import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [`${process.env.KAFKA_HOSTNAME}:${process.env.KAFKA_PORT}`],
      },
    },
  });

  await app.startAllMicroservices();

  await app.listen(3000);
}
bootstrap();
