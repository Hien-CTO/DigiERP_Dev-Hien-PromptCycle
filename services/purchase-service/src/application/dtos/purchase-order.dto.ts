import { IsString, IsOptional, IsNumber, IsDateString, IsEnum, IsUUID, IsArray, ValidateNested, IsPositive, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PurchaseOrderStatus } from '../../domain/entities/purchase-order.entity';

export class ImporterInfoDto {
  @ApiPropertyOptional({ description: 'Importer name' })
  @IsOptional()
  @IsString()
  importer_name?: string;

  @ApiPropertyOptional({ description: 'Importer phone' })
  @IsOptional()
  @IsString()
  importer_phone?: string;

  @ApiPropertyOptional({ description: 'Importer fax' })
  @IsOptional()
  @IsString()
  importer_fax?: string;

  @ApiPropertyOptional({ description: 'Importer email' })
  @IsOptional()
  @IsEmail()
  importer_email?: string;
}

export class ImporterInfoResponseDto {
  @ApiPropertyOptional({ description: 'Importer name' })
  importer_name?: string;

  @ApiPropertyOptional({ description: 'Importer phone' })
  importer_phone?: string;

  @ApiPropertyOptional({ description: 'Importer fax' })
  importer_fax?: string;

  @ApiPropertyOptional({ description: 'Importer email' })
  importer_email?: string;
}

