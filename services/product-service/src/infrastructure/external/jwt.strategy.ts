import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { RedisService } from "./redis.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private redisService: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET") || "your-secret-key",
    });
  }

  async validate(payload: any) {
    // Token từ user-service chỉ có sub (user ID), không có username
    if (!payload.sub) {
      throw new UnauthorizedException("Invalid token payload");
    }

    // Convert sub to number if it's a string
    const userId = typeof payload.sub === 'string' ? parseInt(payload.sub, 10) : payload.sub;

    // Lấy thông tin user từ Redis (bao gồm roles và permissions)
    let sessionData = null;
    try {
      sessionData = await this.redisService.getUserSession(userId);
    } catch (error) {
      console.error('Failed to get user session from Redis:', error);
    }

    return {
      id: userId,
      username: payload.username || sessionData?.username || null,
      email: payload.email || sessionData?.email || null,
      roles: sessionData?.roles || payload.roles || [],
      permissions: sessionData?.permissions || payload.permissions || [],
    };
  }
}
