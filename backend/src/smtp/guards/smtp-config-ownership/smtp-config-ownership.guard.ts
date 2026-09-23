import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SmtpService } from 'src/smtp/smtp.service';

@Injectable()
export class SmtpConfigOwnershipGuard implements CanActivate {
  constructor(private readonly smtpService: SmtpService) {}
  canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new UnauthorizedException('User not authenticated');

    const smtpConfigId =
      request.params.smtpConfigId ||
      request.body.smtpConfigId ||
      request.query.smtpConfigId;

    if (!smtpConfigId)
      throw new UnauthorizedException('SMTP Config ID not provided');

    return this.smtpService.userOwnsSmtpConfig(smtpConfigId, user.id);
  }
}
