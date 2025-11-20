import { IsString, IsOptional, IsEmail, IsNumber, IsUUID, IsBoolean, Min } from 'class-validator';

export class CreateCustomerDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  taxCode?: string;

  @IsOptional()
  @IsString()
  contactPerson?: string;

  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  salesRep?: string;

  @IsOptional()
  @IsUUID()
  customerGroupId?: string;
}

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  taxCode?: string;

  @IsOptional()
  @IsString()
  contactPerson?: string;

  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  salesRep?: string;

  @IsOptional()
  @IsUUID()
  customerGroupId?: string;
}

export class CustomerResponseDto {
  @IsUUID()
  id: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  taxCode?: string;

  @IsOptional()
  @IsString()
  contactPerson?: string;

  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @IsNumber()
  creditLimit: number;

  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  salesRep?: string;

  @IsOptional()
  @IsNumber()
  salesRepresentativeId?: number;

  @IsOptional()
  @IsUUID()
  customerGroupId?: string;

  @IsOptional()
  customerGroup?: {
    id: string;
    name: string;
    isCompany: boolean;
    color?: string;
    isActive: boolean;
  };

  @IsOptional()
  salesRepresentative?: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
  };

  @IsString()
  createdAt: string;

  @IsString()
  updatedAt: string;
}

export class CustomerSummaryDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsNumber()
  creditLimit: number;

  @IsNumber()
  currentDebt: number;

  @IsNumber()
  totalOrders: number;

  @IsNumber()
  totalValue: number;

  @IsString()
  lastOrderDate?: string;
}
