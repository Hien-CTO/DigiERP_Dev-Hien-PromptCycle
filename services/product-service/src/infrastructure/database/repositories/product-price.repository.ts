import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  ProductPrice as ProductPriceEntity,
} from "../entities/product-price.entity";
import { ProductPriceRepository as IProductPriceRepository } from "../../../domain/repositories/product-price.repository.interface";
import { ProductPrice } from "../../../domain/entities/product-price.entity";

@Injectable()
export class ProductPriceRepository implements IProductPriceRepository {
  constructor(
    @InjectRepository(ProductPriceEntity)
    private readonly priceRepo: Repository<ProductPriceEntity>,
  ) {}

  async findById(id: number): Promise<ProductPrice | null> {
    const price = await this.priceRepo.findOne({ where: { id } });
    return price ? this.toDomain(price) : null;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    productId?: number,
  ): Promise<{ prices: ProductPrice[]; total: number }> {
    const queryBuilder = this.priceRepo.createQueryBuilder("price");

    if (productId) {
      queryBuilder.where("price.product_id = :productId", { productId });
    }

    if (search) {
      queryBuilder.andWhere(
        "(price.notes LIKE :search OR CAST(price.price AS CHAR) LIKE :search)",
        { search: `%${search}%` },
      );
    }

    const [prices, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy("price.created_at", "DESC")
      .getManyAndCount();

    return {
      prices: prices.map((price) => this.toDomain(price)),
      total,
    };
  }

  async findByProductId(productId: number): Promise<ProductPrice[]> {
    const prices = await this.priceRepo.find({
      where: { product_id: productId },
    });
    return prices.map((price) => this.toDomain(price));
  }



  async findActivePricesByProductId(
    productId: number,
  ): Promise<ProductPrice[]> {
    const prices = await this.priceRepo.find({
      where: {
        product_id: productId,
        is_active: true,
      },
      order: {
        created_at: "DESC",
      },
    });
    return prices.map((price) => this.toDomain(price));
  }

  async save(price: ProductPrice): Promise<ProductPrice> {
    const priceEntity = this.toEntity(price);
    const savedPrice = await this.priceRepo.save(priceEntity);
    return this.toDomain(savedPrice);
  }

  async update(
    id: number,
    price: Partial<ProductPrice>,
  ): Promise<ProductPrice> {
    await this.priceRepo.update(id, this.toEntity(price as ProductPrice));
    const updatedPrice = await this.priceRepo.findOne({ where: { id } });
    if (!updatedPrice) {
      throw new NotFoundException(`Product price with ID ${id} not found after update`);
    }
    return this.toDomain(updatedPrice);
  }

  async delete(id: number): Promise<void> {
    await this.priceRepo.delete(id);
  }

  async deleteByProductId(productId: number): Promise<void> {
    await this.priceRepo.delete({ product_id: productId });
  }

  private toDomain(entity: ProductPriceEntity): ProductPrice {
    return new ProductPrice(
      entity.id,
      entity.product_id,
      entity.price,
      entity.document_price,
      entity.is_active,
      entity.notes,
      entity.created_at,
      entity.updated_at,
      entity.created_by,
      entity.updated_by,
    );
  }

  private toEntity(domain: ProductPrice): ProductPriceEntity {
    const entity = new ProductPriceEntity();
    entity.id = domain.id;
    entity.product_id = domain.productId;
    entity.price = domain.price;
    entity.document_price = domain.documentPrice;
    entity.is_active = domain.isActive;
    entity.notes = domain.notes;
    entity.created_at = domain.createdAt;
    entity.updated_at = domain.updatedAt;
    entity.created_by = domain.createdBy;
    entity.updated_by = domain.updatedBy;
    return entity;
  }
}