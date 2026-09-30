jest.mock('src/lib/prisma');
jest.mock('argon2', () => ({
  hash: jest.fn(),
  verify: jest.fn(),
}));
jest.mock('jsonwebtoken', () => ({
  ...jest.requireActual('jsonwebtoken'),
  sign: jest.fn(),
  verify: jest.fn(),
}));

import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';
import { prisma } from 'src/lib/prisma';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  const originalJwtSecret = process.env.JWT_SECRET;

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-jwt-secret';

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterAll(() => {
    if (originalJwtSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalJwtSecret;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      firstname: 'Ada',
      lastname: 'Lovelace',
      email: 'ada@example.com',
      password: 'plain-password',
    };

    it('should create an account and its user', async () => {
      jest.mocked(prisma.account.findUnique).mockResolvedValue(null);
      jest.mocked(argon2.hash).mockResolvedValue('hashed-password');
      jest
        .mocked(prisma.account.create)
        .mockResolvedValue({ id: 'account-id' } as never);
      jest
        .mocked(prisma.user.create)
        .mockResolvedValue({ id: 'user-id' } as never);

      await service.register(registerDto);

      expect(prisma.account.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(argon2.hash).toHaveBeenCalledWith(registerDto.password);
      expect(prisma.account.create).toHaveBeenCalledWith({
        data: { email: registerDto.email, password: 'hashed-password' },
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          firstname: registerDto.firstname,
          lastname: registerDto.lastname,
          accountId: 'account-id',
        },
      });
    });

    it('should throw if an account with the email already exists', async () => {
      jest
        .mocked(prisma.account.findUnique)
        .mockResolvedValue({ id: 'existing-account-id' } as never);

      await expect(service.register(registerDto)).rejects.toThrow(
        'Account with this email already exists',
      );

      expect(argon2.hash).not.toHaveBeenCalled();
      expect(prisma.account.create).not.toHaveBeenCalled();
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto = { email: 'ada@example.com', password: 'plain-password' };
    const account = {
      id: 'account-id',
      email: loginDto.email,
      password: 'hashed-password',
      user: [{ firstname: 'Ada', lastname: 'Lovelace' }],
    };

    it('should return a signed token and user details for valid credentials', async () => {
      jest
        .mocked(prisma.account.findUnique)
        .mockResolvedValue(account as never);
      jest.mocked(argon2.verify).mockResolvedValue(true);
      jest.mocked(jwt.sign).mockReturnValue('signed-token' as never);

      const result = await service.login(loginDto);

      expect(prisma.account.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
        include: { user: { select: { firstname: true, lastname: true } } },
      });
      expect(argon2.verify).toHaveBeenCalledWith(
        account.password,
        loginDto.password,
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        { accountId: account.id, email: account.email },
        'test-jwt-secret',
      );
      expect(result).toEqual({
        token: 'signed-token',
        user: {
          firstname: 'Ada',
          lastname: 'Lovelace',
          email: loginDto.email,
        },
      });
    });

    it('should reject when the account does not exist', async () => {
      jest.mocked(prisma.account.findUnique).mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid email or password'),
      );
      expect(argon2.verify).not.toHaveBeenCalled();
    });

    it('should reject when the password is invalid', async () => {
      jest
        .mocked(prisma.account.findUnique)
        .mockResolvedValue(account as never);
      jest.mocked(argon2.verify).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid email or password'),
      );
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should throw when JWT_SECRET is not configured', async () => {
      delete process.env.JWT_SECRET;
      jest
        .mocked(prisma.account.findUnique)
        .mockResolvedValue(account as never);
      jest.mocked(argon2.verify).mockResolvedValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(
        'JWT_SECRET is not configured',
      );
    });
  });

  describe('validateToken', () => {
    it('should return the user payload for a valid token', async () => {
      jest.mocked(jwt.verify).mockReturnValue({
        accountId: 'account-id',
        email: 'ada@example.com',
      } as never);
      jest.mocked(prisma.account.findUnique).mockResolvedValue({
        id: 'account-id',
        email: 'ada@example.com',
        user: [{ id: 'user-id' }],
      } as never);

      const result = await service.validateToken('valid-token');

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-jwt-secret');
      expect(prisma.account.findUnique).toHaveBeenCalledWith({
        where: { id: 'account-id' },
        include: { user: true },
      });
      expect(result).toEqual({ id: 'user-id', email: 'ada@example.com' });
    });

    it('should throw when JWT_SECRET is not configured', async () => {
      delete process.env.JWT_SECRET;

      await expect(service.validateToken('valid-token')).rejects.toThrow(
        'JWT_SECRET is not configured',
      );
      expect(jwt.verify).not.toHaveBeenCalled();
    });

    it('should throw for an invalid token', async () => {
      jest.mocked(jwt.verify).mockImplementation(() => {
        throw new jwt.JsonWebTokenError('invalid token');
      });

      await expect(service.validateToken('invalid-token')).rejects.toThrow(
        'Invalid token',
      );
    });

    it('should return undefined when the token account does not exist', async () => {
      jest
        .mocked(jwt.verify)
        .mockReturnValue({ accountId: 'missing-id' } as never);
      jest.mocked(prisma.account.findUnique).mockResolvedValue(null);

      await expect(
        service.validateToken('valid-token'),
      ).resolves.toBeUndefined();
    });

    it('should return undefined when the token account has no user', async () => {
      jest
        .mocked(jwt.verify)
        .mockReturnValue({ accountId: 'account-id' } as never);
      jest.mocked(prisma.account.findUnique).mockResolvedValue({
        id: 'account-id',
        email: 'ada@example.com',
        user: [],
      } as never);

      await expect(
        service.validateToken('valid-token'),
      ).resolves.toBeUndefined();
    });
  });
});
