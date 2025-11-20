import { Injectable } from "@nestjs/common";
import { ProductCategoryRepository } from "../../../infrastructure/database/repositories/product-category.repository";
import { ProductCategory } from "../../../domain/entities/product-category.entity";

@Injectable()
export class GetCategoriesUseCase {
  constructor(private readonly categoryRepository: ProductCategoryRepository) {}

  async execute(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ categories: ProductCategory[]; total: number }> {
    return await this.categoryRepository.findAll(page, limit, search);
  }
}
