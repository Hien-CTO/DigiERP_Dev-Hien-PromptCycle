import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PricingPolicyStatus } from '../../domain/entities/pricing-policy.entity';

export class PricingPolicyDetailDto {
  @IsNumber()
  @Type(() => Number)
  productId: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  basePrice?: number; // Optional - will be fetched from product_prices if not provided

  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  discountPercentage: number;
}

export class CreatePricingPolicyDto {
  @IsString()
  code: string;

  @IsString()
  customerId: string;

  @IsDateString()
  validFrom: string;

  @IsOptional()
  @IsDateString()
  validTo?: string;

  @IsOptional()
  @IsEnum(PricingPolicyStatus)
  status?: PricingPolicyStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PricingPolicyDetailDto)
  details: PricingPolicyDetailDto[];
}

export class UpdatePricingPolicyDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @IsOptional()
  @IsDateString()
  validTo?: string;

  @IsOptional()
  @IsEnum(PricingPolicyStatus)
  status?: PricingPolicyStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PricingPolicyDetailDto)
  details?: PricingPolicyDetailDto[];
}

export class PricingPolicyDetailResponseDto {
  id: number;
  pricingPolicyId: number;
  productId: number;
  basePrice: number;
  discountPercentage: number;
  discountedPrice: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: number;
  updatedBy?: number;
}

export class PricingPolicyResponseDto {
  id: number;
  code: string;
  customerId: string;
  validFrom: Date;
  validTo?: Date;
  status: PricingPolicyStatus;
  details?: PricingPolicyDetailResponseDto[];
  createdAt: Date;
  updatedAt: Date;
  createdBy?: number;
  updatedBy?: number;
}

export class PricingPolicyListResponseDto {
  policies: PricingPolicyResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

