import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    // даёт интеграцию с Passport.js. чтобы nest зарегал PassportStrategy и чтобы работал AuthGuard, в данном модуле (здесь обьявена стратегия) дожен быть этот импорт
    PassportModule,
    // создает JwtService, который будет использоваться для генерации и валидации JWT токенов в auth.service.ts
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        // секрет для подписи JWT
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          // срок жизни токена
          expiresIn: `${configService.get<number>('JWT_EXPIRATION', 3600)}s`,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
