import { IsString, IsNumber, IsDateString, IsOptional, IsArray, ValidateNested, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum GoodsIssueStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  ISSUED = 'ISSUED',
  VERIFIED = 'VERIFIED',
  CANCELLED = 'CANCELLED',
}

export class CreateGoodsIssueItemDto {
  @IsNumber()
  productId: number;

  @IsString()
  productName: string;

  @IsString()
  productSku: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  unit: string;

  @IsNumber()
  @Min(0)
  unitCost: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateGoodsIssueDto {
  @IsOptional()
  @IsNumber()
  salesOrderId?: number;

  @IsNumber()
  warehouseId: number;

  @IsDateString()
  issueDate: string;

  @IsOptional()
  @IsString()
  issuedBy?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGoodsIssueItemDto)
  items: CreateGoodsIssueItemDto[];
}

export class UpdateGoodsIssueDto {
  @IsOptional()
  @IsNumber()
  warehouseId?: number;

  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @IsOptional()
  @IsEnum(GoodsIssueStatus)
  status?: GoodsIssueStatus;

  @IsOptional()
  @IsString()
  issuedBy?: string;

  @IsOptional()
  @IsString()
  verifiedBy?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGoodsIssueItemDto)
  items?: CreateGoodsIssueItemDto[];
}

export class GoodsIssueItemResponseDto {
  id: number;
  goodsIssueId: number;
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class GoodsIssueResponseDto {
  id: number;
  issueNumber: string;
  salesOrderId?: number;
  warehouseId: number;
  issueDate: Date;
  status: GoodsIssueStatus;
  issuedBy?: string;
  verifiedBy?: string;
  notes?: string;
  items: GoodsIssueItemResponseDto[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
  updatedBy: number;
}
