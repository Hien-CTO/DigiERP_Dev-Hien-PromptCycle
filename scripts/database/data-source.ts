import { DataSource } from 'typeorm';
import * as path from 'path';

const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "103.245.255.55",
  port: parseInt(process.env.DB_PORT || "3306"),
  username: process.env.DB_USERNAME || "erp_user",
  password: process.env.DB_PASSWORD || "Digi!passw0rd",
  database: process.env.DB_DATABASE || "Hien_DigiERP_LeHuy_Dev2",
  synchronize: false,
  logging: process.env.NODE_ENV === "development" || true,
  migrations: [
    path.join(__dirname, "migrations", "*.ts"),
    path.join(__dirname, "..", "services", "hr-service", "src", "infrastructure", "database", "migrations", "*.ts"),
  ],
  migrationsTableName: "migrations",
  timezone: '+07:00',
  charset: 'utf8mb4',
  extra: {
    connectionLimit: 10,
  },
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export default AppDataSource;

