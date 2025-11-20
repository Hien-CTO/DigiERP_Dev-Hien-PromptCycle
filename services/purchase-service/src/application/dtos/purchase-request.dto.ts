import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsEnum,
  IsArray,
  ValidateNested,
  IsPositive,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PurchaseRequestStatus } from '../../domain/entities/purchase-request.entity';
import { ImporterInfoDto } from './purchase-order.dto';

export class CreatePurchaseRequestItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNumber()
  @Type(() => Number)
  @IsPositive()
  product_id: number;

  @ApiProperty({ description: 'Product name' })
  @IsString()
  @IsNotEmpty()
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

  @ApiPropertyOptional({ description: 'Estimated unit cost' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  estimated_unit_cost?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreatePurchaseRequestDto {
  @ApiPropertyOptional({ description: 'Request number (auto-generated if not provided)' })
  @IsOptional()
  @IsString()
  request_number?: string;

  @ApiProperty({ description: 'Warehouse ID' })
  @IsString()
  @IsNotEmpty()
  warehouse_id: string;

  @ApiProperty({ description: 'Request date' })
  @IsDateString()
  request_date: string;

  @ApiPropertyOptional({ description: 'Required date' })
  @IsOptional()
  @IsDateString()
  required_date?: string;

  @ApiProperty({ description: 'Reason for purchase request' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Request items', type: [CreatePurchaseRequestItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseRequestItemDto)
  items: CreatePurchaseRequestItemDto[];
}

export class UpdatePurchaseRequestDto {
  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsString()
  warehouse_id?: string;

  @ApiPropertyOptional({ description: 'Request date' })
  @IsOptional()
  @IsDateString()
  request_date?: string;

  @ApiPropertyOptional({ description: 'Required date' })
  @IsOptional()
  @IsDateString()
  required_date?: string;

  @ApiPropertyOptional({ description: 'Reason for purchase request' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Request items', type: [CreatePurchaseRequestItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseRequestItemDto)
  items?: CreatePurchaseRequestItemDto[];
}

export class SubmitPurchaseRequestDto {
  // No additional fields needed, just submit the request
}

export class ApprovePurchaseRequestDto {
  // No additional fields needed, just approve the request
}

export class RejectPurchaseRequestDto {
  @ApiProperty({ description: 'Rejection reason' })
  @IsString()
  @IsNotEmpty()
  rejection_reason: string;
}

export class ConvertToPurchaseOrderDto {
  @ApiProperty({ description: 'Supplier ID' })
  @IsNumber()
  @Type(() => Number)
  @IsPositive()
  supplier_id: number;

  @ApiProperty({ description: 'Order date' })
  @IsDateString()
  order_date: string;

  @ApiPropertyOptional({ description: 'Expected delivery date' })
  @IsOptional()
  @IsDateString()
  expected_delivery_date?: string;

  @ApiPropertyOptional({ description: 'Predicted arrival date' })
  @IsOptional()
  @IsDateString()
  predicted_arrival_date?: string;

  @ApiPropertyOptional({ description: 'Port name' })
  @IsOptional()
  @IsString()
  port_name?: string;

  @ApiPropertyOptional({ description: 'Payment term' })
  @IsOptional()
  @IsString()
  payment_term?: string;

  @ApiPropertyOptional({ description: 'Payment method' })
  @IsOptional()
  @IsString()
  payment_method?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Item prices and discounts (overrides estimated costs)',
    type: 'object',
    additionalProperties: {
      type: 'object',
      properties: {
        unit_cost: { type: 'number' },
        discount_percentage: { type: 'number' },
        tax_percentage: { type: 'number' },
      },
    },
  })
  @IsOptional()
  item_prices?: Record<
    string,
    {
      unit_cost: number;
      discount_percentage?: number;
      tax_percentage?: number;
    }
  >;

  @ApiPropertyOptional({ description: 'Importer info', type: ImporterInfoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ImporterInfoDto)
  importer?: ImporterInfoDto;
}

export class PurchaseRequestItemResponseDto {
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

  @ApiPropertyOptional({ description: 'Estimated unit cost' })
  estimated_unit_cost?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  notes?: string;

  @ApiProperty({ description: 'Created at' })
  created_at: Date;

  @ApiProperty({ description: 'Updated at' })
  updated_at: Date;
}

export class PurchaseRequestResponseDto {
  @ApiProperty({ description: 'Request ID' })
  id: string;

  @ApiProperty({ description: 'Request number' })
  request_number: string;

  @ApiProperty({ description: 'Warehouse ID' })
  warehouse_id: string;

  @ApiProperty({ description: 'Status', enum: PurchaseRequestStatus })
  status: PurchaseRequestStatus;

  @ApiProperty({ description: 'Request date' })
  request_date: Date;

  @ApiPropertyOptional({ description: 'Required date' })
  required_date?: Date;

  @ApiProperty({ description: 'Reason' })
  reason: string;

  @ApiPropertyOptional({ description: 'Notes' })
  notes?: string;

  @ApiProperty({ description: 'Requested by' })
  requested_by: string;

  @ApiPropertyOptional({ description: 'Approved by' })
  approved_by?: string;

  @ApiPropertyOptional({ description: 'Rejected by' })
  rejected_by?: string;

  @ApiPropertyOptional({ description: 'Approved at' })
  approved_at?: Date;

  @ApiPropertyOptional({ description: 'Rejected at' })
  rejected_at?: Date;

  @ApiPropertyOptional({ description: 'Rejection reason' })
  rejection_reason?: string;

  @ApiProperty({ description: 'Created at' })
  created_at: Date;

  @ApiProperty({ description: 'Updated at' })
  updated_at: Date;

  @ApiProperty({
    description: 'Request items',
    type: [PurchaseRequestItemResponseDto],
  })
  items?: PurchaseRequestItemResponseDto[];
}

