jest.mock('src/lib/prisma');

import {
  BadRequestException,
  ExecutionContext,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { prisma } from 'src/lib/prisma';
import { ValidateTokenKeyGuard } from './validate-token-key.guard';

const makeContext = (request: any) =>
  ({ switchToHttp: () => ({ getRequest: () => request }) }) as ExecutionContext;

describe('ValidateTokenKeyGuard', () => {
  let guard: ValidateTokenKeyGuard;

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new ValidateTokenKeyGuard();
  });

  it('should be defined', () => expect(guard).toBeDefined());

  it('should authorize an API token owned by the application owner', async () => {
    const request = { body: { token: 'api-token', applicationId: 'app-id' } };
    jest.mocked(prisma.application.findUnique).mockResolvedValue({
      id: 'app-id',
      owner: { id: 'user-id' },
    } as never);
    jest.mocked(prisma.token.findFirst).mockResolvedValue({
      token: 'api-token',
      user: { id: 'user-id' },
    } as never);

    await expect(guard.canActivate(makeContext(request))).resolves.toBe(true);
    expect(prisma.application.findUnique).toHaveBeenCalledWith({
      where: { id: 'app-id' },
      include: { owner: { select: { id: true } } },
    });
    expect(prisma.token.findFirst).toHaveBeenCalledWith({
      where: { token: 'api-token' },
      include: { user: { select: { id: true } } },
    });
  });

  it('should reject when the API token is missing', async () => {
    await expect(
      guard.canActivate(makeContext({ body: { applicationId: 'app-id' } })),
    ).rejects.toThrow(new UnauthorizedException('Token key is missing'));
    expect(prisma.application.findUnique).not.toHaveBeenCalled();
  });

  it('should reject when the application ID is missing', async () => {
    await expect(
      guard.canActivate(makeContext({ body: { token: 'api-token' } })),
    ).rejects.toThrow(new BadRequestException('Application ID is missing'));
    expect(prisma.application.findUnique).not.toHaveBeenCalled();
  });

  it('should reject when the application does not exist', async () => {
    jest.mocked(prisma.application.findUnique).mockResolvedValue(null);

    await expect(
      guard.canActivate(
        makeContext({ body: { token: 'api-token', applicationId: 'missing' } }),
      ),
    ).rejects.toThrow(
      new NotFoundException('Application not found with the given ID'),
    );
    expect(prisma.token.findFirst).not.toHaveBeenCalled();
  });

  it('should reject when the API token does not exist', async () => {
    jest.mocked(prisma.application.findUnique).mockResolvedValue({
      id: 'app-id',
      owner: { id: 'user-id' },
    } as never);
    jest.mocked(prisma.token.findFirst).mockResolvedValue(null);

    await expect(
      guard.canActivate(
        makeContext({
          body: { token: 'missing-token', applicationId: 'app-id' },
        }),
      ),
    ).rejects.toThrow(new UnauthorizedException('Invalid token key'));
  });

  it('should reject when the token owner is not the application owner', async () => {
    jest.mocked(prisma.application.findUnique).mockResolvedValue({
      id: 'app-id',
      owner: { id: 'owner-id' },
    } as never);
    jest.mocked(prisma.token.findFirst).mockResolvedValue({
      user: { id: 'different-user-id' },
    } as never);

    await expect(
      guard.canActivate(
        makeContext({ body: { token: 'api-token', applicationId: 'app-id' } }),
      ),
    ).rejects.toThrow(
      new UnauthorizedException(
        'Application does not belong to the user with the provided token',
      ),
    );
  });
});
