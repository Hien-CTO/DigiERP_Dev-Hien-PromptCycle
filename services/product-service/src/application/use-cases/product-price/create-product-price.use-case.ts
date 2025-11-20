import { Injectable, NotFoundException } from "@nestjs/common";
import { ProductPriceRepository } from "../../../infrastructure/database/repositories/product-price.repository";
import { CreateProductPriceDto } from "../../dtos/product-price.dto";
import { ProductPrice } from "../../../domain/entities/product-price.entity";

@Injectable()
export class CreateProductPriceUseCase {
  constructor(private readonly priceRepository: ProductPriceRepository) {}

  async execute(
    createPriceDto: CreateProductPriceDto,
    userId: number,
  ): Promise<ProductPrice> {
    const price = new ProductPrice(
      null, // id will be set by database
      createPriceDto.productId,
      createPriceDto.price,
      createPriceDto.documentPrice || null,
      createPriceDto.isActive !== undefined ? createPriceDto.isActive : true,
      createPriceDto.notes || null,
      new Date(), // createdAt
      new Date(), // updatedAt
      userId, // createdBy
      userId, // updatedBy
    );

    return await this.priceRepository.save(price);
  }
}

