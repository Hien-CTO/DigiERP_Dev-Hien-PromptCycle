import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./presentation/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: process.env.CORS_CREDENTIALS === 'true' || process.env.CORS_CREDENTIALS !== 'false',
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle("Product Service API")
    .setDescription("Product Service API for DigiERP")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/v1/docs", app, document);

  const port = process.env.PORT || 3002;
  await app.listen(port);
  console.log(`Product Service is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api/v1/docs`);
}

bootstrap();
