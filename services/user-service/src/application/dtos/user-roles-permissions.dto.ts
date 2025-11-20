import { ApiProperty } from '@nestjs/swagger';

export class RoleWithPermissionsDto {
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

  @ApiProperty({ description: 'Is role active' })
  isActive: boolean;

  @ApiProperty({ description: 'Permissions for this role', type: [String] })
  permissions: string[];
}

export class UserRolesWithPermissionsResponseDto {
  @ApiProperty({ description: 'User ID' })
  userId: number;

  @ApiProperty({ description: 'Username' })
  username: string;

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({ description: 'User full name' })
  fullName: string;

  @ApiProperty({ description: 'List of roles with their permissions', type: [RoleWithPermissionsDto] })
  roles: RoleWithPermissionsDto[];

  @ApiProperty({ description: 'All unique permissions from all roles', type: [String] })
  allPermissions: string[];
}

