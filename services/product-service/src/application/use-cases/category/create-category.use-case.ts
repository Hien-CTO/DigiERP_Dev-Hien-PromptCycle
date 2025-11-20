import { Injectable } from "@nestjs/common";
import { ProductCategoryRepository } from "../../../infrastructure/database/repositories/product-category.repository";
import { CreateProductCategoryDto } from "../../dtos/product-category.dto";
import { ProductCategory } from "../../../domain/entities/product-category.entity";

@Injectable()
export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: ProductCategoryRepository) {}

  async execute(
    createCategoryDto: CreateProductCategoryDto,
    userId: number,
  ): Promise<ProductCategory> {
    // Create new category
    const category = new ProductCategory(
      null, // id will be set by database
      createCategoryDto.name,
      createCategoryDto.description || "",
      createCategoryDto.code || "",
      createCategoryDto.parentCategory || "",
      createCategoryDto.parentId || null,
      createCategoryDto.sortOrder || 0,
      createCategoryDto.isActive !== undefined
        ? createCategoryDto.isActive
        : true,
      createCategoryDto.imageUrl || "",
      createCategoryDto.metaTitle || "",
      createCategoryDto.metaDescription || "",
      createCategoryDto.metaKeywords || "",
      new Date(), // createdAt
      new Date(), // updatedAt
      userId, // createdBy
      userId, // updatedBy
    );

    return await this.categoryRepository.save(category);
  }
}
