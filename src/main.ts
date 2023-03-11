import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.connectMicroservice({
        transport: Transport.KAFKA,
        options: {
            client: {
                brokers: [
                    `${process.env.KAFKA_HOSTNAME}:${process.env.KAFKA_PORT}`,
                ],
            },
        },
    });

    app.useGlobalPipes(new ValidationPipe());

    await app.startAllMicroservices();

    await app.listen(3000);
}
bootstrap();
