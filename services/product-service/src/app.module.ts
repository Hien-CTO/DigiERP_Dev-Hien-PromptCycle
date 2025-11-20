import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule, getRepositoryToken } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { Repository } from "typeorm";

import { getTypeOrmConfig } from "./infrastructure/database/config/typeorm.config";
import {
  ProductCategory,
  Product as ProductEntity,
  ProductPrice,
  Material,
  Brand,
  FormulaProduct,
  Unit,
  StockStatus,
  ProductStatus,
  PackagingType,
} from "./infrastructure/database/entities";
import {
  ProductRepository,
  ProductCategoryRepository,
  ProductPriceRepository,
  MaterialRepository,
} from "./infrastructure/database/repositories";
import { JwtStrategy } from "./infrastructure/external/jwt.strategy";
import { RedisService } from "./infrastructure/external/redis.service";
import { StockLevelChangedConsumer } from "./infrastructure/messaging/stock-level-changed.consumer";

import { ProductController } from "./presentation/controllers/product.controller";
import { CategoryController } from "./presentation/controllers/category.controller";
import { MaterialController } from "./presentation/controllers/material.controller";
import { BrandController } from "./presentation/controllers/brand.controller";
import { UnitController } from "./presentation/controllers/unit.controller";
import { FormulaProductController } from "./presentation/controllers/formula-product.controller";
import { PackagingTypeController } from "./presentation/controllers/packaging-type.controller";
import { ProductPriceController } from "./presentation/controllers/product-price.controller";

import { CreateProductUseCase } from "./application/use-cases/product/create-product.use-case";
import { GetProductUseCase } from "./application/use-cases/product/get-product.use-case";
import { GetProductsUseCase } from "./application/use-cases/product/get-products.use-case";
import { UpdateProductUseCase } from "./application/use-cases/product/update-product.use-case";
import { DeleteProductUseCase } from "./application/use-cases/product/delete-product.use-case";
import { CreateCategoryUseCase } from "./application/use-cases/category/create-category.use-case";
import { GetCategoryUseCase } from "./application/use-cases/category/get-category.use-case";
import { GetCategoriesUseCase } from "./application/use-cases/category/get-categories.use-case";
import { UpdateCategoryUseCase } from "./application/use-cases/category/update-category.use-case";
import { DeleteCategoryUseCase } from "./application/use-cases/category/delete-category.use-case";

import { CreateProductPriceUseCase } from "./application/use-cases/product-price/create-product-price.use-case";
import { GetProductPriceUseCase } from "./application/use-cases/product-price/get-product-price.use-case";
import { GetProductPricesUseCase } from "./application/use-cases/product-price/get-product-prices.use-case";
import { UpdateProductPriceUseCase } from "./application/use-cases/product-price/update-product-price.use-case";
import { DeleteProductPriceUseCase } from "./application/use-cases/product-price/delete-product-price.use-case";

import { BrandService } from "./application/services/brand.service";
import { UnitService } from "./application/services/unit.service";
import { FormulaProductService } from "./application/services/formula-product.service";
import { PackagingTypeService } from "./application/services/packaging-type.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env.local',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService) => getTypeOrmConfig(configService),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([ProductCategory, ProductEntity, ProductPrice, Material, Brand, FormulaProduct, Unit, StockStatus, ProductStatus, PackagingType]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || "DigiERP_Super_Secret_JWT_Key_2024_Production_Ready_32_Chars",
      signOptions: { expiresIn: "1h" },
    }),
  ],
  controllers: [
    ProductController, 
    CategoryController, 
    MaterialController,
    BrandController,
    UnitController,
    FormulaProductController,
    PackagingTypeController,
    ProductPriceController,
  ],
  providers: [
    // Repositories
    ProductRepository,
    ProductCategoryRepository,
    ProductPriceRepository,
    MaterialRepository,
    // Use Cases
    CreateProductUseCase,
    GetProductUseCase,
    GetProductsUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    CreateCategoryUseCase,
    GetCategoryUseCase,
    GetCategoriesUseCase,
    UpdateCategoryUseCase,
    DeleteCategoryUseCase,
    CreateProductPriceUseCase,
    GetProductPriceUseCase,
    GetProductPricesUseCase,
    UpdateProductPriceUseCase,
    DeleteProductPriceUseCase,
    // Services
    BrandService,
    UnitService,
    FormulaProductService,
    PackagingTypeService,
    // External Services
    JwtStrategy,
    RedisService,
    StockLevelChangedConsumer,
  ],
})
export class AppModule {}
