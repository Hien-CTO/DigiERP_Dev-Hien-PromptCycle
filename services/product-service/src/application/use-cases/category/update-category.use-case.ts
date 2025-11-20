import { Injectable, NotFoundException } from "@nestjs/common";
import { ProductCategoryRepository } from "../../../infrastructure/database/repositories/product-category.repository";
import { UpdateProductCategoryDto } from "../../dtos/product-category.dto";
import { ProductCategory } from "../../../domain/entities/product-category.entity";

@Injectable()
export class UpdateCategoryUseCase {
  constructor(private readonly categoryRepository: ProductCategoryRepository) {}

  async execute(
    id: number,
    updateCategoryDto: UpdateProductCategoryDto,
    userId: number,
  ): Promise<ProductCategory> {
    // Check if category exists
    const existingCategory = await this.categoryRepository.findById(id);
    if (!existingCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Update category
    return await this.categoryRepository.update(id, {
      ...updateCategoryDto,
      updatedBy: userId,
      updatedAt: new Date(),
    });
  }
}
