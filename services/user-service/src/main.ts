import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { join } from 'path';
import * as express from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  
  // Get Express instance to configure static files
  const expressApp = app.getHttpAdapter().getInstance();
  
  // Serve static files using Express static middleware directly
  // This ensures static files are served correctly regardless of global prefix
  const uploadsPath = join(process.cwd(), 'uploads');
  expressApp.use('/uploads', express.static(uploadsPath, {
    maxAge: '1d', // Cache for 1 day
    etag: true,
    lastModified: true,
  }));

  // Security middleware
  // Configure helmet to allow static files
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "http://localhost:3001", "http://localhost:4000"],
      },
    },
  }));
  app.use(compression());
  app.use(cookieParser());

  // CORS configuration - allow from API Gateway and frontend
  app.enableCors({
    origin: [
      configService.get<string>('CORS_ORIGIN', 'http://localhost:3000'),
      'http://localhost:4000', // API Gateway
    ],
    credentials: configService.get<boolean>('CORS_CREDENTIALS', true),
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // API prefix - exclude static files from prefix
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix, {
    exclude: ['/uploads/(.*)'], // Exclude uploads from global prefix
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('User Service API')
    .setDescription('User Management and Authentication Service for DigiERP')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  // Start server
  const port = configService.get<number>('PORT', 3001);
  const baseUrl = configService.get<string>('BASE_URL', `http://localhost:${port}`);
  
  await app.listen(port);
  
  console.log(`🚀 User Service is running on: ${baseUrl}/${apiPrefix}`);
  console.log(`📁 Uploads directory: ${baseUrl}/uploads/avatars/`);
  console.log(`📚 API Documentation: ${baseUrl}/${apiPrefix}/docs`);
}

bootstrap();
