import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsArray, IsNumber, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PermissionResponseDto } from './permission.dto';

export class CreateRoleDto {
  @ApiProperty({ description: 'Role name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Role display name' })
  @IsNotEmpty()
  @IsString()
  displayName: string;

  @ApiProperty({ description: 'Role description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Is system role', default: false })
  @IsOptional()
  @IsBoolean()
  isSystemRole?: boolean;

  @ApiProperty({ description: 'Role scope: Chỉ sử dụng TENANT', enum: ['GLOBAL', 'TENANT'], default: 'TENANT' })
  @IsOptional()
  @IsString()
  scope?: 'GLOBAL' | 'TENANT';

  @ApiProperty({ description: 'Tenant ID (bắt buộc - tất cả roles đều thuộc tenant)', required: true })
  @IsNotEmpty({ message: 'Tenant ID is required. All roles must belong to a tenant.' })
  @IsInt({ message: 'Tenant ID must be a number conforming to the specified constraints' })
  tenantId: number;

  @ApiProperty({ description: 'Is role active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateRoleDto {
  @ApiProperty({ description: 'Role name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Role display name', required: false })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiProperty({ description: 'Role description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Is role active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class RoleResponseDto {
  @ApiProperty({ description: 'Role ID' })
  id: number;

  @ApiProperty({ description: 'Role name' })
  name: string;

  @ApiProperty({ description: 'Role display name' })
  displayName: string;

  @ApiProperty({ description: 'Role description', required: false })
  description?: string;

  @ApiProperty({ description: 'Is system role' })
  isSystemRole: boolean;

  @ApiProperty({ description: 'Role scope: GLOBAL or TENANT' })
  scope: 'GLOBAL' | 'TENANT';

  @ApiProperty({ description: 'Tenant ID (if scope is TENANT)', required: false })
  tenantId?: number;

  @ApiProperty({ description: 'Is role active' })
  isActive: boolean;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}

export class RoleListResponseDto {
  @ApiProperty({ description: 'List of roles', type: [RoleResponseDto] })
  roles: RoleResponseDto[];

  @ApiProperty({ description: 'Total number of roles' })
  total: number;

  @ApiProperty({ description: 'Current page number', required: false })
  page?: number;

  @ApiProperty({ description: 'Items per page', required: false })
  limit?: number;

  @ApiProperty({ description: 'Total number of pages', required: false })
  totalPages?: number;
}

export class PermissionListResponseDto {
  @ApiProperty({ description: 'List of permissions', type: [PermissionResponseDto] })
  permissions: PermissionResponseDto[];

  @ApiProperty({ description: 'Total number of permissions' })
  total: number;
}

export class AssignRoleToUserDto {
  @ApiProperty({ description: 'Role IDs to assign', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  roleIds: number[];
}

export class AssignPermissionsToRoleDto {
  @ApiProperty({ description: 'Permission IDs to assign', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  permissionIds: number[];
}
