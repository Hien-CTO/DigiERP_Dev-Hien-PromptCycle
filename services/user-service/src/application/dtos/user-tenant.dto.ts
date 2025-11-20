import { IsInt, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AssignUserToTenantDto {
  @ApiProperty({ description: 'User ID' })
  @IsNotEmpty()
  @IsInt()
  userId: number;

  @ApiProperty({ description: 'Tenant ID' })
  @IsNotEmpty()
  @IsInt()
  tenantId: number;

  @ApiProperty({ description: 'Role ID for user in this tenant', type: Number })
  @IsNotEmpty()
  @IsInt()
  roleId: number;

  @ApiPropertyOptional({ description: 'Set as primary tenant', default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class AssignUserToTenantWithRolesDto {
  @ApiProperty({ 
    description: 'User ID',
    example: 7,
    type: Number
  })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  userId: number;

  @ApiProperty({ 
    description: 'Tenant ID',
    example: 1,
    type: Number
  })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  tenantId: number;

  @ApiProperty({ 
    description: 'Role ID(s) for user in this tenant. Can be a single role ID (number) or multiple role IDs (array of numbers). Only TENANT scope roles are allowed.',
    oneOf: [
      { type: 'number', example: 1 },
      { type: 'array', items: { type: 'number' }, example: [1, 2, 3] }
    ],
    examples: {
      single: { 
        value: 1, 
        description: 'Single role ID',
        summary: 'Single role'
      },
      multiple: { 
        value: [1, 2, 3], 
        description: 'Multiple role IDs',
        summary: 'Multiple roles'
      }
    }
  })
  @IsNotEmpty()
  roleId: number | number[];

  @ApiPropertyOptional({ 
    description: 'Set as primary tenant. Only the first role will be marked as primary if multiple roles are assigned.',
    default: false,
    example: false,
    type: Boolean
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class UpdateUserTenantRoleDto {
  @ApiProperty({ description: 'Role ID for user in this tenant' })
  @IsNotEmpty()
  @IsInt()
  roleId: number;
}

export class UserTenantResponseDto {
  @ApiProperty({ description: 'Tenant ID' })
  tenantId: number;

  @ApiProperty({ description: 'Tenant code' })
  tenantCode: string;

  @ApiProperty({ description: 'Tenant name' })
  tenantName: string;

  @ApiProperty({ description: 'Role ID' })
  roleId: number;

  @ApiProperty({ description: 'Role name' })
  roleName: string;

  @ApiProperty({ description: 'Is primary tenant' })
  isPrimary: boolean;

  @ApiProperty({ description: 'Joined at' })
  joinedAt: Date;
}

export class AssignUserToTenantWithRolesResponseDto {
  @ApiProperty({ description: 'User ID' })
  userId: number;

  @ApiProperty({ description: 'Tenant ID' })
  tenantId: number;

  @ApiProperty({ description: 'Tenant code' })
  tenantCode: string;

  @ApiProperty({ description: 'Tenant name' })
  tenantName: string;

  @ApiProperty({ description: 'Assigned roles', type: [UserTenantResponseDto] })
  roles: UserTenantResponseDto[];
}

export class UserInTenantResponseDto {
  @ApiProperty({ description: 'User ID' })
  userId: number;

  @ApiProperty({ description: 'Username' })
  username: string;

  @ApiProperty({ description: 'Email' })
  email: string;

  @ApiProperty({ description: 'First name' })
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  lastName: string;

  @ApiProperty({ description: 'Role ID' })
  roleId: number;

  @ApiProperty({ description: 'Role name' })
  roleName: string;

  @ApiProperty({ description: 'Is primary tenant' })
  isPrimary: boolean;

  @ApiProperty({ description: 'Joined at' })
  joinedAt: Date;

  @ApiProperty({ description: 'Is active' })
  isActive: boolean;
}

export class TenantUsersListResponseDto {
  @ApiProperty({ description: 'List of users in tenant', type: [UserInTenantResponseDto] })
  users: UserInTenantResponseDto[];
}
