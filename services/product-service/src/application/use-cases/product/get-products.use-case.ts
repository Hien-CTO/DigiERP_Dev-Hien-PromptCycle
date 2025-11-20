import { Injectable } from "@nestjs/common";
import { ProductRepository } from "../../../infrastructure/database/repositories/product.repository";
import { Product } from "../../../domain/entities/product.entity";

@Injectable()
export class GetProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ products: Product[]; total: number }> {
    return await this.productRepository.findAll(page, limit, search);
  }
}
