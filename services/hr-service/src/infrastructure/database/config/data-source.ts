import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables
config({ path: path.resolve(__dirname, '../../../../.env') });
config({ path: path.resolve(__dirname, '../../../../.env.local') });

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'Hien_DigiERP_LeHuy_Dev2',
  entities: [path.resolve(__dirname, '../entities/*.entity{.ts,.js}')],
  migrations: [path.resolve(__dirname, '../migrations/*{.ts,.js}')],
  synchronize: false,
  logging: true,
  timezone: '+07:00',
  charset: 'utf8mb4',
});

