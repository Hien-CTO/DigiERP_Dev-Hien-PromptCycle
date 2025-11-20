import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProductCategory as ProductCategoryEntity } from "../entities/product-category.entity";
import { ProductCategoryRepository as IProductCategoryRepository } from "../../../domain/repositories/product-category.repository.interface";
import { ProductCategory } from "../../../domain/entities/product-category.entity";

@Injectable()
export class ProductCategoryRepository implements IProductCategoryRepository {
  constructor(
    @InjectRepository(ProductCategoryEntity)
    private readonly categoryRepo: Repository<ProductCategoryEntity>,
  ) {}

  async findById(id: number): Promise<ProductCategory | null> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    return category ? this.toDomain(category) : null;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ categories: ProductCategory[]; total: number }> {
    const queryBuilder = this.categoryRepo.createQueryBuilder("category");

    if (search) {
      queryBuilder.where(
        "category.name LIKE :search OR category.description LIKE :search OR category.code LIKE :search",
        { search: `%${search}%` },
      );
    }

    const safePage = Math.max(page, 1);
    const safeLimit = Math.max(limit, 1);

    const [categories, total] = await queryBuilder
      .skip((safePage - 1) * safeLimit)
      .take(safeLimit)
      .orderBy("category.sort_order", "ASC")
      .addOrderBy("category.created_at", "DESC")
      .getManyAndCount();

    return {
      categories: categories.map((category) => this.toDomain(category)),
      total,
    };
  }

  async findByParentId(parentId: number): Promise<ProductCategory[]> {
    const categories = await this.categoryRepo.find({
      where: { parent_id: parentId },
    });
    return categories.map((category) => this.toDomain(category));
  }

  async findRootCategories(): Promise<ProductCategory[]> {
    const categories = await this.categoryRepo.find({
      where: { parent_id: null },
    });
    return categories.map((category) => this.toDomain(category));
  }

  async save(category: ProductCategory): Promise<ProductCategory> {
    const categoryEntity = this.toEntity(category);
    const savedCategory = await this.categoryRepo.save(categoryEntity);
    return this.toDomain(savedCategory);
  }

  async update(
    id: number,
    category: Partial<ProductCategory>,
  ): Promise<ProductCategory> {
    await this.categoryRepo.update(
      id,
      this.toEntity(category as ProductCategory),
    );
    const updatedCategory = await this.categoryRepo.findOne({ where: { id } });
    if (!updatedCategory) {
      throw new NotFoundException(`Category with ID ${id} not found after update`);
    }
    return this.toDomain(updatedCategory);
  }

  async delete(id: number): Promise<void> {
    await this.categoryRepo.delete(id);
  }

  async findActiveCategories(): Promise<ProductCategory[]> {
    const categories = await this.categoryRepo.find({
      where: { is_active: true },
    });
    return categories.map((category) => this.toDomain(category));
  }

  private toDomain(entity: ProductCategoryEntity): ProductCategory {
    return new ProductCategory(
      entity.id,
      entity.name,
      entity.description,
      entity.code,
      entity.parent_category,
      entity.parent_id,
      entity.sort_order,
      entity.is_active,
      entity.image_url,
      entity.meta_title,
      entity.meta_description,
      entity.meta_keywords,
      entity.created_at,
      entity.updated_at,
      entity.created_by,
      entity.updated_by,
    );
  }

  private toEntity(domain: ProductCategory): ProductCategoryEntity {
    const entity = new ProductCategoryEntity();
    entity.id = domain.id;
    entity.name = domain.name;
    entity.description = domain.description;
    entity.code = domain.code;
    entity.parent_category = domain.parentCategory;
    entity.parent_id = domain.parentId;
    entity.sort_order = domain.sortOrder;
    entity.is_active = domain.isActive;
    entity.image_url = domain.imageUrl;
    entity.meta_title = domain.metaTitle;
    entity.meta_description = domain.metaDescription;
    entity.meta_keywords = domain.metaKeywords;
    entity.created_at = domain.createdAt;
    entity.updated_at = domain.updatedAt;
    entity.created_by = domain.createdBy;
    entity.updated_by = domain.updatedBy;
    return entity;
  }
}
