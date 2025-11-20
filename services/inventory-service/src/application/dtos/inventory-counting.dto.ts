import { IsString, IsNumber, IsDateString, IsOptional, IsArray, ValidateNested, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum CountingStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  POSTED = 'POSTED',
  CANCELLED = 'CANCELLED',
}

export class CreateCountingItemDto {
  @IsNumber()
  productId: number;

  @IsString()
  productName: string;

  @IsString()
  productSku: string;

  @IsOptional()
  @IsNumber()
  areaId?: number;

  @IsNumber()
  @Min(0)
  expectedQuantity: number;

  @IsNumber()
  @Min(0)
  countedQuantity: number;

  @IsString()
  unit: string;

  @IsNumber()
  @Min(0)
  unitCost: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateInventoryCountingDto {
  @IsNumber()
  warehouseId: number;

  @IsDateString()
  countingDate: string;

  @IsString()
  countedBy: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCountingItemDto)
  items: CreateCountingItemDto[];
}

export class UpdateInventoryCountingDto {
  @IsOptional()
  @IsNumber()
  warehouseId?: number;

  @IsOptional()
  @IsDateString()
  countingDate?: string;

  @IsOptional()
  @IsEnum(CountingStatus)
  status?: CountingStatus;

  @IsOptional()
  @IsString()
  countedBy?: string;

  @IsOptional()
  @IsString()
  reviewedBy?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCountingItemDto)
  items?: CreateCountingItemDto[];
}

export class CountingItemResponseDto {
  id: number;
  countingId: number;
  productId: number;
  productName: string;
  productSku: string;
  areaId?: number;
  expectedQuantity: number;
  countedQuantity: number;
  unit: string;
  unitCost: number;
  variance: number;
  varianceAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class InventoryCountingResponseDto {
  id: number;
  countingNumber: string;
  warehouseId: number;
  countingDate: Date;
  status: CountingStatus;
  countedBy: string;
  reviewedBy?: string;
  reason: string;
  notes?: string;
  items: CountingItemResponseDto[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
  updatedBy: number;
}
