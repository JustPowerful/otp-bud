import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { ApplicationService } from 'src/application/application.service';
import { ApplicationOwnershipGuard } from './application-ownership.guard';

const makeContext = (request: any) =>
  ({ switchToHttp: () => ({ getRequest: () => request }) }) as ExecutionContext;

describe('ApplicationOwnershipGuard', () => {
  let guard: ApplicationOwnershipGuard;
  let applicationService: { validateOwnership: jest.Mock };

  beforeEach(() => {
    applicationService = { validateOwnership: jest.fn() };
    guard = new ApplicationOwnershipGuard(
      applicationService as unknown as ApplicationService,
    );
  });

  it('should authorize an application owned by the current user', async () => {
    const request = {
      user: { id: 'user-id' },
      params: { applicationId: 'app-id' },
      body: {},
      query: {},
    };
    applicationService.validateOwnership.mockResolvedValue(true);

    await expect(guard.canActivate(makeContext(request))).resolves.toBe(true);
    expect(applicationService.validateOwnership).toHaveBeenCalledWith(
      'app-id',
      'user-id',
    );
  });

  it('should reject unauthenticated requests', async () => {
    await expect(
      guard.canActivate(makeContext({ params: {}, body: {}, query: {} })),
    ).rejects.toThrow(new UnauthorizedException('User not authenticated'));
    expect(applicationService.validateOwnership).not.toHaveBeenCalled();
  });

  it('should reject requests without an application ID', async () => {
    await expect(
      guard.canActivate(
        makeContext({
          user: { id: 'user-id' },
          params: {},
          body: {},
          query: {},
        }),
      ),
    ).rejects.toThrow(new BadRequestException('Application ID is required'));
  });

  it.each([
    [
      'body',
      { params: {}, body: { applicationId: 'app-body' }, query: {} },
      'app-body',
    ],
    [
      'query',
      { params: {}, body: {}, query: { applicationId: 'app-query' } },
      'app-query',
    ],
  ])(
    'should read the application ID from the %s when params omit it',
    async (_source, fields, id) => {
      applicationService.validateOwnership.mockResolvedValue(true);

      await expect(
        guard.canActivate(makeContext({ user: { id: 'user-id' }, ...fields })),
      ).resolves.toBe(true);
      expect(applicationService.validateOwnership).toHaveBeenCalledWith(
        id,
        'user-id',
      );
    },
  );

  it('should reject when the user does not own the application', async () => {
    applicationService.validateOwnership.mockResolvedValue(false);

    await expect(
      guard.canActivate(
        makeContext({
          user: { id: 'user-id' },
          params: { applicationId: 'app-id' },
          body: {},
          query: {},
        }),
      ),
    ).rejects.toThrow(
      new ForbiddenException('User does not own this application'),
    );
  });
});
