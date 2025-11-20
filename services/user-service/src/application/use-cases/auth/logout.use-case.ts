import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '@/domain/repositories/user.repository.interface';
import { RedisService } from '@/infrastructure/external/redis.service';
import { LogoutDto } from '../../dtos/auth.dto';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly redisService: RedisService,
  ) {}

  async execute(logoutDto: LogoutDto, userId: number): Promise<{ message: string }> {
    try {
      // Delete refresh token from Redis
      await this.redisService.deleteRefreshToken(userId);
      
      // Delete user session data (roles and permissions) from Redis
      await this.redisService.deleteUserSession(userId);
      
      console.log(`✓ User session data deleted from Redis for user ${userId}`);
    } catch (error) {
      // Log error but don't fail logout if Redis is unavailable
      console.error('Failed to delete session data from Redis:', error);
    }

    return { message: 'Logout successful' };
  }
}
