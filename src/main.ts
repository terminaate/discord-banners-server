import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const PORT = process.env.SERVER_PORT ?? 3000;

  await app.listen(PORT);

  console.log(`Server listening on http://127.0.0.1:${PORT}`);
}

void bootstrap();
