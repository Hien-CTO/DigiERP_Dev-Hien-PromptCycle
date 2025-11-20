import { IsString, IsNumber, IsDateString, IsOptional, IsArray, ValidateNested, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum TransferRequestStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export class CreateTransferRequestItemDto {
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

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateTransferRequestDto {
  @IsNumber()
  fromWarehouseId: number;

  @IsNumber()
  toWarehouseId: number;

  @IsDateString()
  requestDate: string;

  @IsString()
  requestedBy: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTransferRequestItemDto)
  items: CreateTransferRequestItemDto[];
}

export class UpdateTransferRequestDto {
  @IsOptional()
  @IsNumber()
  fromWarehouseId?: number;

  @IsOptional()
  @IsNumber()
  toWarehouseId?: number;

  @IsOptional()
  @IsDateString()
  requestDate?: string;

  @IsOptional()
  @IsEnum(TransferRequestStatus)
  status?: TransferRequestStatus;

  @IsOptional()
  @IsString()
  requestedBy?: string;

  @IsOptional()
  @IsString()
  approvedBy?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTransferRequestItemDto)
  items?: CreateTransferRequestItemDto[];
}

export class TransferRequestItemResponseDto {
  id: number;
  transferRequestId: number;
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  unit: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class TransferRequestResponseDto {
  id: number;
  requestNumber: string;
  fromWarehouseId: number;
  toWarehouseId: number;
  requestDate: Date;
  status: TransferRequestStatus;
  requestedBy: string;
  approvedBy?: string;
  reason: string;
  notes?: string;
  items: TransferRequestItemResponseDto[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
  updatedBy: number;
}
