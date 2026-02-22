import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.get('authorization');
    if (!authHeader) throw new UnauthorizedException('Token not provided');

    const [tokenType, token] = authHeader.split(' ');
    if (tokenType !== 'Bearer' || !token)
      throw new UnauthorizedException('Invalid token');

    try {
      const payload = await this.authService.validateToken(token);
      if (!payload) {
        throw new UnauthorizedException('Invalid token');
      }
      request.user = payload;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new UnauthorizedException(error.message);
      }
    }
    return true;
  }
}
