import { ProductCategory } from "../entities/product-category.entity";

export interface ProductCategoryRepository {
  findById(id: number): Promise<ProductCategory | null>;
  findAll(
    page?: number,
    limit?: number,
    search?: string,
  ): Promise<{ categories: ProductCategory[]; total: number }>;
  findByParentId(parentId: number): Promise<ProductCategory[]>;
  findRootCategories(): Promise<ProductCategory[]>;
  save(category: ProductCategory): Promise<ProductCategory>;
  update(
    id: number,
    category: Partial<ProductCategory>,
  ): Promise<ProductCategory>;
  delete(id: number): Promise<void>;
  findActiveCategories(): Promise<ProductCategory[]>;
}
