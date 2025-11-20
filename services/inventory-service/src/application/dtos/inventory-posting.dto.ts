import { IsString, IsNumber, IsDateString, IsOptional, IsArray, ValidateNested, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum PostingStatus {
  DRAFT = 'DRAFT',
  POSTED = 'POSTED',
  CANCELLED = 'CANCELLED',
}

export class CreatePostingItemDto {
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
  quantityBefore: number;

  @IsNumber()
  @Min(0)
  quantityAfter: number;

  @IsString()
  unit: string;

  @IsNumber()
  @Min(0)
  unitCost: number;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateInventoryPostingDto {
  @IsOptional()
  @IsNumber()
  countingId?: number;

  @IsNumber()
  warehouseId: number;

  @IsDateString()
  postingDate: string;

  @IsString()
  postedBy: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePostingItemDto)
  items: CreatePostingItemDto[];
}

export class UpdateInventoryPostingDto {
  @IsOptional()
  @IsNumber()
  warehouseId?: number;

  @IsOptional()
  @IsDateString()
  postingDate?: string;

  @IsOptional()
  @IsEnum(PostingStatus)
  status?: PostingStatus;

  @IsOptional()
  @IsString()
  postedBy?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePostingItemDto)
  items?: CreatePostingItemDto[];
}

export class PostingItemResponseDto {
  id: number;
  postingId: number;
  productId: number;
  productName: string;
  productSku: string;
  areaId?: number;
  quantityBefore: number;
  quantityAfter: number;
  unit: string;
  unitCost: number;
  adjustmentAmount: number;
  reason: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class InventoryPostingResponseDto {
  id: number;
  postingNumber: string;
  countingId?: number;
  warehouseId: number;
  postingDate: Date;
  status: PostingStatus;
  postedBy: string;
  reason: string;
  notes?: string;
  items: PostingItemResponseDto[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
  updatedBy: number;
}
