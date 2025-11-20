import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GetPermissionsUseCase } from '@/application/use-cases/permission/get-permissions.use-case';
import { GetPermissionUseCase } from '@/application/use-cases/permission/get-permission.use-case';
import { CreatePermissionUseCase } from '@/application/use-cases/permission/create-permission.use-case';
import { UpdatePermissionUseCase } from '@/application/use-cases/permission/update-permission.use-case';
import { DeletePermissionUseCase } from '@/application/use-cases/permission/delete-permission.use-case';
import { AssignPermissionsToRoleUseCase } from '@/application/use-cases/permission/assign-permissions-to-role.use-case';
import { AssignRolesToUserUseCase } from '@/application/use-cases/permission/assign-roles-to-user.use-case';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RbacGuard } from '../guards/rbac.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Permissions } from '../decorators/permissions.decorator';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  PermissionResponseDto,
  PermissionListResponseDto,
} from '@/application/dtos/permission.dto';
import {
  AssignPermissionsToRoleDto,
  AssignRoleToUserDto,
} from '@/application/dtos/role.dto';
import { User } from '@/infrastructure/database/entities';

@ApiTags('Permissions')
@Controller('permissions')
// Authorization disabled - will be handled by API Gateway
// @UseGuards(JwtAuthGuard, RbacGuard)
// @ApiBearerAuth()
export class PermissionController {
  constructor(
    private readonly getPermissionsUseCase: GetPermissionsUseCase,
    private readonly getPermissionUseCase: GetPermissionUseCase,
    private readonly createPermissionUseCase: CreatePermissionUseCase,
    private readonly updatePermissionUseCase: UpdatePermissionUseCase,
    private readonly deletePermissionUseCase: DeletePermissionUseCase,
    private readonly assignPermissionsToRoleUseCase: AssignPermissionsToRoleUseCase,
    private readonly assignRolesToUserUseCase: AssignRolesToUserUseCase,
  ) {}

  @Get()
  // @Permissions('permission:read')
  @ApiOperation({ summary: 'Get all permissions (supports filtering by scope and tenantId)' })
  @ApiQuery({ name: 'scope', required: false, enum: ['GLOBAL', 'TENANT'], description: 'Filter permissions by scope' })
  @ApiQuery({ name: 'tenantId', required: false, type: Number, description: 'Filter TENANT permissions by tenant ID' })
  @ApiResponse({ status: 200, description: 'Permissions retrieved successfully', type: PermissionListResponseDto })
  async findAll(
    @Query('scope') scope?: 'GLOBAL' | 'TENANT',
    @Query('tenantId') tenantId?: string,
  ): Promise<PermissionListResponseDto> {
    const tenantIdNumber = tenantId ? parseInt(tenantId, 10) : undefined;
    if (tenantId && isNaN(tenantIdNumber)) {
      throw new BadRequestException('Invalid tenantId parameter. Must be a valid number.');
    }
    return this.getPermissionsUseCase.execute(scope, tenantIdNumber);
  }

  @Get(':id')
  // @Permissions('permission:read')
  @ApiOperation({ summary: 'Get permission by ID' })
  @ApiResponse({ status: 200, description: 'Permission retrieved successfully', type: PermissionResponseDto })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PermissionResponseDto> {
    return this.getPermissionUseCase.execute(id);
  }

  @Post()
  // @Permissions('permission:create')
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({ status: 201, description: 'Permission created successfully', type: PermissionResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Permission name already exists' })
  async create(@Body() createPermissionDto: CreatePermissionDto): Promise<PermissionResponseDto> {
    return this.createPermissionUseCase.execute(createPermissionDto);
  }

  @Put(':id')
  // @Permissions('permission:update')
  @ApiOperation({ summary: 'Update permission' })
  @ApiResponse({ status: 200, description: 'Permission updated successfully', type: PermissionResponseDto })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiResponse({ status: 409, description: 'Permission name already exists' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<PermissionResponseDto> {
    return this.updatePermissionUseCase.execute(id, updatePermissionDto);
  }

  @Delete(':id')
  // @Permissions('permission:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete permission' })
  @ApiResponse({ status: 204, description: 'Permission deleted successfully' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.deletePermissionUseCase.execute(id);
  }

  @Post('roles/:id/assign')
  // @Permissions('role:update')
  @ApiOperation({ summary: 'Assign permissions to role' })
  @ApiResponse({ status: 200, description: 'Permissions assigned successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 403, description: 'System roles cannot be modified' })
  async assignPermissionsToRole(
    @Param('id', ParseIntPipe) roleId: number,
    @Body() assignPermissionsDto: AssignPermissionsToRoleDto,
  ): Promise<{ message: string }> {
    await this.assignPermissionsToRoleUseCase.execute(roleId, assignPermissionsDto, 1);
    return { message: 'Permissions assigned successfully' };
  }

  @Post('users/:id/assign-roles')
  // @Permissions('user:update')
  @ApiOperation({ 
    summary: 'Assign GLOBAL roles to user',
    description: 'This endpoint is for assigning GLOBAL scope roles only. TENANT scope roles must be assigned through tenant user assignment endpoints (e.g., POST /tenants/:id/users/assign)'
  })
  @ApiResponse({ status: 200, description: 'Roles assigned successfully' })
  @ApiResponse({ status: 400, description: 'Cannot assign TENANT scope roles through this endpoint' })
  @ApiResponse({ status: 404, description: 'User or role not found' })
  async assignRolesToUser(
    @Param('id', ParseIntPipe) userId: number,
    @Body() assignRolesDto: AssignRoleToUserDto,
    @CurrentUser() user: any,
  ): Promise<{ message: string }> {
    await this.assignRolesToUserUseCase.execute(userId, assignRolesDto, user.id);
    return { message: 'Roles assigned successfully' };
  }
}
