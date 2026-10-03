import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

const makeContext = (request: any) =>
  ({
    switchToHttp: () => ({ getRequest: () => request }),
  }) as ExecutionContext;

describe('AuthGuard', () => {
  let authService: { validateToken: jest.Mock };
  let guard: AuthGuard;

  beforeEach(() => {
    authService = { validateToken: jest.fn() };
    guard = new AuthGuard(authService as unknown as AuthService);
  });

  it('should allow a request with a valid bearer token and attach its user', async () => {
    const user = { id: 'user-id', email: 'user@example.com' };
    const request: { get: jest.Mock; user?: typeof user } = {
      get: jest.fn().mockReturnValue('Bearer jwt-token'),
    };
    authService.validateToken.mockResolvedValue(user);

    await expect(guard.canActivate(makeContext(request))).resolves.toBe(true);

    expect(authService.validateToken).toHaveBeenCalledWith('jwt-token');
    expect(request.user).toEqual(user);
  });

  it('should reject when the authorization header is missing', async () => {
    const request = { get: jest.fn().mockReturnValue(undefined) };

    await expect(guard.canActivate(makeContext(request))).rejects.toThrow(
      new UnauthorizedException('Token not provided'),
    );
    expect(authService.validateToken).not.toHaveBeenCalled();
  });

  it.each(['Basic token', 'Bearer', 'bearer token'])(
    'should reject malformed authorization header %s',
    async (header) => {
      const request = { get: jest.fn().mockReturnValue(header) };

      await expect(guard.canActivate(makeContext(request))).rejects.toThrow(
        new UnauthorizedException('Invalid token'),
      );
      expect(authService.validateToken).not.toHaveBeenCalled();
    },
  );

  it('should reject when the token does not resolve to a user', async () => {
    const request = { get: jest.fn().mockReturnValue('Bearer invalid-token') };
    authService.validateToken.mockResolvedValue(undefined);

    await expect(guard.canActivate(makeContext(request))).rejects.toThrow(
      new UnauthorizedException('Invalid token'),
    );
  });

  it('should convert validation errors to UnauthorizedException', async () => {
    const request = { get: jest.fn().mockReturnValue('Bearer invalid-token') };
    authService.validateToken.mockRejectedValue(new Error('Invalid token'));

    await expect(guard.canActivate(makeContext(request))).rejects.toThrow(
      new UnauthorizedException('Invalid token'),
    );
  });
});
