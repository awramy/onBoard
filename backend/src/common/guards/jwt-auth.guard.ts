import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Когда на контроллере/методе стоит @UseGuards(AuthGuard('jwt')), при запросе:
// Гард вызывает стратегию 'jwt'.
// Стратегия достаёт токен из заголовка, проверяет его (secret + expiration).
// Вызывается validate(payload) из jwt.strategy.ts.
// Результат validate кладётся в request.user (теперь мы можем использовать @CurrentUser() user: { id: string } в контроллере)
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
