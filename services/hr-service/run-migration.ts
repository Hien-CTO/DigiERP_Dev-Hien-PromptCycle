import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';
import { ExtendAttendanceManagement1735000000000 } from './src/infrastructure/database/migrations/1735000000000-ExtendAttendanceManagement';

// Load environment variables
config({ path: path.resolve(__dirname, '.env') });
config({ path: path.resolve(__dirname, '.env.local') });
config({ path: path.resolve(__dirname, '../.env') });

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'Hien_DigiERP_LeHuy_Dev2',
  synchronize: false,
  logging: true,
  timezone: '+07:00',
  charset: 'utf8mb4',
});

async function runMigration() {
  try {
    console.log('Connecting to database...');
    await AppDataSource.initialize();
    console.log('Database connected successfully!');

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log('Running migration: ExtendAttendanceManagement1735000000000...');
      const migration = new ExtendAttendanceManagement1735000000000();
      await migration.up(queryRunner);
      
      await queryRunner.commitTransaction();
      console.log('✅ Migration completed successfully!');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Migration failed, rolling back...');
      throw error;
    } finally {
      await queryRunner.release();
    }

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

runMigration();

