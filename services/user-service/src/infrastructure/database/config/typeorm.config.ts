import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User, Role, Resource, Action, Permission, UserRole, RolePermission, Tenant, UserTenant } from '../entities';

export const getTypeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get<string>('DB_HOST')!,
  port: configService.get<number>('DB_PORT')!,
  username: configService.get<string>('DB_USERNAME')!,
  password: configService.get<string>('DB_PASSWORD')!,
  database: configService.get<string>('DB_DATABASE')!,
  entities: [User, Role, Resource, Action, Permission, UserRole, RolePermission, Tenant, UserTenant],
  synchronize: false, // Disabled to prevent ALTER TABLE on startup
  logging: false, // Disabled SQL query logging
  migrations: ['dist/infrastructure/database/migrations/*.js'],
  migrationsRun: false,
  timezone: '+07:00',
  charset: 'utf8mb4',
  extra: {
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
  },
});
