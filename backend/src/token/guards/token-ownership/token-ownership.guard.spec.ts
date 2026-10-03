import {
  ExecutionContext,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenService } from 'src/token/token.service';
import { TokenOwnershipGuard } from './token-ownership.guard';

const makeContext = (request: any) =>
  ({ switchToHttp: () => ({ getRequest: () => request }) }) as ExecutionContext;

describe('TokenOwnershipGuard', () => {
  let guard: TokenOwnershipGuard;
  let tokenService: { userOwnsToken: jest.Mock };

  beforeEach(() => {
    tokenService = { userOwnsToken: jest.fn() };
    guard = new TokenOwnershipGuard(tokenService as unknown as TokenService);
  });

  it('should authorize a token owned by the current user', async () => {
    tokenService.userOwnsToken.mockResolvedValue(true);

    await expect(
      guard.canActivate(
        makeContext({
          user: { id: 'user-id' },
          params: { token: 'token-value' },
          body: {},
          query: {},
        }),
      ),
    ).resolves.toBe(true);
    expect(tokenService.userOwnsToken).toHaveBeenCalledWith(
      'token-value',
      'user-id',
    );
  });

  it('should reject unauthenticated requests', async () => {
    expect(() =>
      guard.canActivate(makeContext({ params: {}, body: {}, query: {} })),
    ).toThrow(new UnauthorizedException('User not authenticated'));
    expect(tokenService.userOwnsToken).not.toHaveBeenCalled();
  });

  it('should reject requests without a token', async () => {
    expect(() =>
      guard.canActivate(
        makeContext({
          user: { id: 'user-id' },
          params: {},
          body: {},
          query: {},
        }),
      ),
    ).toThrow(new NotFoundException('Token not found in request'));
  });

  it.each([
    [
      'body',
      { params: {}, body: { token: 'body-token' }, query: {} },
      'body-token',
    ],
    [
      'query',
      { params: {}, body: {}, query: { token: 'query-token' } },
      'query-token',
    ],
  ])(
    'should read the token from the %s when params omit it',
    async (_source, fields, token) => {
      tokenService.userOwnsToken.mockResolvedValue(true);

      await expect(
        guard.canActivate(makeContext({ user: { id: 'user-id' }, ...fields })),
      ).resolves.toBe(true);
      expect(tokenService.userOwnsToken).toHaveBeenCalledWith(token, 'user-id');
    },
  );

  it('should return false when the token belongs to a different user', async () => {
    tokenService.userOwnsToken.mockResolvedValue(false);

    await expect(
      guard.canActivate(
        makeContext({
          user: { id: 'user-id' },
          params: { token: 'token-value' },
          body: {},
          query: {},
        }),
      ),
    ).resolves.toBe(false);
  });
});
