import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SetupLogger } from './core/setup-logger';
import { SwaggerLoader } from './core/swagger.loader';

const SERVER_PORT = 3000;

async function bootstrap() {
  const app = await NestFactory.create(await AppModule.register());

  await SwaggerLoader.setupSwagger(app);

  await app.listen(SERVER_PORT);

  SetupLogger.logServerStart(SERVER_PORT);
}

void bootstrap();
