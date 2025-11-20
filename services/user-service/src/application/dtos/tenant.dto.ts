import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsEmail,
  IsInt,
  IsBoolean,
  IsDateString,
  IsObject,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({ description: 'Tenant code (unique)', example: 'COMPANY_A' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  code: string;

  @ApiProperty({ description: 'Tenant name', example: 'Company A Ltd' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ description: 'Display name', example: 'Company A Limited' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  displayName: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Tax code' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  taxCode?: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ description: 'Address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'City ID' })
  @IsOptional()
  @IsInt()
  cityId?: number;

  @ApiPropertyOptional({ description: 'Province ID' })
  @IsOptional()
  @IsInt()
  provinceId?: number;

  @ApiPropertyOptional({ description: 'Country ID' })
  @IsOptional()
  @IsInt()
  countryId?: number;

  @ApiPropertyOptional({ description: 'Logo URL' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Website URL' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({
    description: 'Tenant status',
    enum: ['ACTIVE', 'SUSPENDED', 'INACTIVE'],
    default: 'ACTIVE',
  })
  @IsOptional()
  @IsEnum(['ACTIVE', 'SUSPENDED', 'INACTIVE'])
  status?: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';

  @ApiPropertyOptional({
    description: 'Subscription tier',
    enum: ['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE'],
    default: 'BASIC',
  })
  @IsOptional()
  @IsEnum(['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE'])
  subscriptionTier?: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';

  @ApiPropertyOptional({ description: 'Subscription expiration date' })
  @IsOptional()
  @IsDateString()
  subscriptionExpiresAt?: string;

  @ApiPropertyOptional({ description: 'Maximum number of users', default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxUsers?: number;

  @ApiPropertyOptional({ description: 'Maximum storage in GB', default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxStorageGb?: number;

  @ApiPropertyOptional({ description: 'Settings (JSON object)' })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateTenantDto {
  @ApiPropertyOptional({ description: 'Tenant code' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  code?: string;

  @ApiPropertyOptional({ description: 'Tenant name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ description: 'Display name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  displayName?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Tax code' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  taxCode?: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ description: 'Address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'City ID' })
  @IsOptional()
  @IsInt()
  cityId?: number;

  @ApiPropertyOptional({ description: 'Province ID' })
  @IsOptional()
  @IsInt()
  provinceId?: number;

  @ApiPropertyOptional({ description: 'Country ID' })
  @IsOptional()
  @IsInt()
  countryId?: number;

  @ApiPropertyOptional({ description: 'Logo URL' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Website URL' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ description: 'Tenant status', enum: ['ACTIVE', 'SUSPENDED', 'INACTIVE'] })
  @IsOptional()
  @IsEnum(['ACTIVE', 'SUSPENDED', 'INACTIVE'])
  status?: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';

  @ApiPropertyOptional({
    description: 'Subscription tier',
    enum: ['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE'],
  })
  @IsOptional()
  @IsEnum(['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE'])
  subscriptionTier?: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';

  @ApiPropertyOptional({ description: 'Subscription expiration date' })
  @IsOptional()
  @IsDateString()
  subscriptionExpiresAt?: string;

  @ApiPropertyOptional({ description: 'Maximum number of users' })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxUsers?: number;

  @ApiPropertyOptional({ description: 'Maximum storage in GB' })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxStorageGb?: number;

  @ApiPropertyOptional({ description: 'Settings (JSON object)' })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class TenantResponseDto {
  @ApiProperty({ description: 'Tenant ID' })
  id: number;

  @ApiProperty({ description: 'Tenant code' })
  code: string;

  @ApiProperty({ description: 'Tenant name' })
  name: string;

  @ApiProperty({ description: 'Display name' })
  displayName: string;

  @ApiPropertyOptional({ description: 'Description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Tax code' })
  taxCode?: string;

  @ApiPropertyOptional({ description: 'Email address' })
  email?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  phone?: string;

  @ApiPropertyOptional({ description: 'Address' })
  address?: string;

  @ApiPropertyOptional({ description: 'City ID' })
  cityId?: number;

  @ApiPropertyOptional({ description: 'Province ID' })
  provinceId?: number;

  @ApiPropertyOptional({ description: 'Country ID' })
  countryId?: number;

  @ApiPropertyOptional({ description: 'Logo URL' })
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Website URL' })
  website?: string;

  @ApiProperty({ description: 'Status', enum: ['ACTIVE', 'SUSPENDED', 'INACTIVE'] })
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';

  @ApiProperty({ description: 'Subscription tier', enum: ['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE'] })
  subscriptionTier: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';

  @ApiPropertyOptional({ description: 'Subscription expiration date' })
  subscriptionExpiresAt?: Date;

  @ApiProperty({ description: 'Maximum number of users' })
  maxUsers: number;

  @ApiProperty({ description: 'Maximum storage in GB' })
  maxStorageGb: number;

  @ApiPropertyOptional({ description: 'Settings' })
  settings?: Record<string, any>;

  @ApiProperty({ description: 'Is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Created by user ID' })
  createdBy?: number;

  @ApiPropertyOptional({ description: 'Updated by user ID' })
  updatedBy?: number;
}

export class TenantListResponseDto {
  @ApiProperty({ description: 'List of tenants', type: [TenantResponseDto] })
  tenants: TenantResponseDto[];

  @ApiProperty({ description: 'Total number of tenants' })
  total: number;
}

