import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8081',
      'http://192.168.31.250:8081',
      // 'https://46f15df399d8.ngrok-free.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
  });

  // Set global prefix for all routes
  app.setGlobalPrefix('api');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        console.log('Validation errors:', JSON.stringify(errors, null, 2));
        return new ValidationPipe().createExceptionFactory()(errors);
      },
    }),
  );

  // Swagger documentation (only in development)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Muktsar NGO API')
      .setDescription('API for Muktsar NGO Admin Panel and Website')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // Get Prisma service and enable shutdown hooks
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  // Graceful shutdown handling
  process.on('SIGINT', async () => {
    console.log('Received SIGINT, shutting down gracefully...');
    await app.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    await app.close();
    process.exit(0);
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Application is running on port: ${port}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`);
  }
}

bootstrap();
