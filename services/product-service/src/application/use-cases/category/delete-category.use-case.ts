import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { ProductCategoryRepository } from "../../../infrastructure/database/repositories/product-category.repository";
import { ProductRepository } from "../../../infrastructure/database/repositories/product.repository";

@Injectable()
export class DeleteCategoryUseCase {
  constructor(
    private readonly categoryRepository: ProductCategoryRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(id: number): Promise<void> {
    // Check if category exists
    const existingCategory = await this.categoryRepository.findById(id);
    if (!existingCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Check if category has subcategories
    const subcategories = await this.categoryRepository.findByParentId(id);
    if (subcategories.length > 0) {
      throw new BadRequestException("Cannot delete category that has subcategories. Please delete or move subcategories first.");
    }

    // Check if category has products
    const products = await this.productRepository.findByCategoryId(id);
    if (products.length > 0) {
      throw new BadRequestException(`Cannot delete category that has ${products.length} product(s). Please delete or move products to another category first.`);
    }

    // Delete category
    await this.categoryRepository.delete(id);
  }
}
