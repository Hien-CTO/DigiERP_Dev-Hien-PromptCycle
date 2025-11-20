import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProductRepository } from "../../../infrastructure/database/repositories/product.repository";
import { CreateProductDto } from "../../dtos/product.dto";
import { Product } from "../../../domain/entities/product.entity";
import { Brand } from "../../../infrastructure/database/entities/brand.entity";
import { FormulaProduct } from "../../../infrastructure/database/entities/formula-product.entity";
import { Unit } from "../../../infrastructure/database/entities/unit.entity";
import { PackagingType } from "../../../infrastructure/database/entities/packaging-type.entity";

@Injectable()
export class CreateProductUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(FormulaProduct)
    private readonly modelRepository: Repository<FormulaProduct>,
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
    @InjectRepository(PackagingType)
    private readonly packagingTypeRepository: Repository<PackagingType>,
  ) {}

  async execute(
    createProductDto: CreateProductDto,
    userId: number,
  ): Promise<Product> {
    // Check if SKU already exists
    const existingProduct = await this.productRepository.findBySku(
      createProductDto.sku,
    );
    if (existingProduct) {
      throw new ConflictException("Product with this SKU already exists");
    }

    // Query Brand, Model, Unit to get names (and validate IDs exist)
    let brandName = "";
    if (createProductDto.brandId) {
      const brand = await this.brandRepository.findOne({
        where: { id: createProductDto.brandId },
      });
      if (!brand) {
        throw new NotFoundException(`Brand with ID ${createProductDto.brandId} not found`);
      }
      brandName = brand.name;
    } else if (createProductDto.brand) {
      brandName = createProductDto.brand;
    }

    let modelName = "";
    if (createProductDto.modelId) {
      const model = await this.modelRepository.findOne({
        where: { id: createProductDto.modelId },
      });
      if (!model) {
        throw new NotFoundException(`Model with ID ${createProductDto.modelId} not found`);
      }
      modelName = model.name;
    } else if (createProductDto.model) {
      modelName = createProductDto.model;
    }

    let unitName = "";
    if (createProductDto.unitId) {
      const unit = await this.unitRepository.findOne({
        where: { id: createProductDto.unitId },
      });
      if (!unit) {
        throw new NotFoundException(`Unit with ID ${createProductDto.unitId} not found`);
      }
      unitName = unit.name;
    } else if (createProductDto.unit) {
      unitName = createProductDto.unit;
    }

    let packagingTypeName = "";
    if (createProductDto.packagingTypeId) {
      const packagingType = await this.packagingTypeRepository.findOne({
        where: { id: createProductDto.packagingTypeId },
      });
      if (!packagingType) {
        throw new NotFoundException(`PackagingType with ID ${createProductDto.packagingTypeId} not found`);
      }
      packagingTypeName = packagingType.display_name;
    }

    // Create new product
    const product = new Product(
      null, // id will be set by database
      createProductDto.sku,
      createProductDto.name,
      createProductDto.description || "",
      createProductDto.categoryId,
      createProductDto.materialId || null,
      brandName,
      modelName,
      unitName,
      createProductDto.weight || 0,
      createProductDto.status || "ACTIVE",
      createProductDto.isActive !== undefined
        ? createProductDto.isActive
        : true,
      createProductDto.imageUrl || "",
      createProductDto.images || "",
      createProductDto.sortOrder || 0,
      createProductDto.isBatchManaged || false,
      createProductDto.hasExpiryDate || false,
      createProductDto.expiryWarningDays ?? 30,
      createProductDto.batchRequired || false,
      createProductDto.stockStatus || "IN_STOCK",
      new Date(), // createdAt
      new Date(), // updatedAt
      userId, // createdBy
      userId, // updatedBy
      createProductDto.brandId || undefined, // Pass brandId
      createProductDto.modelId || undefined, // Pass modelId
      createProductDto.unitId || undefined, // Pass unitId
      createProductDto.packagingTypeId || undefined, // Pass packagingTypeId
      createProductDto.packaging || undefined, // Pass packaging
    );

    return await this.productRepository.save(product);
  }
}
