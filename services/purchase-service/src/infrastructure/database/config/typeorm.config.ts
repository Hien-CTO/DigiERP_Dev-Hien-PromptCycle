import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import {
  Supplier,
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseOrderImporter,
  PurchaseRequest,
  PurchaseRequestItem,
} from '../entities';

export const getTypeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get<string>('DB_HOST')!,
  port: configService.get<number>('DB_PORT')!,
  username: configService.get<string>('DB_USERNAME')!,
  password: configService.get<string>('DB_PASSWORD')!,
  database: configService.get<string>('DB_DATABASE')!,
  entities: [
    Supplier,
    PurchaseOrder,
    PurchaseOrderItem,
    PurchaseOrderImporter,
    PurchaseRequest,
    PurchaseRequestItem, 
  ],
  synchronize: false, // Disabled to prevent ALTER TABLE on startup
  logging: configService.get<string>('NODE_ENV') === 'development',
  migrations: ['dist/migrations/*.js'],
  migrationsRun: false,
});
