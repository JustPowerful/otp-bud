import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private redisClient: Redis;

  onModuleInit() {
    this.redisClient = new Redis({
      host: 'localhost',
      port: 6379,
    });
    console.log('Connected to Redis server.');
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
