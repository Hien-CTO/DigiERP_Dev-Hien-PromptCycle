import { Product } from "../entities/product.entity";

export interface ProductRepository {
  findById(id: number): Promise<Product | null>;
  findBySku(sku: string): Promise<Product | null>;
  findAll(
    page?: number,
    limit?: number,
    search?: string,
  ): Promise<{ products: Product[]; total: number }>;
  findByCategoryId(categoryId: number): Promise<Product[]>;
  save(product: Product): Promise<Product>;
  update(id: number, product: Partial<Product>): Promise<Product>;
  delete(id: number): Promise<void>;
  findActiveProducts(): Promise<Product[]>;
  findByStatus(statusId: number): Promise<Product[]>;
}
