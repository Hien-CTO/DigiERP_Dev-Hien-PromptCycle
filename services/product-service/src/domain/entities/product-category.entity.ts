export class ProductCategory {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly description: string,
    public readonly code: string,
    public readonly parentCategory: string,
    public readonly parentId: number,
    public readonly sortOrder: number,
    public readonly isActive: boolean,
    public readonly imageUrl: string,
    public readonly metaTitle: string,
    public readonly metaDescription: string,
    public readonly metaKeywords: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly createdBy: number,
    public readonly updatedBy: number,
  ) {}
}
