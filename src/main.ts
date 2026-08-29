import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const host = process.env.MODEL_ROUTER_HOST ?? '127.0.0.1';
  const port = Number(process.env.MODEL_ROUTER_PORT ?? 3900);

  await app.listen(port, host);

  console.log(`Model Router v0.1.0`);
  console.log(`Listening on http://${host}:${port}/v1`);
}

bootstrap();
