import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType | null = null;
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);
    const redisPassword = this.configService.get<string>('REDIS_PASSWORD');

    try {
      const host = redisHost === 'localhost' ? '127.0.0.1' : redisHost;

      this.client = createClient({
        socket: {
          host,
          port: redisPort,
          family: 4,
        },
        ...(redisPassword && { password: redisPassword }),
      });

      this.client.on('error', (err) => {
        this.logger.error(`Redis client error: ${err.message}`, err.stack);
      });

      await this.client.connect();
      this.logger.log(`Redis connected to ${host}:${redisPort}`);
    } catch (error) {
      this.logger.error('Failed to connect to Redis', error.stack);
      this.logger.warn('Service will continue without Redis. Permissions may be limited.');
      this.client = null;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client && this.client.isOpen) {
      await this.client.quit();
      this.logger.log('Redis connection closed');
    }
  }

  async getUserSession(userId: number): Promise<any | null> {
    if (!this.client || !this.client.isOpen) {
      this.logger.warn('Redis not connected, returning null session');
      return null;
    }

    const key = `user:session:${userId}`;

    try {
      const value = await this.client.get(key);
      if (!value || typeof value !== 'string') {
        return null;
      }
      return JSON.parse(value);
    } catch (error) {
      this.logger.error(`Failed to get user session from Redis for user ${userId}`, error.stack);
      return null;
    }
  }
}

