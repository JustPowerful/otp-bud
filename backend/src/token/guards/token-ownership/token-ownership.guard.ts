import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { TokenService } from 'src/token/token.service';

@Injectable()
export class TokenOwnershipGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user; // Assuming user is attached to the request by AuthGuard

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const token =
      request.params.token || request.body.token || request.query.token; // Get token from params, body, or query

    if (!token) {
      throw new NotFoundException('Token not found in request');
    }

    return this.tokenService.userOwnsToken(token, user.id);
  }
}
