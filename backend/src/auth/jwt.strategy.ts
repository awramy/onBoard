import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

// стратегия Passport для проверки jwt. используется в модуле как провайдер, чтобы и passport могли ее юзать, когда на роуте висит AuthGuard
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      // задаем конфиг для стратегии
      // извлекаем токен из заголовка Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // не игнорируем срок жизни токена (токен с истекшим сроком не пройдёт валидацию)
      ignoreExpiration: false,
      // секрет для проверки подписи JWT
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  // валидация токена
  async validate(payload: { sub: string; email: string }) {
    // ищем пользователя в базе данных по id из токена
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    return { id: user.id, email: user.email, username: user.username };
  }
}
