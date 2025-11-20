import { IsString, IsNumber, IsDateString, IsOptional, IsArray, ValidateNested, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum TransferStatus {
  DRAFT = 'DRAFT',
  IN_TRANSIT = 'IN_TRANSIT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class CreateTransferItemDto {
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

export class CreateInventoryTransferDto {
  @IsOptional()
  @IsNumber()
  transferRequestId?: number;

  @IsNumber()
  fromWarehouseId: number;

  @IsNumber()
  toWarehouseId: number;

  @IsDateString()
  transferDate: string;

  @IsString()
  transferredBy: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTransferItemDto)
  items: CreateTransferItemDto[];
}

export class UpdateInventoryTransferDto {
  @IsOptional()
  @IsNumber()
  fromWarehouseId?: number;

  @IsOptional()
  @IsNumber()
  toWarehouseId?: number;

  @IsOptional()
  @IsDateString()
  transferDate?: string;

  @IsOptional()
  @IsEnum(TransferStatus)
  status?: TransferStatus;

  @IsOptional()
  @IsString()
  transferredBy?: string;

  @IsOptional()
  @IsString()
  receivedBy?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTransferItemDto)
  items?: CreateTransferItemDto[];
}

export class TransferItemResponseDto {
  id: number;
  transferId: number;
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

export class InventoryTransferResponseDto {
  id: number;
  transferNumber: string;
  transferRequestId?: number;
  fromWarehouseId: number;
  toWarehouseId: number;
  transferDate: Date;
  status: TransferStatus;
  transferredBy: string;
  receivedBy?: string;
  reason: string;
  notes?: string;
  items: TransferItemResponseDto[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
  updatedBy: number;
}
