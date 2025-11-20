import { IsString, IsNumber, IsDateString, IsOptional, IsArray, ValidateNested, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum GoodsReceiptStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  RECEIVED = 'RECEIVED',
  VERIFIED = 'VERIFIED',
  CANCELLED = 'CANCELLED',
}

export class CreateGoodsReceiptItemDto {
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

export class CreateGoodsReceiptDto {
  @IsOptional()
  @IsNumber()
  purchaseOrderId?: number;

  @IsNumber()
  warehouseId: number;

  @IsDateString()
  receiptDate: string;

  @IsOptional()
  @IsString()
  receivedBy?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGoodsReceiptItemDto)
  items: CreateGoodsReceiptItemDto[];
}

export class UpdateGoodsReceiptDto {
  @IsOptional()
  @IsNumber()
  warehouseId?: number;

  @IsOptional()
  @IsDateString()
  receiptDate?: string;

  @IsOptional()
  @IsEnum(GoodsReceiptStatus)
  status?: GoodsReceiptStatus;

  @IsOptional()
  @IsString()
  receivedBy?: string;

  @IsOptional()
  @IsString()
  verifiedBy?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGoodsReceiptItemDto)
  items?: CreateGoodsReceiptItemDto[];
}

export class GoodsReceiptItemResponseDto {
  id: number;
  goodsReceiptId: number;
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

export class GoodsReceiptResponseDto {
  id: number;
  receiptNumber: string;
  purchaseOrderId?: number;
  warehouseId: number;
  receiptDate: Date;
  status: GoodsReceiptStatus;
  receivedBy?: string;
  verifiedBy?: string;
  notes?: string;
  items: GoodsReceiptItemResponseDto[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
  updatedBy: number;
}
