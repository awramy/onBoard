import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TechnologiesModule } from './technologies/technologies.module';
import { TopicsModule } from './topics/topics.module';
import { QuestionsModule } from './questions/questions.module';
import { UsersModule } from './users/users.module';
import { SessionsModule } from './sessions/sessions.module';
import { ProgressModule } from './progress/progress.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    TechnologiesModule,
    TopicsModule,
    QuestionsModule,
    UsersModule,
    ProgressModule,
    SessionsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
