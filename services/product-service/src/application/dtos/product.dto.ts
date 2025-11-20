import { IsString, IsNumber, IsOptional, IsBoolean } from "class-validator";
import { Type } from "class-transformer";

export class CreateProductDto {
  @IsString()
  sku: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Type(() => Number)
  categoryId: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  materialId?: number;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  brandId?: number;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  modelId?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  unitId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  packagingTypeId?: number;

  @IsOptional()
  @IsString()
  packaging?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  weight?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  images?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isBatchManaged?: boolean;

  @IsOptional()
  @IsBoolean()
  hasExpiryDate?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  expiryWarningDays?: number;

  @IsOptional()
  @IsBoolean()
  batchRequired?: boolean;

  @IsOptional()
  @IsString()
  stockStatus?: string;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  categoryId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  materialId?: number;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  brandId?: number;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  modelId?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  unitId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  packagingTypeId?: number;

  @IsOptional()
  @IsString()
  packaging?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  weight?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  images?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isBatchManaged?: boolean;

  @IsOptional()
  @IsBoolean()
  hasExpiryDate?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  expiryWarningDays?: number;

  @IsOptional()
  @IsBoolean()
  batchRequired?: boolean;

  @IsOptional()
  @IsString()
  stockStatus?: string;
}

export class ProductResponseDto {
  id: number;
  sku: string;
  name: string;
  description: string;
  categoryId: number;
  materialId: number;
  category?: {
    id: number;
    name: string;
    displayName: string;
  };
  material?: {
    id: number;
    name: string;
    displayName: string;
  };
  brand: string;
  model: string;
  unit: string;
  packagingTypeId?: number;
  packaging?: string;
  weight: number;
  status: string;
  isActive: boolean;
  imageUrl: string;
  images: string;
  sortOrder: number;
  isBatchManaged: boolean;
  hasExpiryDate: boolean;
  expiryWarningDays: number;
  batchRequired: boolean;
  stockStatus: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
  updatedBy: number;
}

export class ProductListResponseDto {
  products: ProductResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
