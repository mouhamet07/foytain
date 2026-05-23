import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { execSync } from 'child_process';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

function runMigrations(): void {
  if (process.env.NODE_ENV !== 'production') return;

  if (!process.env.DATABASE_URL) {
    console.error('[migrations] DATABASE_URL is not set — aborting');
    process.exit(1);
  }

  console.log('[migrations] Running prisma migrate deploy...');
  try {
    execSync('node_modules/.bin/prisma migrate deploy', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    console.log('[migrations] Done');
  } catch (err) {
    console.error('[migrations] Failed:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

async function bootstrap() {
  runMigrations();

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);
  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  app.use(
    helmet({
      crossOriginEmbedderPolicy: nodeEnv === 'production',
      contentSecurityPolicy: nodeEnv === 'production',
    }),
  );

  app.use(compression());
  app.use(cookieParser());

  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Refresh-Token'],
    exposedHeaders: ['X-Total-Count'],
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      stopAtFirstError: false,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Foytain API')
      .setDescription('API pour Foytain — Plateforme de tontine médicale')
      .setVersion('1.0.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', name: 'Authorization' },
        'JWT-auth',
      )
      .addTag('Auth')
      .addTag('Users')
      .addTag('Tontines')
      .addTag('Memberships')
      .addTag('Contributions')
      .addTag('Payments')
      .addTag('Medical Requests')
      .addTag('Votes')
      .addTag('Notifications')
      .addTag('Dashboard')
      .addTag('Admin')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  await app.listen(port, '0.0.0.0');

  console.log(`Foytain API listening on port ${port}`);
}

bootstrap().catch((err) => {
  console.error('Fatal error during bootstrap:', err);
  process.exit(1);
});
