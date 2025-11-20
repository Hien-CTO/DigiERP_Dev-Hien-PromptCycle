import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ description: 'Permission name (e.g., user:create)' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Permission display name' })
  @IsNotEmpty()
  @IsString()
  displayName: string;

  @ApiProperty({ description: 'Permission description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Resource ID' })
  @IsNotEmpty()
  @IsNumber()
  resourceId: number;

  @ApiProperty({ description: 'Action ID' })
  @IsNotEmpty()
  @IsNumber()
  actionId: number;

  @ApiProperty({ description: 'Permission scope: GLOBAL or TENANT', enum: ['GLOBAL', 'TENANT'], default: 'GLOBAL' })
  @IsOptional()
  @IsString()
  scope?: 'GLOBAL' | 'TENANT';

  @ApiProperty({ description: 'Tenant ID (required if scope is TENANT)', required: false })
  @IsOptional()
  @IsNumber()
  tenantId?: number;

  @ApiProperty({ description: 'Is permission active', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePermissionDto {
  @ApiProperty({ description: 'Permission name (e.g., user:create)', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Permission display name', required: false })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiProperty({ description: 'Permission description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Resource ID', required: false })
  @IsOptional()
  @IsNumber()
  resourceId?: number;

  @ApiProperty({ description: 'Action ID', required: false })
  @IsOptional()
  @IsNumber()
  actionId?: number;

  @ApiProperty({ description: 'Is permission active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class PermissionResponseDto {
  @ApiProperty({ description: 'Permission ID' })
  id: number;

  @ApiProperty({ description: 'Permission name' })
  name: string;

  @ApiProperty({ description: 'Permission display name' })
  displayName: string;

  @ApiProperty({ description: 'Permission description', required: false })
  description?: string;

  @ApiProperty({ description: 'Resource ID' })
  resourceId: number;

  @ApiProperty({ description: 'Action ID' })
  actionId: number;

  @ApiProperty({ description: 'Permission scope: GLOBAL or TENANT' })
  scope: 'GLOBAL' | 'TENANT';

  @ApiProperty({ description: 'Tenant ID (if scope is TENANT)', required: false })
  tenantId?: number;

  @ApiProperty({ description: 'Is permission active' })
  isActive: boolean;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}

export class PermissionListResponseDto {
  @ApiProperty({ description: 'List of permissions', type: [PermissionResponseDto] })
  permissions: PermissionResponseDto[];

  @ApiProperty({ description: 'Total number of permissions' })
  total: number;
}

export class UserPermissionsResponseDto {
  @ApiProperty({ description: 'User ID' })
  userId: number;

  @ApiProperty({ description: 'User roles', type: [String] })
  roles: string[];

  @ApiProperty({ description: 'User permissions', type: [String] })
  permissions: string[];
}
