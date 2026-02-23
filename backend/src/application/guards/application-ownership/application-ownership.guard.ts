import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ApplicationService } from 'src/application/application.service';

@Injectable()
export class ApplicationOwnershipGuard implements CanActivate {
  constructor(private readonly applicationService: ApplicationService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }
    const applicationId =
      request.params.applicationId ||
      request.body.applicationId ||
      request.query.applicationId;
    if (!applicationId) {
      throw new BadRequestException('Application ID is required');
    }
    // Here you would typically check if the user owns the application
    const isOwner = await this.applicationService.validateOwnership(
      applicationId,
      user.id,
    );
    if (!isOwner) {
      throw new ForbiddenException('User does not own this application');
    }
    return true;
  }
}
