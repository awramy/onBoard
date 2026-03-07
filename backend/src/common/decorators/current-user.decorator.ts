import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

// Декоратор для получения текущего пользователя из request.user
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user;
  },
);
