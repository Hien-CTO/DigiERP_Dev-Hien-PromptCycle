import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    // Enable Redis connection
    const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);
    const redisPassword = this.configService.get<string>('REDIS_PASSWORD');

    try {
      this.client = createClient({
        socket: {
          host: redisHost,
          port: redisPort,
        },
        ...(redisPassword && { password: redisPassword }),
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });

      await this.client.connect();
      console.log(`Redis connected to ${redisHost}:${redisPort}`);
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      // Không throw error để service vẫn chạy được nếu Redis không available
    }
  }

  async onModuleDestroy() {
    if (this.client && this.client.isOpen) {
      await this.client.quit();
      console.log('Redis connection closed');
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.client || !this.client.isOpen) {
      console.warn('Redis not connected, skipping set operation');
      return;
    }
    
    try {
      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      console.error(`Failed to set Redis key ${key}:`, error);
      throw error;
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client || !this.client.isOpen) {
      console.warn('Redis not connected, returning null');
      return null;
    }
    
    try {
      const value = await this.client.get(key);
      if (typeof value === 'string') {
        return value;
      }
      return null;
    } catch (error) {
      console.error(`Failed to get Redis key ${key}:`, error);
      return null;
    }
  }

  async del(key: string): Promise<number> {
    if (!this.client || !this.client.isOpen) {
      console.warn('Redis not connected, skipping delete operation');
      return 0;
    }
    
    try {
      return await this.client.del(key);
    } catch (error) {
      console.error(`Failed to delete Redis key ${key}:`, error);
      return 0;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.client || !this.client.isOpen) {
      return false;
    }
    
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Failed to check Redis key existence ${key}:`, error);
      return false;
    }
  }

  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    if (!this.client || !this.client.isOpen) {
      return false;
    }
    
    try {
      const result = await this.client.expire(key, ttlSeconds);
      // Redis expire returns 1 if key exists and timeout was set, 0 otherwise
      return result > 0;
    } catch (error) {
      console.error(`Failed to set expire for Redis key ${key}:`, error);
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    if (!this.client || !this.client.isOpen) {
      return -1;
    }
    
    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.error(`Failed to get TTL for Redis key ${key}:`, error);
      return -1;
    }
  }

  // RefreshToken specific methods - Redis disabled
  async setRefreshToken(userId: number, token: string, ttlSeconds: number): Promise<void> {
    // Redis disabled - no operation
  }

  async getRefreshToken(userId: number): Promise<string | null> {
    // Redis disabled - return null
    return null;
  }

  async deleteRefreshToken(userId: number): Promise<boolean> {
    // Redis disabled - return false
    return false;
  }

  async isRefreshTokenValid(userId: number): Promise<boolean> {
    // Redis disabled - return false
    return false;
  }

  async getRefreshTokenTTL(userId: number): Promise<number> {
    // Redis disabled - return -1
    return -1;
  }

  // User session data methods
  async setUserSession(userId: number, sessionData: any, ttlSeconds?: number): Promise<void> {
    const key = `user:session:${userId}`;
    const value = JSON.stringify(sessionData);
    await this.set(key, value, ttlSeconds);
  }

  async getUserSession(userId: number): Promise<any | null> {
    const key = `user:session:${userId}`;
    const value = await this.get(key);
    if (!value) {
      return null;
    }
    try {
      return JSON.parse(value);
    } catch (error) {
      console.error('Failed to parse user session data from Redis:', error);
      return null;
    }
  }

  async deleteUserSession(userId: number): Promise<boolean> {
    const key = `user:session:${userId}`;
    const result = await this.del(key);
    return result > 0;
  }
}
