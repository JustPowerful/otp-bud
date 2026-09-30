jest.mock('src/lib/prisma');

import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { prisma } from 'src/lib/prisma';
import { PaginationDto } from 'src/common/dto/pagination.dto';

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TokenService],
    }).compile();

    service = module.get<TokenService>(TokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getToken', () => {
    it('should return a token object when a valid token is provided', async () => {
      // Mock the prisma prisma.token.findUnique
      const mockToken = 'valid-token';

      const mockData = {
        id: 'token-id',
        token: 'valid-token',
        userId: 'user-id',
        expiresAt: new Date(),
      };

      jest.mocked(prisma.token.findUnique).mockResolvedValue(mockData);

      const result = await service.getToken(mockToken);

      expect(prisma.token.findUnique).toHaveBeenCalledWith({
        where: { token: mockToken },
      });

      expect(result).toEqual(mockData);
    });
  });

  describe('paginateTokens', () => {
    it('should return paginated tokens for a specific user', async () => {
      const userId = 'user-id';
      const paginationParams = {
        page: 1,
        limit: 5,
        query: 'token',
        skip: 0,
      };
      const mockTokens = [
        {
          id: 'token-id-1',
          token: 'token-1',
          userId: userId,
          expiresAt: new Date(),
        },
        {
          id: 'token-id-2',
          token: 'token-2',
          userId: userId,
          expiresAt: new Date(),
        },
      ];
      const mockTotal = 2;

      // Set the mock implementation for prisma.token.findMany and prisma.token.count to return the mock data
      jest.mocked(prisma.token.findMany).mockResolvedValue(mockTokens);
      jest.mocked(prisma.token.count).mockResolvedValue(mockTotal);

      const result = await service.paginateTokens(userId, paginationParams);

      expect(prisma.token.findMany).toHaveBeenCalledWith({
        where: { userId, token: { contains: 'token', mode: 'insensitive' } },
        skip: 0,
        take: 5,
      });

      expect(prisma.token.count).toHaveBeenCalledWith({
        where: { userId, token: { contains: 'token', mode: 'insensitive' } },
      });

      expect(result).toEqual({
        items: mockTokens,
        total: mockTotal,
        page: 1,
        limit: 5,
        totalPages: Math.ceil(mockTotal / 5),
      });
    });

    it('should use pagination defaults when no parameters are provided', async () => {
      jest.mocked(prisma.token.findMany).mockResolvedValue([]);
      jest.mocked(prisma.token.count).mockResolvedValue(0);

      const result = await service.paginateTokens('user-id', new PaginationDto());

      expect(prisma.token.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
        skip: 0,
        take: 5,
      });
      expect(prisma.token.count).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
      });
      expect(result).toEqual({
        items: [],
        total: 0,
        page: 1,
        limit: 5,
        totalPages: 0,
      });
    });

    it('should use the fallback take value when the limit is zero', async () => {
      jest.mocked(prisma.token.findMany).mockResolvedValue([]);
      jest.mocked(prisma.token.count).mockResolvedValue(0);

      await service.paginateTokens('user-id', {
        page: 1,
        limit: 0,
        query: '',
        skip: 0,
      });

      expect(prisma.token.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
        skip: 0,
        take: 10,
      });
    });
  });
  describe('userOwnsToken', () => {
    it('should return true if the user is the owner of the token', async () => {
      const token = 'valid-token';
      const userId = 'user-id';

      const mockData = {
        id: 'token-id',
        token,
        userId,
        expiresAt: new Date(),
      };

      jest.mocked(prisma.token.findUnique).mockResolvedValue(mockData);

      const result = await service.userOwnsToken(token, userId);

      expect(prisma.token.findUnique).toHaveBeenCalledWith({
        where: { token, userId },
      });

      expect(result).toBe(true);
    });
    it('should return false if the user is not the owner of the token', async () => {
      const token = 'valid-token';
      const userId = 'user-id';

      // if the token does not exist or the user is not the owner, prisma.token.findUnique
      // will return null, so we mock it to return null
      jest.mocked(prisma.token.findUnique).mockResolvedValue(null);

      const result = await service.userOwnsToken(token, userId);

      expect(prisma.token.findUnique).toHaveBeenCalledWith({
        where: { token, userId },
      });

      expect(result).toBe(false);
    });
  });
  describe('createToken', () => {
    it('should create a new token for the user', async () => {
      const userId = 'user-id';
      const expiresIn = 3600; // 1 hour

      const mockData = {
        id: 'token-id',
        token: 'generated-token',
        userId,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
      };

      jest.mocked(prisma.token.create).mockResolvedValue(mockData);

      const result = await service.createToken(userId, expiresIn);

      expect(prisma.token.create).toHaveBeenCalledWith({
        data: {
          token: expect.any(String),
          userId,
          expiresAt: expect.any(Date),
        },
      });
      expect(result).toEqual(mockData);
    });

    it('should create a token without an expiration when expiresIn is omitted', async () => {
      const userId = 'user-id';
      const mockData = {
        id: 'token-id',
        token: 'generated-token',
        userId,
        expiresAt: null,
      };
      jest.mocked(prisma.token.create).mockResolvedValue(mockData);

      const result = await service.createToken(userId);

      expect(prisma.token.create).toHaveBeenCalledWith({
        data: {
          token: expect.any(String),
          userId,
          expiresAt: null,
        },
      });
      expect(result).toEqual(mockData);
    });
  });
  describe('revokeToken', () => {
    it('should delete the token from the database', async () => {
      const token = 'valid-token';
      const mockData = {
        id: 'token-id',
        token,
        userId: 'user-id',
        expiresAt: new Date(),
      };

      jest.mocked(prisma.token.delete).mockResolvedValue(mockData);

      const result = await service.revokeToken(token);

      expect(prisma.token.delete).toHaveBeenCalledWith({
        where: { token },
      });

      expect(result).toEqual(mockData);
    });
  });
});
