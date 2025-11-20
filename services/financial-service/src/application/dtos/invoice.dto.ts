import { IsString, IsOptional, IsNumber, IsDateString, IsEnum, IsUUID, IsArray, ValidateNested, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceStatus, InvoiceType } from '../../domain/entities/invoice.entity';

export class CreateInvoiceItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsUUID()
  product_id: string;

  @ApiProperty({ description: 'Product name' })
  @IsString()
  product_name: string;

  @ApiPropertyOptional({ description: 'Product SKU' })
  @IsOptional()
  @IsString()
  product_sku?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Quantity' })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiPropertyOptional({ description: 'Unit' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ description: 'Unit price' })
  @IsNumber()
  @IsPositive()
  unit_price: number;

  @ApiPropertyOptional({ description: 'Discount percentage', default: 0 })
  @IsOptional()
  @IsNumber()
  discount_percentage?: number;

  @ApiPropertyOptional({ description: 'Tax percentage', default: 0 })
  @IsOptional()
  @IsNumber()
  tax_percentage?: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ description: 'Invoice number' })
  @IsString()
  invoice_number: string;

  @ApiProperty({ description: 'Invoice type', enum: InvoiceType })
  @IsEnum(InvoiceType)
  type: InvoiceType;

  @ApiProperty({ description: 'Customer ID' })
  @IsUUID()
  customer_id: string;

  @ApiProperty({ description: 'Customer name' })
  @IsString()
  customer_name: string;

  @ApiPropertyOptional({ description: 'Customer email' })
  @IsOptional()
  @IsString()
  customer_email?: string;

  @ApiPropertyOptional({ description: 'Customer address' })
  @IsOptional()
  @IsString()
  customer_address?: string;

  @ApiPropertyOptional({ description: 'Customer tax code' })
  @IsOptional()
  @IsString()
  customer_tax_code?: string;

  @ApiPropertyOptional({ description: 'Order ID' })
  @IsOptional()
  @IsUUID()
  order_id?: string;

  @ApiPropertyOptional({ description: 'Order number' })
  @IsOptional()
  @IsString()
  order_number?: string;

  @ApiProperty({ description: 'Invoice date' })
  @IsDateString()
  invoice_date: string;

  @ApiProperty({ description: 'Due date' })
  @IsDateString()
  due_date: string;

  @ApiProperty({ description: 'Invoice items', type: [CreateInvoiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];

  @ApiPropertyOptional({ description: 'Subtotal' })
  @IsOptional()
  @IsNumber()
  subtotal?: number;

  @ApiPropertyOptional({ description: 'Tax amount' })
  @IsOptional()
  @IsNumber()
  tax_amount?: number;

  @ApiPropertyOptional({ description: 'Discount amount' })
  @IsOptional()
  @IsNumber()
  discount_amount?: number;

  @ApiPropertyOptional({ description: 'Total amount' })
  @IsOptional()
  @IsNumber()
  total_amount?: number;

  @ApiPropertyOptional({ description: 'Currency', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Exchange rate', default: 1 })
  @IsOptional()
  @IsNumber()
  exchange_rate?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Terms and conditions' })
  @IsOptional()
  @IsString()
  terms_conditions?: string;
}

export class UpdateInvoiceDto {
  @ApiPropertyOptional({ description: 'Invoice number' })
  @IsOptional()
  @IsString()
  invoice_number?: string;

  @ApiPropertyOptional({ description: 'Invoice type' })
  @IsOptional()
  @IsEnum(InvoiceType)
  type?: InvoiceType;

  @ApiPropertyOptional({ description: 'Customer ID' })
  @IsOptional()
  @IsUUID()
  customer_id?: string;

  @ApiPropertyOptional({ description: 'Customer name' })
  @IsOptional()
  @IsString()
  customer_name?: string;

  @ApiPropertyOptional({ description: 'Customer email' })
  @IsOptional()
  @IsString()
  customer_email?: string;

  @ApiPropertyOptional({ description: 'Customer address' })
  @IsOptional()
  @IsString()
  customer_address?: string;

  @ApiPropertyOptional({ description: 'Customer tax code' })
  @IsOptional()
  @IsString()
  customer_tax_code?: string;

  @ApiPropertyOptional({ description: 'Order ID' })
  @IsOptional()
  @IsUUID()
  order_id?: string;

  @ApiPropertyOptional({ description: 'Order number' })
  @IsOptional()
  @IsString()
  order_number?: string;

  @ApiPropertyOptional({ description: 'Invoice date' })
  @IsOptional()
  @IsDateString()
  invoice_date?: string;

  @ApiPropertyOptional({ description: 'Due date' })
  @IsOptional()
  @IsDateString()
  due_date?: string;

  @ApiPropertyOptional({ description: 'Status' })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Terms and conditions' })
  @IsOptional()
  @IsString()
  terms_conditions?: string;
}

export class InvoiceItemResponseDto {
  @ApiProperty({ description: 'Item ID' })
  id: string;

  @ApiProperty({ description: 'Product ID' })
  product_id: string;

  @ApiProperty({ description: 'Product name' })
  product_name: string;

  @ApiPropertyOptional({ description: 'Product SKU' })
  product_sku?: string;

  @ApiPropertyOptional({ description: 'Description' })
  description?: string;

  @ApiProperty({ description: 'Quantity' })
  quantity: number;

  @ApiPropertyOptional({ description: 'Unit' })
  unit?: string;

  @ApiProperty({ description: 'Unit price' })
  unit_price: number;

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

  @ApiProperty({ description: 'Created at' })
  created_at: Date;

  @ApiProperty({ description: 'Updated at' })
  updated_at: Date;
}

export class InvoiceResponseDto {
  @ApiProperty({ description: 'Invoice ID' })
  id: string;

  @ApiProperty({ description: 'Invoice number' })
  invoice_number: string;

  @ApiProperty({ description: 'Invoice type' })
  type: InvoiceType;

  @ApiProperty({ description: 'Status' })
  status: InvoiceStatus;

  @ApiProperty({ description: 'Customer ID' })
  customer_id: string;

  @ApiProperty({ description: 'Customer name' })
  customer_name: string;

  @ApiPropertyOptional({ description: 'Customer email' })
  customer_email?: string;

  @ApiPropertyOptional({ description: 'Customer address' })
  customer_address?: string;

  @ApiPropertyOptional({ description: 'Customer tax code' })
  customer_tax_code?: string;

  @ApiPropertyOptional({ description: 'Order ID' })
  order_id?: string;

  @ApiPropertyOptional({ description: 'Order number' })
  order_number?: string;

  @ApiProperty({ description: 'Invoice date' })
  invoice_date: Date;

  @ApiProperty({ description: 'Due date' })
  due_date: Date;

  @ApiProperty({ description: 'Subtotal' })
  subtotal: number;

  @ApiProperty({ description: 'Tax amount' })
  tax_amount: number;

  @ApiProperty({ description: 'Discount amount' })
  discount_amount: number;

  @ApiProperty({ description: 'Total amount' })
  total_amount: number;

  @ApiProperty({ description: 'Paid amount' })
  paid_amount: number;

  @ApiProperty({ description: 'Balance amount' })
  balance_amount: number;

  @ApiProperty({ description: 'Currency' })
  currency: string;

  @ApiProperty({ description: 'Exchange rate' })
  exchange_rate: number;

  @ApiPropertyOptional({ description: 'Notes' })
  notes?: string;

  @ApiPropertyOptional({ description: 'Terms and conditions' })
  terms_conditions?: string;

  @ApiPropertyOptional({ description: 'Created by' })
  created_by?: string;

  @ApiPropertyOptional({ description: 'Sent by' })
  sent_by?: string;

  @ApiPropertyOptional({ description: 'Sent at' })
  sent_at?: Date;

  @ApiPropertyOptional({ description: 'Paid by' })
  paid_by?: string;

  @ApiPropertyOptional({ description: 'Paid at' })
  paid_at?: Date;

  @ApiProperty({ description: 'Created at' })
  created_at: Date;

  @ApiProperty({ description: 'Updated at' })
  updated_at: Date;

  @ApiProperty({ description: 'Invoice items', type: [InvoiceItemResponseDto] })
  items?: InvoiceItemResponseDto[];
}
