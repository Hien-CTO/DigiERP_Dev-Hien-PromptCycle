import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const userId = typeof payload.sub === 'string' ? parseInt(payload.sub, 10) : payload.sub;

    // Try to hydrate user context from Redis (if available)
    try {
      const session = await this.redisService.getUserSession(userId);
      if (session) {
        return {
          id: userId,
          email: payload.email || session.email || null,
          username: payload.username || session.username || null,
          permissions: payload.permissions || session.permissions || [],
          roles: payload.roles || session.roles || [],
        };
      }
    } catch (error) {
      this.logger.warn(`Redis lookup failed for user ${userId}: ${error.message}`);
    }

    // Fallback to payload only
    return {
      id: userId,
      email: payload.email || null,
      username: payload.username || null,
      permissions: payload.permissions || [],
      roles: payload.roles || [],
    };
  }
}
