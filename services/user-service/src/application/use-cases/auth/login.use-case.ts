import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthDomainService } from '@/domain/services/auth.domain.service';
import { IUserRepository } from '@/domain/repositories/user.repository.interface';
import { IRoleRepository } from '@/domain/repositories/role.repository.interface';
import { IPermissionRepository } from '@/domain/repositories/permission.repository.interface';
import { IUserTenantRepository } from '@/domain/repositories/user-tenant.repository.interface';
import { RedisService } from '@/infrastructure/external/redis.service';
import { LoginDto, LoginResponseDto } from '../../dtos/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly authDomainService: AuthDomainService,
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
    private readonly redisService: RedisService,
  ) {}

  async execute(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { usernameOrEmail, password } = loginDto;

    // Find user by username or email
    let user = await this.userRepository.findByUsername(usernameOrEmail);
    if (!user) {
      user = await this.userRepository.findByEmail(usernameOrEmail);
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user can login
    if (!user.canLogin()) {
      throw new UnauthorizedException('Account is inactive or not verified');
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.authDomainService.updateUserLastLogin(user.id);

    // Get user tenants (primary tenant và tất cả tenants)
    const primaryTenant = await this.userTenantRepository.findPrimaryTenant(user.id);
    const allTenants = await this.userTenantRepository.findAllUserTenants(user.id);

    // Get user roles and permissions with primary tenant context (if available)
    const roles = await this.roleRepository.findUserRoles(user.id, primaryTenant?.tenantId);
    const roleNames = roles.map(role => role.name);

    const permissions = await this.permissionRepository.findUserPermissions(
      user.id, 
      primaryTenant?.tenantId
    );
    // Use permission name instead of format "resourceId:actionId"
    const permissionStrings = permissions.map(permission => permission.name);

    // Prepare session data for Redis
    const sessionData = {
      userId: user.id,
      tenant: primaryTenant ? {
        tenantId: primaryTenant.tenantId,
        tenantCode: primaryTenant.tenantCode,
        tenantName: primaryTenant.tenantName,
        roleId: primaryTenant.roleId,
        roleName: primaryTenant.roleName,
      } : null,
      tenants: allTenants.map(t => ({
        tenantId: t.tenantId,
        tenantCode: t.tenantCode,
        tenantName: t.tenantName,
        roleId: t.roleId,
        roleName: t.roleName,
        isPrimary: t.isPrimary,
      })),
      roles: roleNames,
      permissions: permissionStrings,
    };

    // Get JWT issuer and audience from config
    const issuer = this.configService.get<string>('JWT_ISSUER', 'https://auth.example.com');
    const audience = this.configService.get<string>('JWT_AUDIENCE', 'api.example.com');

    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    const jwtRefreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured in environment variables');
    }
    
    if (!jwtRefreshSecret) {
      throw new Error('JWT_REFRESH_SECRET is not configured in environment variables');
    }

    // Generate access token payload - only basic information
    // Only includes: iss, aud, sub (iat and exp will be automatically added by jwtService.sign())
    const accessTokenPayload: any = {
      iss: issuer,
      aud: audience,
      sub: user.id.toString(), // User ID as string
    };

    // Generate access token with minimal payload
    const accessToken = this.jwtService.sign(accessTokenPayload, {
      secret: jwtSecret,
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
    });

    // Generate refresh token payload - can include additional info for session management
    const refreshTokenPayload: any = {
      iss: issuer,
      aud: audience,
      sub: user.id.toString(),
    };

    // Generate refresh token
    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: jwtRefreshSecret,
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    // Save session data to Redis
    // TTL: same as refresh token expiration (7 days)
    const refreshTokenExpiresIn = this.parseExpirationTime(
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d')
    );
    
    try {
      await this.redisService.setUserSession(user.id, sessionData, refreshTokenExpiresIn);
      
      // Verify data was saved successfully
      const savedData = await this.redisService.getUserSession(user.id);
      if (savedData) {
        console.log(`✓ Session data saved to Redis for user ${user.id}`);
      } else {
        console.warn(`⚠ Session data NOT saved to Redis for user ${user.id}`);
      }
    } catch (error) {
      // Log error but don't fail login if Redis is unavailable
      console.error('Failed to save session data to Redis:', error);
    }

    const expiresIn = this.parseExpirationTime(
      this.configService.get<string>('JWT_EXPIRES_IN', '15m')
    );

    return {
      accessToken,
      refreshToken,
      expiresIn,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        isActive: user.isActive,
        isVerified: user.isVerified,
      },
    };
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
