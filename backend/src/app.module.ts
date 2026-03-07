import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TechnologiesModule } from './technologies/technologies.module';
import { SessionsModule } from './sessions/sessions.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    // Конфиг модуль, позволяет использовать env var в проекте (глобально импортим - можем юзать в модулях без импорта)
    ConfigModule.forRoot({ isGlobal: true }),
    // Не более 100 запросов в минуту от одного IP
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    TechnologiesModule,
    SessionsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
