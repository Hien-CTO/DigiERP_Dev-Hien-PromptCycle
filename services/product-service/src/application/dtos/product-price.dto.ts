import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDateString,
  Min,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateProductPriceDto {
  @IsNumber()
  @Type(() => Number)
  productId: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  documentPrice?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateProductPriceDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  productId?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  documentPrice?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ProductPriceResponseDto {
  id: number;
  productId: number;
  price: number;
  documentPrice?: number;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: number;
  updatedBy?: number;
}

export class ProductPriceListResponseDto {
  prices: ProductPriceResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class PriceCalculationRequestDto {
  @IsNumber()
  @Type(() => Number)
  productId: number;
}

export class PriceCalculationResponseDto {
  price: number;
  documentPrice?: number;
  finalPrice: number;
  appliedPriceId: number;
}
