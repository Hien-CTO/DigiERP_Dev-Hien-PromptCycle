import { IsOptional, IsNumber, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class InventoryBatchItemDto {
  id: number;
  batchNumber: string;
  expiryDate?: Date;
  receiptDate: Date;
  quantity: number;
  locationCode?: string;
  locationDescription?: string;
  areaId?: number;
  areaName?: string;
}

export class InventoryDetailStatisticsDto {
  totalQuantity: number;
  totalBatches: number;
  expiringBatches: number; // Trong vòng 2 tháng
  pendingOrders: number; // Đơn hàng đang xử lý liên quan sản phẩm này
}

export class GetInventoryDetailQueryDto {
  @Type(() => Number)
  @IsNumber()
  productId: number;

  @Type(() => Number)
  @IsNumber()
  warehouseId: number;

  @IsOptional()
  @IsString()
  search?: string; // Tìm theo số lô

  @IsOptional()
  @IsDateString()
  expiryDateFrom?: string;

  @IsOptional()
  @IsDateString()
  expiryDateTo?: string;
}

export class InventoryDetailResponseDto {
  productId: number;
  productSku: string;
  productName: string;
  unit: string;
  warehouseId: number;
  warehouseName: string;
  statistics: InventoryDetailStatisticsDto;
  batches: InventoryBatchItemDto[];
  totalQuantity: number;
}



