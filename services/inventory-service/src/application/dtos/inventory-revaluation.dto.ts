import { IsString, IsNumber, IsDateString, IsOptional, IsArray, ValidateNested, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum RevaluationStatus {
  DRAFT = 'DRAFT',
  POSTED = 'POSTED',
  CANCELLED = 'CANCELLED',
}

export class CreateRevaluationItemDto {
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
  quantity: number;

  @IsString()
  unit: string;

  @IsNumber()
  @Min(0)
  oldUnitCost: number;

  @IsNumber()
  @Min(0)
  newUnitCost: number;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateInventoryRevaluationDto {
  @IsNumber()
  warehouseId: number;

  @IsDateString()
  revaluationDate: string;

  @IsString()
  revaluedBy: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRevaluationItemDto)
  items: CreateRevaluationItemDto[];
}

export class UpdateInventoryRevaluationDto {
  @IsOptional()
  @IsNumber()
  warehouseId?: number;

  @IsOptional()
  @IsDateString()
  revaluationDate?: string;

  @IsOptional()
  @IsEnum(RevaluationStatus)
  status?: RevaluationStatus;

  @IsOptional()
  @IsString()
  revaluedBy?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRevaluationItemDto)
  items?: CreateRevaluationItemDto[];
}

export class RevaluationItemResponseDto {
  id: number;
  revaluationId: number;
  productId: number;
  productName: string;
  productSku: string;
  areaId?: number;
  quantity: number;
  unit: string;
  oldUnitCost: number;
  newUnitCost: number;
  revaluationAmount: number;
  reason: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class InventoryRevaluationResponseDto {
  id: number;
  revaluationNumber: string;
  warehouseId: number;
  revaluationDate: Date;
  status: RevaluationStatus;
  revaluedBy: string;
  reason: string;
  notes?: string;
  items: RevaluationItemResponseDto[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
  updatedBy: number;
}
