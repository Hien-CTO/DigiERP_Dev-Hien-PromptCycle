import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { Brand } from '../../services/product-service/src/infrastructure/database/entities/brand.entity';
import { Unit } from '../../services/product-service/src/infrastructure/database/entities/unit.entity';
import { Product } from '../../services/product-service/src/infrastructure/database/entities/product.entity';

describe('Catalog Migration Integration Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT) || 3306,
          username: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_NAME || 'DigiERP_Dev2',
          entities: [Brand, Unit, Product],
          synchronize: false,
          logging: true,
        }),
        TypeOrmModule.forFeature([Brand, Unit, Product]),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Database Schema Migration', () => {
    it('should have catalog tables created', async () => {
      const tables = await dataSource.query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = 'DigiERP_Dev2' 
        AND TABLE_NAME LIKE 'cat_%'
      `);

      expect(tables).toHaveLength(11); // Expected number of catalog tables
      expect(tables.map(t => t.TABLE_NAME)).toContain('cat_brands');
      expect(tables.map(t => t.TABLE_NAME)).toContain('cat_units');
      expect(tables.map(t => t.TABLE_NAME)).toContain('cat_product_status');
    });

    it('should have foreign key constraints', async () => {
      const constraints = await dataSource.query(`
        SELECT 
          TABLE_NAME,
          COLUMN_NAME,
          CONSTRAINT_NAME,
          REFERENCED_TABLE_NAME,
          REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE REFERENCED_TABLE_NAME LIKE 'cat_%'
        AND TABLE_SCHEMA = 'DigiERP_Dev2'
      `);

      expect(constraints.length).toBeGreaterThan(0);
    });

    it('should have default data inserted', async () => {
      const brandCount = await dataSource.query('SELECT COUNT(*) as count FROM cat_brands');
      const unitCount = await dataSource.query('SELECT COUNT(*) as count FROM cat_units');
      const statusCount = await dataSource.query('SELECT COUNT(*) as count FROM cat_product_status');

      expect(brandCount[0].count).toBeGreaterThan(0);
      expect(unitCount[0].count).toBeGreaterThan(0);
      expect(statusCount[0].count).toBeGreaterThan(0);
    });
  });

  describe('Product Entity Migration', () => {
    it('should have foreign key columns', async () => {
      const columns = await dataSource.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'products' 
        AND TABLE_SCHEMA = 'DigiERP_Dev2'
        AND COLUMN_NAME LIKE '%_id'
      `);

      expect(columns.map(c => c.COLUMN_NAME)).toContain('brand_id');
      expect(columns.map(c => c.COLUMN_NAME)).toContain('model_id');
      expect(columns.map(c => c.COLUMN_NAME)).toContain('unit_id');
      expect(columns.map(c => c.COLUMN_NAME)).toContain('status_id');
      expect(columns.map(c => c.COLUMN_NAME)).toContain('stock_status_id');
    });

    it('should not have old columns', async () => {
      const oldColumns = await dataSource.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'products' 
        AND TABLE_SCHEMA = 'DigiERP_Dev2'
        AND COLUMN_NAME IN ('brand', 'model', 'unit', 'status', 'stock_status')
      `);

      expect(oldColumns).toHaveLength(0);
    });
  });

  describe('Sales Order Entity Migration', () => {
    it('should have foreign key columns', async () => {
      const columns = await dataSource.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'sales_orders' 
        AND TABLE_SCHEMA = 'DigiERP_Dev2'
        AND COLUMN_NAME LIKE '%_id'
      `);

      expect(columns.map(c => c.COLUMN_NAME)).toContain('shipping_method_id');
      expect(columns.map(c => c.COLUMN_NAME)).toContain('payment_method_id');
    });
  });

  describe('Data Integrity', () => {
    it('should maintain data consistency after migration', async () => {
      // Check that products have valid foreign key references
      const invalidProducts = await dataSource.query(`
        SELECT p.id, p.sku, p.brand_id, b.name as brand_name
        FROM products p
        LEFT JOIN cat_brands b ON p.brand_id = b.id
        WHERE p.brand_id IS NOT NULL AND b.id IS NULL
      `);

      expect(invalidProducts).toHaveLength(0);
    });

    it('should have proper indexes', async () => {
      const indexes = await dataSource.query(`
        SELECT INDEX_NAME, COLUMN_NAME
        FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = 'DigiERP_Dev2'
        AND TABLE_NAME = 'products'
        AND COLUMN_NAME LIKE '%_id'
      `);

      expect(indexes.length).toBeGreaterThan(0);
    });
  });

  describe('API Endpoints', () => {
    it('should create a new brand', async () => {
      const brandData = {
        code: 'TEST_BRAND',
        name: 'Test Brand',
        description: 'Test Description',
        is_active: true
      };

      const response = await request(app.getHttpServer())
        .post('/brands')
        .send(brandData)
        .expect(201);

      expect(response.body.code).toBe('TEST_BRAND');
      expect(response.body.name).toBe('Test Brand');
    });

    it('should get brands list', async () => {
      const response = await request(app.getHttpServer())
        .get('/brands')
        .expect(200);

      expect(response.body.brands).toBeDefined();
      expect(Array.isArray(response.body.brands)).toBe(true);
    });

    it('should create a new unit', async () => {
      const unitData = {
        code: 'TEST_UNIT',
        name: 'Test Unit',
        symbol: 'TU',
        type: 'OTHER',
        is_active: true
      };

      const response = await request(app.getHttpServer())
        .post('/units')
        .send(unitData)
        .expect(201);

      expect(response.body.code).toBe('TEST_UNIT');
      expect(response.body.name).toBe('Test Unit');
    });
  });

  describe('Error Handling', () => {
    it('should handle duplicate brand codes', async () => {
      const brandData = {
        code: 'DUPLICATE_TEST',
        name: 'Duplicate Test Brand',
        is_active: true
      };

      // Create first brand
      await request(app.getHttpServer())
        .post('/brands')
        .send(brandData)
        .expect(201);

      // Try to create duplicate
      await request(app.getHttpServer())
        .post('/brands')
        .send(brandData)
        .expect(409);
    });

    it('should handle invalid foreign key references', async () => {
      const productData = {
        sku: 'TEST_PRODUCT',
        name: 'Test Product',
        category_id: 1,
        brand_id: 99999, // Invalid brand ID
        is_active: true
      };

      await request(app.getHttpServer())
        .post('/products')
        .send(productData)
        .expect(400);
    });
  });

  describe('Performance', () => {
    it('should have acceptable query performance', async () => {
      const startTime = Date.now();
      
      await dataSource.query(`
        SELECT p.*, b.name as brand_name, u.name as unit_name
        FROM products p
        LEFT JOIN cat_brands b ON p.brand_id = b.id
        LEFT JOIN cat_units u ON p.unit_id = u.id
        LIMIT 100
      `);
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
