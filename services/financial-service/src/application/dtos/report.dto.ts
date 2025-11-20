import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReportPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

export class SalesOverviewRequestDto {
  @ApiPropertyOptional({ description: 'Start date' })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({ description: 'End date' })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({ description: 'Report period', enum: ReportPeriod, default: ReportPeriod.MONTHLY })
  @IsOptional()
  @IsEnum(ReportPeriod)
  period?: ReportPeriod;

  @ApiPropertyOptional({ description: 'Currency', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;
}

export class SalesOverviewResponseDto {
  @ApiProperty({ description: 'Total revenue' })
  total_revenue: number;

  @ApiProperty({ description: 'Total orders' })
  total_orders: number;

  @ApiProperty({ description: 'Average order value' })
  average_order_value: number;

  @ApiProperty({ description: 'New customers' })
  new_customers: number;

  @ApiProperty({ description: 'Revenue by period', type: 'object' })
  revenue_by_period: Record<string, number>;

  @ApiProperty({ description: 'Top products', type: 'array' })
  top_products: Array<{
    product_id: string;
    product_name: string;
    quantity_sold: number;
    revenue: number;
  }>;

  @ApiProperty({ description: 'Revenue growth percentage' })
  revenue_growth: number;

  @ApiProperty({ description: 'Currency' })
  currency: string;

  @ApiProperty({ description: 'Report period' })
  period: string;

  @ApiProperty({ description: 'Generated at' })
  generated_at: Date;
}

export class InvoiceSummaryRequestDto {
  @ApiPropertyOptional({ description: 'Start date' })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({ description: 'End date' })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({ description: 'Invoice status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Customer ID' })
  @IsOptional()
  @IsString()
  customer_id?: string;
}

export class InvoiceSummaryResponseDto {
  @ApiProperty({ description: 'Total invoices' })
  total_invoices: number;

  @ApiProperty({ description: 'Total amount' })
  total_amount: number;

  @ApiProperty({ description: 'Paid amount' })
  paid_amount: number;

  @ApiProperty({ description: 'Outstanding amount' })
  outstanding_amount: number;

  @ApiProperty({ description: 'Overdue amount' })
  overdue_amount: number;

  @ApiProperty({ description: 'Average payment time in days' })
  average_payment_time: number;

  @ApiProperty({ description: 'Invoices by status', type: 'object' })
  invoices_by_status: Record<string, number>;

  @ApiProperty({ description: 'Generated at' })
  generated_at: Date;
}
