import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Выставляем безопасные https заголовки ответов
  app.use(helmet());
  // Разрешаем ходить с других источников в наше api (ограничить список для prod)
  app.enableCors();
  // Пайп, валидирующий входящие данные по dto (whitelist - отбрасываем из вход. данных поля которых нет в dto, transform - авто приведение типов (например строки в число по dto))
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('onBoard API')
    .setDescription('AI-powered interview preparation service')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application running on: http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}
void bootstrap();
