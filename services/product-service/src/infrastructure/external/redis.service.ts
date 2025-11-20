import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);
    const redisPassword = this.configService.get<string>('REDIS_PASSWORD');

    try {
      // Sử dụng 127.0.0.1 thay vì localhost để tránh IPv6 (::1)
      const host = redisHost === 'localhost' ? '127.0.0.1' : redisHost;
      
      this.client = createClient({
        socket: {
          host: host,
          port: redisPort,
          // Tắt IPv6 để tránh lỗi kết nối
          family: 4,
        },
        ...(redisPassword && { password: redisPassword }),
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
        // Không throw error, chỉ log để service vẫn chạy được
      });

      await this.client.connect();
      console.log(`Redis connected to ${host}:${redisPort}`);
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      console.warn('Service will continue without Redis. Permissions will not be available.');
      // Không throw error để service vẫn chạy được nếu Redis không available
      this.client = null;
    }
  }

  async onModuleDestroy() {
    if (this.client && this.client.isOpen) {
      await this.client.quit();
      console.log('Redis connection closed');
    }
  }

  async getUserSession(userId: number): Promise<any | null> {
    if (!this.client || !this.client.isOpen) {
      console.warn('Redis not connected, returning null');
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
      console.error('Failed to get user session from Redis:', error);
      return null;
    }
  }
}

