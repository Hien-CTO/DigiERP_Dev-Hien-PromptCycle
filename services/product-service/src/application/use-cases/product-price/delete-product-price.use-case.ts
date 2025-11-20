import { Injectable, NotFoundException } from "@nestjs/common";
import { ProductPriceRepository } from "../../../infrastructure/database/repositories/product-price.repository";

@Injectable()
export class DeleteProductPriceUseCase {
  constructor(private readonly priceRepository: ProductPriceRepository) {}

  async execute(id: number): Promise<void> {
    const price = await this.priceRepository.findById(id);
    if (!price) {
      throw new NotFoundException(`Product price with ID ${id} not found`);
    }
    await this.priceRepository.delete(id);
  }
}

