import { Injectable, NotFoundException } from "@nestjs/common";
import { ProductRepository } from "../../../infrastructure/database/repositories/product.repository";
import { Product } from "../../../domain/entities/product.entity";

@Injectable()
export class GetProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: number): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }
}
