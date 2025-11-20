import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';

// Database entities
import { User, Role, Resource, Action, Permission, UserRole, RolePermission, Tenant, UserTenant } from './infrastructure/database/entities';

// Repositories
import { UserRepository, RoleRepository, PermissionRepository, UserTenantRepository, TenantRepository } from './infrastructure/database/repositories';

// Controllers
import { AuthController } from './presentation/controllers/auth.controller';
import { UserController } from './presentation/controllers/user.controller';
import { RoleController } from './presentation/controllers/role.controller';
import { PermissionController } from './presentation/controllers/permission.controller';
import { TenantController } from './presentation/controllers/tenant.controller';
import { HealthController } from './presentation/controllers/health.controller';

// Use cases
import { LoginUseCase } from './application/use-cases/auth/login.use-case';
import { RefreshTokenUseCase } from './application/use-cases/auth/refresh-token.use-case';
import { LogoutUseCase } from './application/use-cases/auth/logout.use-case';
import { GetUserProfileUseCase } from './application/use-cases/auth/get-user-profile.use-case';
import { CreateUserUseCase } from './application/use-cases/user/create-user.use-case';
import { UpdateUserUseCase } from './application/use-cases/user/update-user.use-case';
import { GetUserUseCase } from './application/use-cases/user/get-user.use-case';
import { GetUsersUseCase } from './application/use-cases/user/get-users.use-case';
import { GetUserRolesUseCase } from './application/use-cases/user/get-user-roles.use-case';
import { GetUserRolesWithPermissionsUseCase } from './application/use-cases/user/get-user-roles-permissions.use-case';
import { DeleteUserUseCase } from './application/use-cases/user/delete-user.use-case';
import { CreateRoleUseCase } from './application/use-cases/role/create-role.use-case';
import { GetRoleUseCase } from './application/use-cases/role/get-role.use-case';
import { GetRolesUseCase } from './application/use-cases/role/get-roles.use-case';
import { GetRolePermissionsUseCase } from './application/use-cases/role/get-role-permissions.use-case';
import { UpdateRoleUseCase } from './application/use-cases/role/update-role.use-case';
import { DeleteRoleUseCase } from './application/use-cases/role/delete-role.use-case';
import { GetPermissionsUseCase } from './application/use-cases/permission/get-permissions.use-case';
import { GetPermissionUseCase } from './application/use-cases/permission/get-permission.use-case';
import { CreatePermissionUseCase } from './application/use-cases/permission/create-permission.use-case';
import { UpdatePermissionUseCase } from './application/use-cases/permission/update-permission.use-case';
import { DeletePermissionUseCase } from './application/use-cases/permission/delete-permission.use-case';
import { AssignPermissionsToRoleUseCase } from './application/use-cases/permission/assign-permissions-to-role.use-case';
import { AssignRolesToUserUseCase } from './application/use-cases/permission/assign-roles-to-user.use-case';
import { RemoveRoleFromUserUseCase } from './application/use-cases/permission/remove-role-from-user.use-case';
import { CreateTenantUseCase } from './application/use-cases/tenant/create-tenant.use-case';
import { GetTenantUseCase } from './application/use-cases/tenant/get-tenant.use-case';
import { GetTenantsUseCase } from './application/use-cases/tenant/get-tenants.use-case';
import { UpdateTenantUseCase } from './application/use-cases/tenant/update-tenant.use-case';
import { DeleteTenantUseCase } from './application/use-cases/tenant/delete-tenant.use-case';
import { GetTenantUsersUseCase } from './application/use-cases/tenant/get-tenant-users.use-case';
import { GetTenantRolesUseCase } from './application/use-cases/tenant/get-tenant-roles.use-case';
import { AssignUserToTenantWithRolesUseCase } from './application/use-cases/tenant/assign-user-to-tenant-with-roles.use-case';
import { InitializeTenantRolesAndPermissionsUseCase } from './application/use-cases/tenant/initialize-tenant-roles-permissions.use-case';
import { AssignRolesToTenantUseCase } from './application/use-cases/tenant/assign-roles-to-tenant.use-case';
import { RemoveUserFromTenantUseCase } from './application/use-cases/tenant/remove-user-from-tenant.use-case';
import { RemoveRoleFromUserTenantUseCase } from './application/use-cases/tenant/remove-role-from-user-tenant.use-case';

