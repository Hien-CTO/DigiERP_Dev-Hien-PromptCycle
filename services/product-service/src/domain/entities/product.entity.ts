export class Product {
  public readonly brandId?: number;
  public readonly modelId?: number;
  public readonly unitId?: number;
  public readonly packagingTypeId?: number;
  public readonly packaging?: string;

  constructor(
    public readonly id: number,
    public readonly sku: string,
    public readonly name: string,
    public readonly description: string,
    public readonly categoryId: number,
    public readonly materialId: number,
    public readonly brand: string,
    public readonly model: string,
    public readonly unit: string,
    public readonly weight: number,
    public readonly status: string,
    public readonly isActive: boolean,
    public readonly imageUrl: string,
    public readonly images: string,
    public readonly sortOrder: number,
    public readonly isBatchManaged: boolean,
    public readonly hasExpiryDate: boolean,
    public readonly expiryWarningDays: number,
    public readonly batchRequired: boolean,
    public readonly stockStatus: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly createdBy: number,
    public readonly updatedBy: number,
    brandId?: number,
    modelId?: number,
    unitId?: number,
    packagingTypeId?: number,
    packaging?: string,
  ) {
    this.brandId = brandId;
    this.modelId = modelId;
    this.unitId = unitId;
    this.packagingTypeId = packagingTypeId;
    this.packaging = packaging;
  }
}