export class CreatePurchaseOrderItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNumber()
  @Type(() => Number)
  product_id: number;

  @ApiProperty({ description: 'Product name' })
  @IsString()
  product_name: string;

  @ApiPropertyOptional({ description: 'Product SKU' })
  @IsOptional()
  @IsString()
  product_sku?: string;

  @ApiProperty({ description: 'Quantity' })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiPropertyOptional({ description: 'Unit' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ description: 'Unit cost' })
  @IsNumber()
  @IsPositive()
  unit_cost: number;

  @ApiPropertyOptional({ description: 'Discount percentage', default: 0 })
  @IsOptional()
  @IsNumber()
  discount_percentage?: number;

  @ApiPropertyOptional({ description: 'Tax percentage', default: 0 })
  @IsOptional()
  @IsNumber()
  tax_percentage?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreatePurchaseOrderDto {
  @ApiProperty({ description: 'Order number' })
  @IsString()
  order_number: string;

  @ApiProperty({ description: 'Supplier ID' })
  @IsNumber()
  @Type(() => Number)
  supplier_id: number;

  @ApiProperty({ description: 'Warehouse ID' })
  @IsNumber()
  @Type(() => Number)
  warehouse_id: number;

  @ApiProperty({ description: 'Order date' })
  @IsDateString()
  order_date: string;

  @ApiPropertyOptional({ description: 'Expected delivery date' })
  @IsOptional()
  @IsDateString()
  expected_delivery_date?: string;

  @ApiProperty({ description: 'Order items', type: [CreatePurchaseOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderItemDto)
  items: CreatePurchaseOrderItemDto[];

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Payment term' })
  @IsOptional()
  @IsString()
  payment_term?: string;

  @ApiPropertyOptional({ description: 'Payment method' })
  @IsOptional()
  @IsString()
  payment_method?: string;

  @ApiPropertyOptional({ description: 'Predicted arrival date' })
  @IsOptional()
  @IsDateString()
  predicted_arrival_date?: string;

  @ApiPropertyOptional({ description: 'Port name' })
  @IsOptional()
  @IsString()
  port_name?: string;

  @ApiPropertyOptional({ description: 'Importer info' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ImporterInfoDto)
  importer?: ImporterInfoDto;
}

export class UpdatePurchaseOrderDto {
  @ApiPropertyOptional({ description: 'Order number' })
  @IsOptional()
  @IsString()
  order_number?: string;

  @ApiPropertyOptional({ description: 'Supplier ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  supplier_id?: number;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  warehouse_id?: number;

  @ApiPropertyOptional({ description: 'Order date' })
  @IsOptional()
  @IsDateString()
  order_date?: string;

  @ApiPropertyOptional({ description: 'Expected delivery date' })
  @IsOptional()
  @IsDateString()
  expected_delivery_date?: string;

  @ApiPropertyOptional({ description: 'Status' })
  @IsOptional()
  @IsEnum(PurchaseOrderStatus)
  status?: PurchaseOrderStatus;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Payment term' })
  @IsOptional()
  @IsString()
  payment_term?: string;

  @ApiPropertyOptional({ description: 'Payment method' })
  @IsOptional()
  @IsString()
  payment_method?: string;

  @ApiPropertyOptional({ description: 'Predicted arrival date' })
  @IsOptional()
  @IsDateString()
  predicted_arrival_date?: string;

  @ApiPropertyOptional({ description: 'Port name' })
  @IsOptional()
  @IsString()
  port_name?: string;

  @ApiPropertyOptional({ description: 'Importer info' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ImporterInfoDto)
  importer?: ImporterInfoDto;
}

export class PurchaseOrderItemResponseDto {
  @ApiProperty({ description: 'Item ID' })
  id: string;

  @ApiProperty({ description: 'Product ID' })
  product_id: number;

  @ApiProperty({ description: 'Product name' })
  product_name: string;

  @ApiPropertyOptional({ description: 'Product SKU' })
  product_sku?: string;

  @ApiProperty({ description: 'Quantity' })
  quantity: number;

  @ApiPropertyOptional({ description: 'Unit' })
  unit?: string;

  @ApiProperty({ description: 'Unit cost' })
  unit_cost: number;

  @ApiProperty({ description: 'Discount percentage' })
  discount_percentage: number;

  @ApiProperty({ description: 'Discount amount' })
  discount_amount: number;

  @ApiProperty({ description: 'Tax percentage' })
  tax_percentage: number;

  @ApiProperty({ description: 'Tax amount' })
  tax_amount: number;

  @ApiProperty({ description: 'Total amount' })
  total_amount: number;

  @ApiProperty({ description: 'Received quantity' })
  received_quantity: number;

  @ApiPropertyOptional({ description: 'Notes' })
  notes?: string;

  @ApiProperty({ description: 'Created at' })
  created_at: Date;

  @ApiProperty({ description: 'Updated at' })
  updated_at: Date;
}

export class PurchaseOrderResponseDto {
  @ApiProperty({ description: 'Order ID' })
  id: string;

  @ApiProperty({ description: 'Order number' })
  order_number: string;

  @ApiProperty({ description: 'Supplier ID' })
  supplier_id: number;

  @ApiProperty({ description: 'Warehouse ID' })
  warehouse_id: number;

  @ApiProperty({ description: 'Status' })
  status: PurchaseOrderStatus;

  @ApiProperty({ description: 'Order date' })
  order_date: Date;

  @ApiPropertyOptional({ description: 'Expected delivery date' })
  expected_delivery_date?: Date;

  @ApiProperty({ description: 'Total amount' })
  total_amount: number;

  @ApiProperty({ description: 'Tax amount' })
  tax_amount: number;

  @ApiProperty({ description: 'Discount amount' })
  discount_amount: number;

  @ApiProperty({ description: 'Final amount' })
  final_amount: number;

  @ApiPropertyOptional({ description: 'Notes' })
  notes?: string;

  @ApiPropertyOptional({ description: 'Payment term' })
  payment_term?: string;

  @ApiPropertyOptional({ description: 'Payment method' })
  payment_method?: string;

  @ApiPropertyOptional({ description: 'Predicted arrival date' })
  predicted_arrival_date?: Date;

  @ApiPropertyOptional({ description: 'Port name' })
  port_name?: string;

  @ApiPropertyOptional({ description: 'Purchase Request ID' })
  purchase_request_id?: string;

  @ApiPropertyOptional({ description: 'Importer info', type: ImporterInfoResponseDto })
  importer?: ImporterInfoResponseDto;

  @ApiPropertyOptional({ description: 'Created by' })
  created_by?: number;

  @ApiPropertyOptional({ description: 'Updated by' })
  updated_by?: number;

  @ApiPropertyOptional({ description: 'Approved by' })
  approved_by?: string;

  @ApiPropertyOptional({ description: 'Approved at' })
  approved_at?: Date;

  @ApiProperty({ description: 'Created at' })
  created_at: Date;

  @ApiProperty({ description: 'Updated at' })
  updated_at: Date;

  @ApiProperty({ description: 'Order items', type: [PurchaseOrderItemResponseDto] })
  items?: PurchaseOrderItemResponseDto[];
}

