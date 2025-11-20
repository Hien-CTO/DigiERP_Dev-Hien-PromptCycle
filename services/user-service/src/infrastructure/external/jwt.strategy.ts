import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { IUserRepository } from '@/domain/repositories/user.repository.interface';
import { IRoleRepository } from '@/domain/repositories/role.repository.interface';
import { IPermissionRepository } from '@/domain/repositories/permission.repository.interface';

// Custom extractor để lấy JWT từ cookie
const cookieExtractor = (req: Request): string | null => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['accessToken'];
  }
  return token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @Inject('IUserRepository')
    private userRepository: IUserRepository,
    @Inject('IRoleRepository')
    private roleRepository: IRoleRepository,
    @Inject('IPermissionRepository')
    private permissionRepository: IPermissionRepository,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    const issuer = configService.get<string>('JWT_ISSUER', 'https://auth.example.com');
    const audience = configService.get<string>('JWT_AUDIENCE', 'api.example.com');
    
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured in environment variables');
    }
    
    super({
      // Thay đổi: Đọc từ cookie thay vì Authorization header
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor, // Ưu tiên cookie
        ExtractJwt.fromAuthHeaderAsBearerToken(), // Fallback cho API clients khác
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
      issuer: issuer,
      audience: audience,
      passReqToCallback: false,
    });
  }

  async validate(payload: any) {
    // Support both old format (number) and new format (string) for sub
    const userId = typeof payload.sub === 'string' ? parseInt(payload.sub, 10) : payload.sub;
    const user = await this.userRepository.findById(userId);
    if (!user || !user.canLogin()) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Extract tenantId from payload (new format: t_42, old format: number)
    let tenantId: number | undefined;
    if (payload.tenantId) {
      if (typeof payload.tenantId === 'string' && payload.tenantId.startsWith('t_')) {
        // New format: t_42
        tenantId = parseInt(payload.tenantId.substring(2), 10);
      } else {
        // Old format: number
        tenantId = typeof payload.tenantId === 'number' ? payload.tenantId : parseInt(payload.tenantId, 10);
      }
    }

    // Always fetch roles and permissions from database
    // New JWT payload format doesn't include roles/permissions for security
    const roles = await this.roleRepository.findUserRoles(user.id, tenantId);
    const roleNames = roles.map(role => role.name);

    const permissions = await this.permissionRepository.findUserPermissions(user.id, tenantId);
    const permissionStrings = permissions.map(permission => permission.getPermissionString());

    // Extract tenant information and session info from JWT payload
    const tenantInfo: any = {};
    if (tenantId) {
      tenantInfo.tenantId = tenantId;
    }

    // Extract session info (for logout/revoke functionality)
    const sessionInfo: any = {};
    if (payload.jti) {
      sessionInfo.jti = payload.jti; // JWT ID for token revocation
    }
    if (payload.sid) {
      sessionInfo.sid = payload.sid; // Session ID for logout
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: roleNames,
      permissions: permissionStrings,
      ...tenantInfo,
      ...sessionInfo,
    };
  }
}
