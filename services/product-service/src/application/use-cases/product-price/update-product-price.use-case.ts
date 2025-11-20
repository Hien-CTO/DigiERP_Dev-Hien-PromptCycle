import { Injectable, NotFoundException } from "@nestjs/common";
import { ProductPriceRepository } from "../../../infrastructure/database/repositories/product-price.repository";
import { UpdateProductPriceDto } from "../../dtos/product-price.dto";
import { ProductPrice } from "../../../domain/entities/product-price.entity";

@Injectable()
export class UpdateProductPriceUseCase {
  constructor(private readonly priceRepository: ProductPriceRepository) {}

  async execute(
    id: number,
    updatePriceDto: UpdateProductPriceDto,
    userId: number,
  ): Promise<ProductPrice> {
    const existingPrice = await this.priceRepository.findById(id);
    if (!existingPrice) {
      throw new NotFoundException(`Product price with ID ${id} not found`);
    }

    // Build update data object, converting date strings to Date objects
    const updateData: any = {
      updatedBy: userId,
      updatedAt: new Date(),
    };

    // Only include fields that are provided in the DTO
    if (updatePriceDto.price !== undefined) {
      updateData.price = updatePriceDto.price;
    }
    if (updatePriceDto.documentPrice !== undefined) {
      updateData.documentPrice = updatePriceDto.documentPrice;
    }
    if (updatePriceDto.isActive !== undefined) {
      updateData.isActive = updatePriceDto.isActive;
    }
    if (updatePriceDto.notes !== undefined) {
      updateData.notes = updatePriceDto.notes;
    }

    return await this.priceRepository.update(id, updateData);
  }
}

