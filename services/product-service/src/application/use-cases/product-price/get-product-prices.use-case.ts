import { Injectable } from "@nestjs/common";
import { ProductPriceRepository } from "../../../infrastructure/database/repositories/product-price.repository";
import { ProductPrice } from "../../../domain/entities/product-price.entity";

@Injectable()
export class GetProductPricesUseCase {
  constructor(private readonly priceRepository: ProductPriceRepository) {}

  async execute(
    page: number = 1,
    limit: number = 10,
    search?: string,
    productId?: number,
  ): Promise<{ prices: ProductPrice[]; total: number }> {
    return await this.priceRepository.findAll(
      page,
      limit,
      search,
      productId,
    );
  }
}

