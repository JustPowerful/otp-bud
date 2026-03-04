import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { TemplateService } from 'src/template/template.service';

@Injectable()
export class TemplateOwnershipGuard implements CanActivate {
  constructor(private readonly templateService: TemplateService) {}
  canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user) throw new UnauthorizedException('User not authenticated');

    const templateId =
      request.params.templateId ||
      request.body.templateId ||
      request.query.templateId;

    if (!templateId) {
      throw new UnauthorizedException('Template ID not provided');
    }

    return this.templateService.userOwnsTemplate(templateId, user.id);
  }
}
