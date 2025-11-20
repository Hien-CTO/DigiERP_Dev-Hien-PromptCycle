import { Injectable, NotFoundException } from "@nestjs/common";
import { ProductCategoryRepository } from "../../../infrastructure/database/repositories/product-category.repository";
import { ProductCategory } from "../../../domain/entities/product-category.entity";

@Injectable()
export class GetCategoryUseCase {
  constructor(private readonly categoryRepository: ProductCategoryRepository) {}

  async execute(id: number): Promise<ProductCategory> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }
}
