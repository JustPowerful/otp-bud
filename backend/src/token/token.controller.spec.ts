import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';
import { AuthGuard } from 'src/auth/auth.guard';
import { TokenOwnershipGuard } from './guards/token-ownership/token-ownership.guard';

describe('TokenController', () => {
  let controller: TokenController;
  let tokenService: {
    createToken: jest.Mock;
    getToken: jest.Mock;
    revokeToken: jest.Mock;
    paginateTokens: jest.Mock;
  };

  beforeEach(async () => {
    tokenService = {
      createToken: jest.fn(),
      getToken: jest.fn(),
      revokeToken: jest.fn(),
      paginateTokens: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TokenController],
      providers: [{ provide: TokenService, useValue: tokenService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(TokenOwnershipGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<TokenController>(TokenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createToken', () => {
    it('should create a token and return the success response', async () => {
      const user = { id: 'user-id', email: 'user@example.com' };
      const createTokenDto = { expirationTime: 3600 };
      const token = { id: 'token-id', token: 'generated-token' };
      tokenService.createToken.mockResolvedValue(token);

      const result = await controller.createToken(user, createTokenDto);

      expect(tokenService.createToken).toHaveBeenCalledWith('user-id', 3600);
      expect(result).toEqual({
        success: true,
        data: token,
        message: 'Token created successfully',
        meta: { expirationTime: 3600 },
      });
    });

    it('should use the permanent-token message when no expiration is provided', async () => {
      const token = { id: 'token-id', token: 'generated-token' };
      tokenService.createToken.mockResolvedValue(token);

      const result = await controller.createToken(
        { id: 'user-id', email: 'user@example.com' },
        {},
      );

      expect(tokenService.createToken).toHaveBeenCalledWith(
        'user-id',
        undefined,
      );
      expect(result.meta).toEqual({
        expirationTime: 'No expiration (permanent token)',
      });
    });
  });

  describe('getTokenDetails', () => {
    it('should return token details when the token exists', async () => {
      const token = 'token-value';
      const data = { id: 'token-id', token, userId: 'user-id' };
      tokenService.getToken.mockResolvedValue(data);

      const result = await controller.getTokenDetails(token);

      expect(tokenService.getToken).toHaveBeenCalledWith(token);
      expect(result).toEqual({
        success: true,
        message: 'Token details retrieved successfully',
        data,
      });
    });

    it('should throw NotFoundException when the token does not exist', async () => {
      tokenService.getToken.mockResolvedValue(null);

      await expect(controller.getTokenDetails('missing-token')).rejects.toThrow(
        new NotFoundException('Token not found'),
      );
      expect(tokenService.getToken).toHaveBeenCalledWith('missing-token');
    });
  });

  describe('revokeToken', () => {
    it('should revoke the token and return the success response', async () => {
      const token = 'token-value';
      const data = { id: 'token-id', token, userId: 'user-id' };
      tokenService.revokeToken.mockResolvedValue(data);

      const result = await controller.revokeToken({ id: 'user-id' }, token);

      expect(tokenService.revokeToken).toHaveBeenCalledWith(token);
      expect(result).toEqual({
        success: true,
        message: 'Token revoked successfully',
        data,
      });
    });
  });

  describe('paginateTokens', () => {
    it('should return pagination metadata with next and previous pages', async () => {
      const user = { id: 'user-id', email: 'user@example.com' };
      const paginationDto = Object.assign(new PaginationDto(), {
        page: 2,
        limit: 5,
      });
      const items = [{ id: 'token-id', token: 'token-value' }];
      tokenService.paginateTokens.mockResolvedValue({
        items,
        total: 12,
        page: 2,
        limit: 5,
      });

      const result = await controller.paginateTokens(user, paginationDto);

      expect(tokenService.paginateTokens).toHaveBeenCalledWith(
        'user-id',
        paginationDto,
      );
      expect(result).toEqual({
        success: true,
        data: items,
        message: 'Tokens paginated successfully',
        meta: { total: 12, page: 2, limit: 5, nextPage: 3, prevPage: 1 },
      });
    });

    it('should return null next and previous pages on the first and last page', async () => {
      tokenService.paginateTokens.mockResolvedValue({
        items: [],
        total: 5,
        page: 1,
        limit: 5,
      });

      const result = await controller.paginateTokens(
        { id: 'user-id', email: 'user@example.com' },
        Object.assign(new PaginationDto(), { page: 1, limit: 5 }),
      );

      expect(result.meta).toEqual({
        total: 5,
        page: 1,
        limit: 5,
        nextPage: null,
        prevPage: null,
      });
    });

    it('should use default page and limit when the service omits them', async () => {
      tokenService.paginateTokens.mockResolvedValue({
        items: [],
        total: 0,
      });

      const result = await controller.paginateTokens(
        { id: 'user-id', email: 'user@example.com' },
        new PaginationDto(),
      );

      expect(result.meta).toEqual({
        total: 0,
        page: 1,
        limit: 5,
        nextPage: null,
        prevPage: null,
      });
    });
  });
});
