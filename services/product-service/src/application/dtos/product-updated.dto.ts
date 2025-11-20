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
  @IsNumber()
  @Type(() => Number)
  brandId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  modelId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  unitId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  statusId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  stockStatusId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  weight?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  length?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  width?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  height?: number;

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
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsString()
  metaKeywords?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isDigital?: boolean;
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
  @IsNumber()
  @Type(() => Number)
  brandId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  modelId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  unitId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  statusId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  stockStatusId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  weight?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  length?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  width?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  height?: number;

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
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsString()
  metaKeywords?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isDigital?: boolean;
}

export class ProductResponseDto {
  id: number;
  sku: string;
  name: string;
  description: string;
  categoryId: number;
  materialId: number;
  brandId?: number;
  modelId?: number;
  unitId?: number;
  statusId?: number;
  stockStatusId?: number;
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
  brand?: {
    id: number;
    name: string;
    code: string;
  };
  model?: {
    id: number;
    name: string;
    code: string;
  };
  unit?: {
    id: number;
    name: string;
    symbol: string;
    type: string;
  };
  productStatus?: {
    id: number;
    name: string;
    code: string;
  };
  stockStatus?: {
    id: number;
    name: string;
    code: string;
  };
  weight: number;
  length: number;
  width: number;
  height: number;
  isActive: boolean;
  imageUrl: string;
  images: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  sortOrder: number;
  isFeatured: boolean;
  isDigital: boolean;
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
