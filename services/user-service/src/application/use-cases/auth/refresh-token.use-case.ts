import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IUserRepository } from '@/domain/repositories/user.repository.interface';
import { IRoleRepository } from '@/domain/repositories/role.repository.interface';
import { IPermissionRepository } from '@/domain/repositories/permission.repository.interface';
import { IUserTenantRepository } from '@/domain/repositories/user-tenant.repository.interface';
import { RedisService } from '@/infrastructure/external/redis.service';
import { RefreshTokenDto, RefreshTokenResponseDto } from '../../dtos/auth.dto';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,
    @Inject('IUserTenantRepository')
    private readonly userTenantRepository: IUserTenantRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(refreshTokenDto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
    const { refreshToken } = refreshTokenDto;
 
    try {
      // Get JWT issuer and audience from config for verification
      const issuer = this.configService.get<string>('JWT_ISSUER', 'https://auth.example.com');
      const audience = this.configService.get<string>('JWT_AUDIENCE', 'api.example.com');

      // Verify refresh token with issuer and audience validation
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        issuer: issuer,
        audience: audience,
      });

      // Check if user still exists and is active
      // Support both old format (number) and new format (string) for sub
      const userId = typeof payload.sub === 'string' ? parseInt(payload.sub, 10) : payload.sub;
      const user = await this.userRepository.findById(userId);
      if (!user || !user.canLogin()) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Redis check disabled - only verify JWT token

      // Generate new access token payload - only basic information
      // Only includes: iss, aud, sub (iat and exp will be automatically added by jwtService.sign())
      const accessTokenPayload: any = {
        iss: issuer,
        aud: audience,
        sub: user.id.toString(), // User ID as string
      };

      // Generate new access token with minimal payload
      const newAccessToken = this.jwtService.sign(accessTokenPayload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
      });

      // Generate new refresh token payload - same minimal format
      const refreshTokenPayload: any = {
        iss: issuer,
        aud: audience,
        sub: user.id.toString(),
      };

      // Generate new refresh token
      const refreshTokenExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
      const newRefreshToken = this.jwtService.sign(refreshTokenPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshTokenExpiresIn,
      });

      // Redis update disabled

      const expiresIn = this.parseExpirationTime(
        this.configService.get<string>('JWT_EXPIRES_IN', '15m')
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private parseExpirationTime(expiresIn: string): number {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 60 * 60 * 24;
      default:
        return 900; // 15 minutes default
    }
  }
}
