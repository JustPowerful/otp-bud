import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SmtpService } from 'src/smtp/smtp.service';
import { SmtpConfigOwnershipGuard } from './smtp-config-ownership.guard';

const makeContext = (request: any) =>
  ({ switchToHttp: () => ({ getRequest: () => request }) }) as ExecutionContext;

describe('SmtpConfigOwnershipGuard', () => {
  let guard: SmtpConfigOwnershipGuard;
  let smtpService: { userOwnsSmtpConfig: jest.Mock };

  beforeEach(() => {
    smtpService = { userOwnsSmtpConfig: jest.fn() };
    guard = new SmtpConfigOwnershipGuard(smtpService as unknown as SmtpService);
  });

  it('should authorize an SMTP configuration owned by the current user', async () => {
    smtpService.userOwnsSmtpConfig.mockResolvedValue(true);
    const request = {
      user: { id: 'user-id' },
      params: { smtpConfigId: 'smtp-id' },
      body: {},
      query: {},
    };

    await expect(guard.canActivate(makeContext(request))).resolves.toBe(true);
    expect(smtpService.userOwnsSmtpConfig).toHaveBeenCalledWith(
      'smtp-id',
      'user-id',
    );
  });

  it('should reject unauthenticated requests', async () => {
    expect(() =>
      guard.canActivate(makeContext({ params: {}, body: {}, query: {} })),
    ).toThrow(new UnauthorizedException('User not authenticated'));
    expect(smtpService.userOwnsSmtpConfig).not.toHaveBeenCalled();
  });

  it('should reject requests without an SMTP configuration ID', async () => {
    expect(() =>
      guard.canActivate(
        makeContext({
          user: { id: 'user-id' },
          params: {},
          body: {},
          query: {},
        }),
      ),
    ).toThrow(new UnauthorizedException('SMTP Config ID not provided'));
  });

  it.each([
    [
      'body',
      { params: {}, body: { smtpConfigId: 'body-smtp-id' }, query: {} },
      'body-smtp-id',
    ],
    [
      'query',
      { params: {}, body: {}, query: { smtpConfigId: 'query-smtp-id' } },
      'query-smtp-id',
    ],
  ])(
    'should read the configuration ID from the %s when params omit it',
    async (_source, fields, id) => {
      smtpService.userOwnsSmtpConfig.mockResolvedValue(true);

      await expect(
        guard.canActivate(makeContext({ user: { id: 'user-id' }, ...fields })),
      ).resolves.toBe(true);
      expect(smtpService.userOwnsSmtpConfig).toHaveBeenCalledWith(
        id,
        'user-id',
      );
    },
  );

  it('should return false when the user does not own the SMTP configuration', async () => {
    smtpService.userOwnsSmtpConfig.mockResolvedValue(false);

    await expect(
      guard.canActivate(
        makeContext({
          user: { id: 'user-id' },
          params: { smtpConfigId: 'smtp-id' },
          body: {},
          query: {},
        }),
      ),
    ).resolves.toBe(false);
  });
});
