import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { prisma } from 'src/lib/prisma';

@Injectable()
export class ValidateTokenKeyGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.body.token; // get the API key (token) from the request body
    console.log('Received token key:', token);
    const applicationId = request.body.applicationId;
    if (!token) throw new UnauthorizedException('Token key is missing');
    if (!applicationId)
      throw new BadRequestException('Application ID is missing');
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        owner: {
          select: {
            id: true,
          },
        },
      },
    });
    if (!application)
      throw new NotFoundException('Application not found with the given ID');
    const tokenRecord = await prisma.token.findFirst({
      where: {
        token,
      },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });
    if (!tokenRecord) throw new UnauthorizedException('Invalid token key');
    // verify that the application belongs to the user having the API key (token)
    if (application.owner.id !== tokenRecord.user.id) {
      throw new UnauthorizedException(
        'Application does not belong to the user with the provided token',
      );
    }
    return true;
  }
}
