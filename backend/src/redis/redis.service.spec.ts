jest.mock('ioredis', () => {
  const mRedis = {
    on: jest.fn(),
    setex: jest.fn(),
    set: jest.fn(),
    get: jest.fn(),
    expire: jest.fn(),
    del: jest.fn(),
    disconnect: jest.fn(),
  };
  return jest.fn(() => mRedis);
});

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

describe('RedisService', () => {
  let service: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('set', () => {
    it('should set a key-value pair in Redis', async () => {
      const key = 'test-key';
      const value = 'test-value';
      const ttl = 60; // Time to live in seconds

      // Mock the Redis client's setex method
      const mockSetex = jest.fn();
      service['redisClient'] = {
        setex: mockSetex,
      } as any;

      await service.set(key, value, ttl);

      // Assert that the setex method was called with the correct arguments
      expect(mockSetex).toHaveBeenCalledWith(key, ttl, value);
    });
  });

  describe('get', () => {
    it('should get a value from Redis by key', async () => {
      const key = 'test-key';
      const expectedValue = 'test-value';

      // Mock the Redis client's get method
      const mockGet = jest.fn().mockResolvedValue(expectedValue);
      service['redisClient'] = {
        get: mockGet,
      } as any;

      const result = await service.get(key);

      // Assert that the get method was called with the correct key
      expect(mockGet).toHaveBeenCalledWith(key);
      // Assert that the result is as expected
      expect(result).toBe(expectedValue);
    });
  });

  describe('expire', () => {
    it('should set the expiration time for a key in Redis', async () => {
      const key = 'test-key';
      const ttl = 60; // Time to live in seconds

      // Mock the Redis client's expire method
      const mockExpire = jest.fn();
      service['redisClient'] = {
        expire: mockExpire,
      } as any;

      await service.expire(key, ttl);

      // Assert that the expire method was called with the correct arguments
      expect(mockExpire).toHaveBeenCalledWith(key, ttl);
    });
  });

  describe('del', () => {
    it('should delete a key from Redis', async () => {
      const key = 'test-key';

      // Mock the Redis client's del method
      const mockDel = jest.fn();
      service['redisClient'] = {
        del: mockDel,
      } as any;

      await service.del(key);

      // Assert that the del method was called with the correct key
      expect(mockDel).toHaveBeenCalledWith(key);
    });
  });
});
