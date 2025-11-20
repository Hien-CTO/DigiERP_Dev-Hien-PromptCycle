import { Injectable, NotFoundException } from "@nestjs/common";
import { ProductRepository } from "../../../infrastructure/database/repositories/product.repository";
import { ProductPriceRepository } from "../../../infrastructure/database/repositories/product-price.repository";

@Injectable()
export class DeleteProductUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productPriceRepository: ProductPriceRepository,
  ) {}

  async execute(id: number): Promise<void> {
    // Check if product exists
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Delete all product prices associated with this product first
    await this.productPriceRepository.deleteByProductId(id);

    // Delete product
    await this.productRepository.delete(id);
  }
}
