import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { Brand } from '../../services/product-service/src/infrastructure/database/entities/brand.entity';
import { Unit } from '../../services/product-service/src/infrastructure/database/entities/unit.entity';
import { Product } from '../../services/product-service/src/infrastructure/database/entities/product.entity';

describe('Catalog Management E2E Tests', () => {
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
          logging: false,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Brand Management', () => {
    let createdBrandId: number;

    it('should create a new brand', async () => {
      const brandData = {
        code: 'E2E_TEST_BRAND',
        name: 'E2E Test Brand',
        description: 'E2E Test Description',
        logo_url: 'https://example.com/logo.png',
        website: 'https://example.com',
        is_active: true,
      };

      const response = await request(app.getHttpServer())
        .post('/brands')
        .send(brandData)
        .expect(201);

      expect(response.body.code).toBe('E2E_TEST_BRAND');
      expect(response.body.name).toBe('E2E Test Brand');
      expect(response.body.description).toBe('E2E Test Description');
      expect(response.body.logo_url).toBe('https://example.com/logo.png');
      expect(response.body.website).toBe('https://example.com');
      expect(response.body.is_active).toBe(true);

      createdBrandId = response.body.id;
    });

    it('should get brands list', async () => {
      const response = await request(app.getHttpServer())
        .get('/brands')
        .expect(200);

      expect(response.body.brands).toBeDefined();
      expect(Array.isArray(response.body.brands)).toBe(true);
      expect(response.body.total).toBeGreaterThan(0);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(10);
    });

    it('should get a specific brand', async () => {
      const response = await request(app.getHttpServer())
        .get(`/brands/${createdBrandId}`)
        .expect(200);

      expect(response.body.id).toBe(createdBrandId);
      expect(response.body.code).toBe('E2E_TEST_BRAND');
      expect(response.body.name).toBe('E2E Test Brand');
    });

    it('should update a brand', async () => {
      const updateData = {
        name: 'Updated E2E Test Brand',
        description: 'Updated E2E Test Description',
        website: 'https://updated-example.com',
      };

      const response = await request(app.getHttpServer())
        .put(`/brands/${createdBrandId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe('Updated E2E Test Brand');
      expect(response.body.description).toBe('Updated E2E Test Description');
      expect(response.body.website).toBe('https://updated-example.com');
    });

    it('should activate a brand', async () => {
      const response = await request(app.getHttpServer())
        .put(`/brands/${createdBrandId}/activate`)
        .expect(200);

      expect(response.body.is_active).toBe(true);
    });

    it('should deactivate a brand', async () => {
      const response = await request(app.getHttpServer())
        .put(`/brands/${createdBrandId}/deactivate`)
        .expect(200);

      expect(response.body.is_active).toBe(false);
    });

    it('should delete a brand', async () => {
      await request(app.getHttpServer())
        .delete(`/brands/${createdBrandId}`)
        .expect(204);
    });
  });

  describe('Unit Management', () => {
    let createdUnitId: number;

    it('should create a new unit', async () => {
      const unitData = {
        code: 'E2E_TEST_UNIT',
        name: 'E2E Test Unit',
        symbol: 'ETU',
        type: 'OTHER',
        is_active: true,
      };

      const response = await request(app.getHttpServer())
        .post('/units')
        .send(unitData)
        .expect(201);

      expect(response.body.code).toBe('E2E_TEST_UNIT');
      expect(response.body.name).toBe('E2E Test Unit');
      expect(response.body.symbol).toBe('ETU');
      expect(response.body.type).toBe('OTHER');
      expect(response.body.is_active).toBe(true);

      createdUnitId = response.body.id;
    });

    it('should get units list', async () => {
      const response = await request(app.getHttpServer())
        .get('/units')
        .expect(200);

      expect(response.body.units).toBeDefined();
      expect(Array.isArray(response.body.units)).toBe(true);
      expect(response.body.total).toBeGreaterThan(0);
    });

    it('should get units by type', async () => {
      const response = await request(app.getHttpServer())
        .get('/units/by-type/WEIGHT')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((unit: any) => {
        expect(unit.type).toBe('WEIGHT');
        expect(unit.is_active).toBe(true);
      });
    });

    it('should update a unit', async () => {
      const updateData = {
        name: 'Updated E2E Test Unit',
        symbol: 'UETU',
        description: 'Updated description',
      };

      const response = await request(app.getHttpServer())
        .put(`/units/${createdUnitId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe('Updated E2E Test Unit');
      expect(response.body.symbol).toBe('UETU');
    });

    it('should delete a unit', async () => {
      await request(app.getHttpServer())
        .delete(`/units/${createdUnitId}`)
        .expect(204);
    });
  });

  describe('Error Handling', () => {
    it('should handle duplicate brand codes', async () => {
      const brandData = {
        code: 'DUPLICATE_E2E_TEST',
        name: 'Duplicate E2E Test Brand',
        is_active: true,
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

    it('should handle invalid brand ID', async () => {
      await request(app.getHttpServer())
        .get('/brands/99999')
        .expect(404);
    });

    it('should handle invalid unit type', async () => {
      const unitData = {
        code: 'INVALID_TYPE_UNIT',
        name: 'Invalid Type Unit',
        symbol: 'ITU',
        type: 'INVALID_TYPE',
        is_active: true,
      };

      await request(app.getHttpServer())
        .post('/units')
        .send(unitData)
        .expect(400);
    });
  });

  describe('Search and Filtering', () => {
    beforeEach(async () => {
      // Create test data
      const brands = [
        { code: 'SEARCH_TEST_1', name: 'Search Test Brand 1', is_active: true },
        { code: 'SEARCH_TEST_2', name: 'Search Test Brand 2', is_active: true },
        { code: 'SEARCH_TEST_3', name: 'Inactive Brand', is_active: false },
      ];

      for (const brand of brands) {
        await request(app.getHttpServer())
          .post('/brands')
          .send(brand);
      }
    });

    it('should search brands by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/brands?search=Search Test')
        .expect(200);

      expect(response.body.brands.length).toBeGreaterThan(0);
      response.body.brands.forEach((brand: any) => {
        expect(brand.name).toContain('Search Test');
      });
    });

    it('should filter brands by active status', async () => {
      const response = await request(app.getHttpServer())
        .get('/brands?is_active=true')
        .expect(200);

      response.body.brands.forEach((brand: any) => {
        expect(brand.is_active).toBe(true);
      });
    });

    it('should filter brands by inactive status', async () => {
      const response = await request(app.getHttpServer())
        .get('/brands?is_active=false')
        .expect(200);

      response.body.brands.forEach((brand: any) => {
        expect(brand.is_active).toBe(false);
      });
    });
  });

  describe('Pagination', () => {
    beforeEach(async () => {
      // Create multiple brands for pagination test
      const brands = Array.from({ length: 25 }, (_, i) => ({
        code: `PAGINATION_TEST_${i + 1}`,
        name: `Pagination Test Brand ${i + 1}`,
        is_active: true,
      }));

      for (const brand of brands) {
        await request(app.getHttpServer())
          .post('/brands')
          .send(brand);
      }
    });

    it('should handle pagination correctly', async () => {
      const response = await request(app.getHttpServer())
        .get('/brands?page=1&limit=10')
        .expect(200);

      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(10);
      expect(response.body.brands.length).toBeLessThanOrEqual(10);
      expect(response.body.total).toBeGreaterThan(10);
      expect(response.body.totalPages).toBeGreaterThan(1);
    });

    it('should handle second page', async () => {
      const response = await request(app.getHttpServer())
        .get('/brands?page=2&limit=10')
        .expect(200);

      expect(response.body.page).toBe(2);
      expect(response.body.limit).toBe(10);
      expect(response.body.brands.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Data Validation', () => {
    it('should validate required fields', async () => {
      const invalidBrandData = {
        // Missing required fields
        description: 'Missing required fields',
      };

      await request(app.getHttpServer())
        .post('/brands')
        .send(invalidBrandData)
        .expect(400);
    });

    it('should validate field lengths', async () => {
      const invalidBrandData = {
        code: 'A'.repeat(21), // Too long
        name: 'Valid Name',
        is_active: true,
      };

      await request(app.getHttpServer())
        .post('/brands')
        .send(invalidBrandData)
        .expect(400);
    });

    it('should validate URL formats', async () => {
      const invalidBrandData = {
        code: 'INVALID_URL_TEST',
        name: 'Invalid URL Test',
        logo_url: 'not-a-valid-url',
        website: 'also-not-a-valid-url',
        is_active: true,
      };

      await request(app.getHttpServer())
        .post('/brands')
        .send(invalidBrandData)
        .expect(400);
    });
  });
});
