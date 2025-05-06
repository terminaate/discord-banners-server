import './sentry';

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
  const configService = app.get<ConfigService>(ConfigService);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const PORT = +configService.get('PORT', 3000);

  await app.listen(PORT);

  console.log(`Server listening on http://127.0.0.1:${PORT}`);
}

void bootstrap();
