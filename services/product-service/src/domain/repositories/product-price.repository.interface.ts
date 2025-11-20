import { ProductPrice } from "../entities/product-price.entity";

export interface ProductPriceRepository {
  findById(id: number): Promise<ProductPrice | null>;
  findAll(
    page: number,
    limit: number,
    search?: string,
    productId?: number,
  ): Promise<{ prices: ProductPrice[]; total: number }>;
  findByProductId(productId: number): Promise<ProductPrice[]>;
  findActivePricesByProductId(productId: number): Promise<ProductPrice[]>;
  save(price: ProductPrice): Promise<ProductPrice>;
  update(id: number, price: Partial<ProductPrice>): Promise<ProductPrice>;
  delete(id: number): Promise<void>;
  deleteByProductId(productId: number): Promise<void>;
}