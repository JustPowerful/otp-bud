import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const options: RedisOptions = {
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: Number(this.configService.get<number>('REDIS_PORT', 6379)),
    };
    const password = this.configService.get<string>('REDIS_PASSWORD');
    if (password) {
      options.password = password;
    }

    this.redisClient = new Redis(options);
    this.redisClient.on('connect', () => {
      console.log('Connected to Redis server.');
    });
    this.redisClient.on('error', (error) => {
      console.error('Redis error event:', error);
    });
  }

  onModuleDestroy() {
    if (this.redisClient) {
      this.redisClient.disconnect();
    }
  }

  async set(key: string, value: string, ttl?: number) {
    if (ttl) {
      await this.redisClient.setex(key, ttl, value);
    } else {
      await this.redisClient.set(key, value);
    }
  }

  async get(key: string) {
    return await this.redisClient.get(key);
  }

  async expire(key: string, ttl: number) {
    await this.redisClient.expire(key, ttl);
  }

  async del(key: string) {
    await this.redisClient.del(key);
  }
}
