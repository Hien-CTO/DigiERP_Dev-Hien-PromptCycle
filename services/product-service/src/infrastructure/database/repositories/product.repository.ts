import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Product as ProductEntity } from "../entities/product.entity";
import { ProductRepository as IProductRepository } from "../../../domain/repositories/product.repository.interface";
import { Product } from "../../../domain/entities/product.entity";

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
  ) {}

  async findById(id: number): Promise<Product | null> {
    const product = await this.productRepo.findOne({ 
      where: { id },
      relations: ['category', 'material']
    });
    return product ? this.toDomain(product) : null;
  }

  async findBySku(sku: string): Promise<Product | null> {
    const product = await this.productRepo.findOne({ 
      where: { sku },
      relations: ['category', 'material']
    });
    return product ? this.toDomain(product) : null;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ products: Product[]; total: number }> {
    try {
      console.log(`[ProductRepository] findAll - page: ${page}, limit: ${limit}, search: ${search}`);
      const queryBuilder = this.productRepo.createQueryBuilder("product");

      if (search) {
        queryBuilder.where(
          "product.name LIKE :search OR product.sku LIKE :search OR product.description LIKE :search",
          { search: `%${search}%` },
        );
      }

      const safePage = Math.max(page, 1);
      const safeLimit = Math.max(limit, 1);

      const [products, total] = await queryBuilder
        .leftJoinAndSelect("product.category", "category")
        .leftJoinAndSelect("product.material", "material")
        .leftJoinAndSelect("product.brand", "brand")
        .leftJoinAndSelect("product.model", "model")
        .leftJoinAndSelect("product.unit", "unit")
        .leftJoinAndSelect("product.packagingType", "packagingType")
        .leftJoinAndSelect("product.productStatus", "productStatus")
        .leftJoinAndSelect("product.stockStatus", "stockStatus")
        .skip((safePage - 1) * safeLimit)
        .take(safeLimit)
        .orderBy("product.created_at", "DESC")
        .getManyAndCount();

      console.log(`[ProductRepository] findAll - query executed, found ${products.length} products, total: ${total}`);

      return {
        products: products.map((product) => {
          try {
            return this.toDomain(product);
          } catch (error) {
            console.error(`[ProductRepository] Error mapping product ${product.id}:`, error);
            throw error;
          }
        }),
        total,
      };
    } catch (error) {
      console.error(`[ProductRepository] findAll error:`, error);
      throw error;
    }
  }

  async findByCategoryId(categoryId: number): Promise<Product[]> {
    const products = await this.productRepo.find({
      where: { category_id: categoryId },
    });
    return products.map((product) => this.toDomain(product));
  }

  async save(product: Product): Promise<Product> {
    const productEntity = this.toEntity(product);
    const savedProduct = await this.productRepo.save(productEntity);
    // Query lại với đầy đủ relations để lấy brand, model, unit names
    const productWithRelations = await this.productRepo.findOne({
      where: { id: savedProduct.id },
      relations: ['category', 'material', 'brand', 'model', 'unit', 'packagingType', 'productStatus', 'stockStatus'],
    });
    return productWithRelations ? this.toDomain(productWithRelations) : product;
  }

  async update(id: number, product: Partial<Product>): Promise<Product> {
    await this.productRepo.update(id, this.toEntity(product as Product));
    // Query lại với đầy đủ relations để lấy brand, model, unit names
    const updatedProduct = await this.productRepo.findOne({
      where: { id },
      relations: ['category', 'material', 'brand', 'model', 'unit', 'packagingType', 'productStatus', 'stockStatus'],
    });
    if (!updatedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found after update`);
    }
    return this.toDomain(updatedProduct);
  }

  async delete(id: number): Promise<void> {
    await this.productRepo.delete(id);
  }

  async findActiveProducts(): Promise<Product[]> {
    const products = await this.productRepo.find({
      where: { is_active: true },
    });
    return products.map((product) => this.toDomain(product));
  }

  async findByStatus(statusId: number): Promise<Product[]> {
    const products = await this.productRepo.find({ where: { status_id: statusId } });
    return products.map((product) => this.toDomain(product));
  }

  private toDomain(entity: ProductEntity): Product {
    try {
      return new Product(
        entity.id,
        entity.sku,
        entity.name,
        entity.description,
        entity.category_id,
        entity.material_id,
        entity.brand?.name ,
        entity.model?.name,
        entity.unit?.name ,
        entity.weight,
        entity.productStatus?.name || 'ACTIVE',
        entity.is_active,
        entity.image_url,
        entity.images,
        entity.sort_order,
        entity.is_batch_managed,
        entity.has_expiry_date,
        (entity as any).expiry_warning_days ?? 30,
        entity.batch_required,
        entity.stockStatus?.name || 'IN_STOCK',
        entity.created_at,
        entity.updated_at,
        entity.created_by,
        entity.updated_by,
        entity.brand_id ,
        entity.model_id ,
        entity.unit_id,
        entity.packaging_type_id ,
        entity.packaging,
      );
    } catch (error) {
      console.error(`[ProductRepository] toDomain error for entity id ${entity.id}:`, error);
      throw error;
    }
  }

  private toEntity(domain: Product): ProductEntity {
    const entity = new ProductEntity();
    entity.id = domain.id;
    entity.sku = domain.sku;
    entity.name = domain.name;
    entity.description = domain.description;
    entity.category_id = domain.categoryId;
    entity.material_id = domain.materialId;
    entity.brand_id = domain.brandId;
    entity.model_id = domain.modelId;
    entity.unit_id = domain.unitId;
    entity.packaging_type_id = domain.packagingTypeId;
    entity.packaging = domain.packaging;
    // Note: brand, model, unit, status, stockStatus are relationships, not direct fields
    entity.weight = domain.weight;
    entity.is_active = domain.isActive;
    entity.image_url = domain.imageUrl;
    entity.images = domain.images;
    entity.sort_order = domain.sortOrder;
    (entity as any).is_batch_managed = domain.isBatchManaged;
    (entity as any).has_expiry_date = domain.hasExpiryDate;
    (entity as any).expiry_warning_days = domain.expiryWarningDays;
    (entity as any).batch_required = domain.batchRequired;
    entity.created_at = domain.createdAt;
    entity.updated_at = domain.updatedAt;
    entity.created_by = domain.createdBy;
    entity.updated_by = domain.updatedBy;
    return entity;
  }

  private numberToStatus(statusId: number): string {
    const statusMap: Record<number, string> = {
      1: 'ACTIVE',
      2: 'INACTIVE',
      3: 'DISCONTINUED',
    };
    return statusMap[statusId] || 'ACTIVE';
  }

  private statusToNumber(status: string): number {
    const statusMap: Record<string, number> = {
      'ACTIVE': 1,
      'INACTIVE': 2,
      'DISCONTINUED': 3,
    };
    return statusMap[status] || 1;
  }

  private numberToStockStatus(stockStatusId: number): string {
    const stockStatusMap: Record<number, string> = {
      1: 'IN_STOCK',
      2: 'OUT_OF_STOCK',
      3: 'LOW_STOCK',
      4: 'ON_ORDER',
    };
    return stockStatusMap[stockStatusId] || 'IN_STOCK';
  }

  private stockStatusToNumber(stockStatus: string): number {
    const stockStatusMap: Record<string, number> = {
      'IN_STOCK': 1,
      'OUT_OF_STOCK': 2,
      'LOW_STOCK': 3,
      'ON_ORDER': 4,
    };
    return stockStatusMap[stockStatus] || 1;
  }

  private getBrandId(brandName: string): number {
    // This is a simplified implementation
    // In a real application, you would query the database for the brand ID
    return 1; // Default brand ID
  }

  private getModelId(modelName: string): number {
    // This is a simplified implementation
    // In a real application, you would query the database for the model ID
    return 1; // Default model ID
  }

  private getUnitId(unitName: string): number {
    // This is a simplified implementation
    // In a real application, you would query the database for the unit ID
    return 1; // Default unit ID
  }
}
