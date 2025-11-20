import { Injectable, NotFoundException, BadRequestException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProductRepository } from "../../../infrastructure/database/repositories/product.repository";
import { UpdateProductDto } from "../../dtos/product.dto";
import { Product } from "../../../domain/entities/product.entity";
import { Brand } from "../../../infrastructure/database/entities/brand.entity";
import { FormulaProduct } from "../../../infrastructure/database/entities/formula-product.entity";
import { Unit } from "../../../infrastructure/database/entities/unit.entity";
import { PackagingType } from "../../../infrastructure/database/entities/packaging-type.entity";
import { ProductCategory } from "../../../infrastructure/database/entities/product-category.entity";

@Injectable()
export class UpdateProductUseCase {
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
    @InjectRepository(ProductCategory)
    private readonly categoryRepository: Repository<ProductCategory>,
  ) {}

  async execute(
    id: number,
    updateProductDto: UpdateProductDto,
    userId: number,
  ): Promise<Product> {
    // Check if product exists
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Check if SKU is being changed and if it already exists
    if (updateProductDto.sku && updateProductDto.sku !== existingProduct.sku) {
      const productWithSku = await this.productRepository.findBySku(
        updateProductDto.sku,
      );
      if (productWithSku) {
        throw new ConflictException("Product with this SKU already exists");
      }
    }

    // Prepare update data
    const updateData: Partial<Product> = {
      ...updateProductDto,
      updatedBy: userId,
      updatedAt: new Date(),
    };

    // Validate categoryId if provided
    if (updateProductDto.categoryId !== undefined) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateProductDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException(`Category with ID ${updateProductDto.categoryId} not found`);
      }
      (updateData as any).categoryId = updateProductDto.categoryId;
    }

    // Query Brand, Model, Unit to get names if IDs are provided
    if (updateProductDto.brandId !== undefined) {
      const brand = await this.brandRepository.findOne({
        where: { id: updateProductDto.brandId },
      });
      if (!brand) {
        throw new NotFoundException(`Brand with ID ${updateProductDto.brandId} not found`);
      }
      (updateData as any).brand = brand.name;
      (updateData as any).brandId = updateProductDto.brandId;
    } else if (updateProductDto.brand !== undefined) {
      (updateData as any).brand = updateProductDto.brand;
    }

    if (updateProductDto.modelId !== undefined) {
      const model = await this.modelRepository.findOne({
        where: { id: updateProductDto.modelId },
      });
      if (!model) {
        throw new NotFoundException(`Model with ID ${updateProductDto.modelId} not found`);
      }
      (updateData as any).model = model.name;
      (updateData as any).modelId = updateProductDto.modelId;
    } else if (updateProductDto.model !== undefined) {
      (updateData as any).model = updateProductDto.model;
    }

    if (updateProductDto.unitId !== undefined) {
      const unit = await this.unitRepository.findOne({
        where: { id: updateProductDto.unitId },
      });
      if (!unit) {
        throw new NotFoundException(`Unit with ID ${updateProductDto.unitId} not found`);
      }
      (updateData as any).unit = unit.name;
      (updateData as any).unitId = updateProductDto.unitId;
    } else if (updateProductDto.unit !== undefined) {
      (updateData as any).unit = updateProductDto.unit;
    }

    if (updateProductDto.packagingTypeId !== undefined) {
      const packagingType = await this.packagingTypeRepository.findOne({
        where: { id: updateProductDto.packagingTypeId },
      });
      if (!packagingType) {
        throw new NotFoundException(`PackagingType with ID ${updateProductDto.packagingTypeId} not found`);
      }
      (updateData as any).packagingTypeId = updateProductDto.packagingTypeId;
    }

    if (updateProductDto.packaging !== undefined) {
      (updateData as any).packaging = updateProductDto.packaging;
    }

    // Update product
    return await this.productRepository.update(id, updateData);
  }
}
