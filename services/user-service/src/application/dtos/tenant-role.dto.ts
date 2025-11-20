import { IsArray, IsNotEmpty, IsInt, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRolesToTenantDto {
  @ApiProperty({
    description: 'Array of role IDs to assign to tenant',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one role ID is required' })
  @IsInt({ each: true, message: 'Each role ID must be a number' })
  roleIds: number[];
}

export class AssignRolesToTenantWithBodyDto {
  @ApiProperty({
    description: 'Tenant ID',
    example: 1,
  })
  @IsNotEmpty({ message: 'Tenant ID is required' })
  @IsInt({ message: 'Tenant ID must be a number' })
  tenantId: number;

  @ApiProperty({
    description: 'Array of role IDs to assign to tenant',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one role ID is required' })
  @IsInt({ each: true, message: 'Each role ID must be a number' })
  roleIds: number[];
}

export class AssignRolesToTenantResponseDto {
  @ApiProperty({ description: 'Tenant ID' })
  tenantId: number;

  @ApiProperty({ description: 'Tenant code' })
  tenantCode: string;

  @ApiProperty({ description: 'Tenant name' })
  tenantName: string;

  @ApiProperty({
    description: 'Assigned roles',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        name: { type: 'string' },
        displayName: { type: 'string' },
        scope: { type: 'string', enum: ['GLOBAL', 'TENANT'] },
        tenantId: { type: 'number', nullable: true },
      },
    },
  })
  roles: Array<{
    id: number;
    name: string;
    displayName: string;
    scope: 'GLOBAL' | 'TENANT';
    tenantId?: number;
    isNew: boolean;
  }>;
}

