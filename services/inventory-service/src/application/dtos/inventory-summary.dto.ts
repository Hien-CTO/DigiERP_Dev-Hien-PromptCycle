import { IsOptional, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class InventorySummaryItemDto {
  productId: number;
  productSku: string;
  productName: string;
  unit: string;
  categoryId?: number;
  categoryName?: string;
  warehouseId?: number; // Warehouse ID (when filtered) or first warehouse ID that has inventory
  
  // Tồn kho thực tế - quantity_on_hand của warehouse được filter hoặc tổng của tất cả warehouse
  quantityOnHand: number;
  
  // Kho Ảo (Hàng B2B) - Tổng tồn kho ảo
  virtualWarehouse: number;
  
  // Hàng Cho Mượn - Tổng hàng đang cho khách mượn
  onLoanOut: number;
  
  // Hàng Mượn Về - Tổng hàng đang mượn của khách
  onLoanIn: number;
  
  // Tổng Tồn (Sở hữu) - Tổng hàng công ty sở hữu
  totalOwned: number;
}

export class InventorySummaryStatisticsDto {
  totalProducts: number;
  pendingOrders: number;
  lowStockProducts: number;
  expiringProducts: number;
}

export class GetInventorySummaryQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  warehouseId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}

export class InventorySummaryResponseDto {
  statistics: InventorySummaryStatisticsDto;
  items: InventorySummaryItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

