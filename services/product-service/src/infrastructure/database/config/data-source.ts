import { DataSource } from 'typeorm';
import { ProductCategory, Product, ProductPrice, Material, Brand, FormulaProduct, Unit, StockStatus, ProductStatus, PackagingType } from "../entities";

const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT!),
  username: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_DATABASE!,
  entities: [ProductCategory, Product, ProductPrice, Material, Brand, FormulaProduct, Unit, StockStatus, ProductStatus, PackagingType],
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
  migrations: ["src/infrastructure/database/migrations/*.ts"],
  migrationsTableName: "migrations",
  timezone: '+07:00',
  charset: 'utf8mb4',
  extra: {
    connectionLimit: 10,
  },
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export default AppDataSource;
