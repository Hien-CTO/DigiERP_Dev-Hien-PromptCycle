import { Injectable, NotFoundException } from "@nestjs/common";
import { ProductPriceRepository } from "../../../infrastructure/database/repositories/product-price.repository";
import { ProductPrice } from "../../../domain/entities/product-price.entity";

@Injectable()
export class GetProductPriceUseCase {
  constructor(private readonly priceRepository: ProductPriceRepository) {}

  async execute(id: number): Promise<ProductPrice> {
    const price = await this.priceRepository.findById(id);
    if (!price) {
      throw new NotFoundException(`Product price with ID ${id} not found`);
    }
    return price;
  }
}