// Domain services
import { AuthDomainService } from './domain/services/auth.domain.service';
import { RbacDomainService } from './domain/services/rbac.domain.service';

// Guards
import { JwtAuthGuard } from './presentation/guards/jwt-auth.guard';
import { RbacGuard } from './presentation/guards/rbac.guard';

// Strategies
import { JwtStrategy } from './infrastructure/external/jwt.strategy';

// External services
import { RedisService } from './infrastructure/external/redis.service';

// Configuration
import { getTypeOrmConfig } from './infrastructure/database/config/typeorm.config';
import { resolve } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Ưu tiên đọc từ file .env ở thư mục gốc trước
      // NestJS sẽ tìm file theo thứ tự, file đầu tiên tìm thấy sẽ được sử dụng
      envFilePath: [
        '../../.env', // Path từ services/user-service lên root (ưu tiên cao nhất)
        '.env.local', // Override local nếu cần
        '.env', // Fallback trong thư mục service
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => getTypeOrmConfig(configService),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      User,
      Role,
      Resource,
      Action,
      Permission,
      UserRole,
      RolePermission,
      Tenant,
      UserTenant,
    ]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const jwtSecret = configService.get<string>('JWT_SECRET');
        
        if (!jwtSecret) {
          throw new Error('JWT_SECRET is not configured in environment variables');
        }
        
        return {
          secret: jwtSecret,
          signOptions: {
            expiresIn: configService.get<string>('JWT_EXPIRES_IN', '15m'),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [
    AuthController,
    UserController,
    RoleController,
    PermissionController,
    TenantController,
    HealthController,
  ],
  providers: [
    // Repositories
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    {
      provide: 'IRoleRepository',
      useClass: RoleRepository,
    },
    {
      provide: 'IPermissionRepository',
      useClass: PermissionRepository,
    },
    {
      provide: 'IUserTenantRepository',
      useClass: UserTenantRepository,
    },
    {
      provide: 'ITenantRepository',
      useClass: TenantRepository,
    },

    // Domain services
    AuthDomainService,
    RbacDomainService,

    // External services
    RedisService,

    // Use cases
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    GetUserProfileUseCase,
    CreateUserUseCase,
    UpdateUserUseCase,
    GetUserUseCase,
    GetUsersUseCase,
    GetUserRolesUseCase,
    GetUserRolesWithPermissionsUseCase,
    DeleteUserUseCase,
    CreateRoleUseCase,
    GetRoleUseCase,
    GetRolesUseCase,
    GetRolePermissionsUseCase,
    UpdateRoleUseCase,
    DeleteRoleUseCase,
    GetPermissionsUseCase,
    GetPermissionUseCase,
    CreatePermissionUseCase,
    UpdatePermissionUseCase,
    DeletePermissionUseCase,
    AssignPermissionsToRoleUseCase,
    AssignRolesToUserUseCase,
    RemoveRoleFromUserUseCase,
    CreateTenantUseCase,
    GetTenantUseCase,
    GetTenantsUseCase,
    UpdateTenantUseCase,
    DeleteTenantUseCase,
    GetTenantUsersUseCase,
    GetTenantRolesUseCase,
    AssignUserToTenantWithRolesUseCase,
    InitializeTenantRolesAndPermissionsUseCase,
    AssignRolesToTenantUseCase,
    RemoveUserFromTenantUseCase,
    RemoveRoleFromUserTenantUseCase,

    // Strategies
    JwtStrategy,

    // Guards
    // Global guards disabled - authorization will be handled by API Gateway
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
    RbacGuard,
  ],
})
export class AppModule {}
