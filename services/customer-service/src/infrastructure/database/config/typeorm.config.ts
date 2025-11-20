import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CustomerGroup, Customer, Contract, CustomerContact, PricingPolicy, PricingPolicyDetail } from '../entities';

export const getTypeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get<string>('DB_HOST')!,
  port: configService.get<number>('DB_PORT')!,
  username: configService.get<string>('DB_USERNAME')!,
  password: configService.get<string>('DB_PASSWORD')!,
  database: configService.get<string>('DB_DATABASE')!,
  entities: [CustomerGroup, Customer, Contract, CustomerContact, PricingPolicy, PricingPolicyDetail],
  synchronize: false, // Disabled to prevent schema changes - use migrations instead
  logging: configService.get<string>('NODE_ENV') === 'development',
  migrations: ['dist/migrations/*.js'],
  migrationsRun: false,
});
