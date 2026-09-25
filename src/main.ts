import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { Env } from './config/env.schema';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService<Env, true>);
  const logger = app.get(Logger);

  app.useLogger(logger);
  app.use(helmet());
  app.use(compression());
  app.enableCors({ methods: ['GET'] });
  app.setGlobalPrefix('v1', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableShutdownHooks();

  const swaggerPath = config.get('SWAGGER_PATH', { infer: true });
  if (config.get('SWAGGER_ENABLED', { infer: true })) {
    // The spec changes with every deploy, so the browser must revalidate it
    // rather than render a cached copy that is missing the newest parameters.
    const documentUrls = new Set([
      `/${swaggerPath}`,
      `/${swaggerPath}/`,
      `/${swaggerPath}-json`,
      `/${swaggerPath}-yaml`,
    ]);
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (documentUrls.has(req.path)) res.setHeader('Cache-Control', 'no-cache');
      next();
    });

    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('Unified Cricket API')
        .setDescription(
          'Read-only cricket pages. Search by name, then open one match, player, or team.',
        )
        .setVersion('0.1.0')
        .build(),
    );
    SwaggerModule.setup(swaggerPath, app, document);
  }

  const port = config.get('PORT', { infer: true });
  await app.listen(port);
  logger.log(`Unified Cricket API listening on http://localhost:${port}`, 'Bootstrap');
}

void bootstrap();
