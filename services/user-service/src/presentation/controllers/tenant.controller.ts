import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreateTenantUseCase } from '@/application/use-cases/tenant/create-tenant.use-case';
import { GetTenantUseCase } from '@/application/use-cases/tenant/get-tenant.use-case';
import { GetTenantsUseCase } from '@/application/use-cases/tenant/get-tenants.use-case';
import { UpdateTenantUseCase } from '@/application/use-cases/tenant/update-tenant.use-case';
import { DeleteTenantUseCase } from '@/application/use-cases/tenant/delete-tenant.use-case';
import { GetTenantUsersUseCase } from '@/application/use-cases/tenant/get-tenant-users.use-case';
import { GetTenantRolesUseCase } from '@/application/use-cases/tenant/get-tenant-roles.use-case';
import { AssignUserToTenantWithRolesUseCase } from '@/application/use-cases/tenant/assign-user-to-tenant-with-roles.use-case';
import { InitializeTenantRolesAndPermissionsUseCase } from '@/application/use-cases/tenant/initialize-tenant-roles-permissions.use-case';
import { AssignRolesToTenantUseCase } from '@/application/use-cases/tenant/assign-roles-to-tenant.use-case';
import {
  CreateTenantDto,
  UpdateTenantDto,
  TenantResponseDto,
  TenantListResponseDto,
} from '@/application/dtos/tenant.dto';
import {
  TenantUsersListResponseDto,
  AssignUserToTenantWithRolesDto,
  AssignUserToTenantWithRolesResponseDto,
} from '@/application/dtos/user-tenant.dto';
import { AssignRolesToTenantDto, AssignRolesToTenantWithBodyDto, AssignRolesToTenantResponseDto } from '@/application/dtos/tenant-role.dto';
import { RoleListResponseDto } from '@/application/dtos/role.dto';

@ApiTags('Tenants')
@Controller('tenants')
// Authorization disabled - will be handled by API Gateway
// @UseGuards(JwtAuthGuard, RbacGuard)
// @ApiBearerAuth()
export class TenantController {
  constructor(
    private readonly createTenantUseCase: CreateTenantUseCase,
    private readonly getTenantUseCase: GetTenantUseCase,
    private readonly getTenantsUseCase: GetTenantsUseCase,
    private readonly updateTenantUseCase: UpdateTenantUseCase,
    private readonly deleteTenantUseCase: DeleteTenantUseCase,
    private readonly getTenantUsersUseCase: GetTenantUsersUseCase,
    private readonly getTenantRolesUseCase: GetTenantRolesUseCase,
    private readonly assignUserToTenantWithRolesUseCase: AssignUserToTenantWithRolesUseCase,
    private readonly initializeTenantRolesAndPermissionsUseCase: InitializeTenantRolesAndPermissionsUseCase,
    private readonly assignRolesToTenantUseCase: AssignRolesToTenantUseCase,
  ) {}

  @Post()
  // @Permissions('tenant:create')
  @ApiOperation({ summary: 'Create a new tenant' })
  @ApiResponse({ status: 201, description: 'Tenant created successfully', type: TenantResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Tenant code or tax code already exists' })
  async create(@Body() createTenantDto: CreateTenantDto): Promise<TenantResponseDto> {
    return this.createTenantUseCase.execute(createTenantDto);
  }

  @Get()
  // @Permissions('tenant:read')
  @ApiOperation({ summary: 'Get all tenants' })
  @ApiResponse({ status: 200, description: 'Tenants retrieved successfully', type: TenantListResponseDto })
  async findAll(
  ): Promise<TenantListResponseDto> {
    return this.getTenantsUseCase.execute();
  }

  @Get(':id')
  // @Permissions('tenant:read')
  @ApiOperation({ summary: 'Get tenant by ID' })
  @ApiResponse({ status: 200, description: 'Tenant retrieved successfully', type: TenantResponseDto })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<TenantResponseDto> {
    return this.getTenantUseCase.execute(id);
  }

  @Put(':id')
  // @Permissions('tenant:update')
  @ApiOperation({ summary: 'Update tenant' })
  @ApiResponse({ status: 200, description: 'Tenant updated successfully', type: TenantResponseDto })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiResponse({ status: 409, description: 'Tenant code or tax code already exists' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTenantDto: UpdateTenantDto,
  ): Promise<TenantResponseDto> {
    return this.updateTenantUseCase.execute(id, updateTenantDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  // @Permissions('tenant:delete')
  @ApiOperation({ summary: 'Delete tenant' })
  @ApiResponse({ status: 200, description: 'Tenant deleted successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiResponse({ status: 400, description: 'Tenant cannot be deleted' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.deleteTenantUseCase.execute(id);
  }

  @Get(':id/users')
  // @Permissions('tenant:read')
  @ApiOperation({ summary: 'Get all users in a tenant' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully', type: TenantUsersListResponseDto })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async getTenantUsers(@Param('id', ParseIntPipe) tenantId: number): Promise<TenantUsersListResponseDto> {
    return this.getTenantUsersUseCase.execute(tenantId);
  }

  @Post(':id/assign-user')
  // @Permissions('tenant:update')
  @ApiOperation({ 
    summary: 'Assign user to tenant with one or multiple roles',
    description: 'Assigns a user to a tenant with specified role(s). The tenantId must be provided in the request body. The roleId can be a single number or an array of numbers for multiple roles.'
  })
  @ApiBody({ 
    type: AssignUserToTenantWithRolesDto,
    examples: {
      singleRole: {
        summary: 'Assign single role',
        description: 'Example with a single role ID',
        value: {
          userId: 7,
          tenantId: 1,
          roleId: 1,
          isPrimary: false
        }
      },
      multipleRoles: {
        summary: 'Assign multiple roles',
        description: 'Example with multiple role IDs',
        value: {
          userId: 7,
          tenantId: 1,
          roleId: [1, 2, 3],
          isPrimary: false
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'User assigned to tenant successfully', 
    type: AssignUserToTenantWithRolesResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid role IDs, GLOBAL roles not allowed, or validation error' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User, tenant, or role not found' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'User already has all specified roles in this tenant' 
  })
  async assignUserToTenant(
    @Body() assignDto: AssignUserToTenantWithRolesDto,
  ): Promise<AssignUserToTenantWithRolesResponseDto> {
    return this.assignUserToTenantWithRolesUseCase.execute(assignDto);
  }

  @Get(':id/roles')
  // @Permissions('tenant:read')
  @ApiOperation({ summary: 'Get all roles for a tenant' })
  @ApiResponse({ status: 200, description: 'Roles retrieved successfully', type: RoleListResponseDto })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async getTenantRoles(@Param('id', ParseIntPipe) tenantId: number): Promise<RoleListResponseDto> {
    return this.getTenantRolesUseCase.execute(tenantId);
  }

  @Post('assign-roles')
  // @Permissions('tenant:update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Assign one or multiple roles to tenant (tenantId and roleIds in body)',
    description:
      'Assigns roles to a tenant. Both tenantId and roleIds are provided in the request body. If roles are GLOBAL scope, creates TENANT-scoped copies for this tenant. If roles are TENANT scope from another tenant, creates copies for this tenant. System roles cannot be assigned.',
  })
  @ApiBody({
    type: AssignRolesToTenantWithBodyDto,
    examples: {
      singleRole: {
        summary: 'Assign single role',
        description: 'Example with a single role ID',
        value: {
          tenantId: 17,
          roleIds: [1],
        },
      },
      multipleRoles: {
        summary: 'Assign multiple roles',
        description: 'Example with multiple role IDs',
        value: {
          tenantId: 17,
          roleIds: [1, 2, 3],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Roles assigned to tenant successfully',
    type: AssignRolesToTenantResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid tenant ID, role IDs, system roles not allowed, or validation error',
  })
  @ApiResponse({ status: 404, description: 'Tenant or role not found' })
  async assignRolesToTenant(
    @Body() assignDto: AssignRolesToTenantWithBodyDto,
  ): Promise<AssignRolesToTenantResponseDto> {
    return this.assignRolesToTenantUseCase.execute(assignDto.tenantId, { roleIds: assignDto.roleIds });
  }

  @Post(':id/initialize-roles-permissions')
  // @Permissions('tenant:admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Re-initialize roles and permissions for a tenant',
    description: 'Syncs roles and permissions from code definition to database. This will update existing roles and permissions according to the current code definition.'
  })
  @ApiResponse({ status: 200, description: 'Roles and permissions initialized successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async initializeRolesAndPermissions(@Param('id', ParseIntPipe) tenantId: number): Promise<{ message: string; createdRoles: number; createdPermissions: number }> {
    return this.initializeTenantRolesAndPermissionsUseCase.execute(tenantId);
  }
}
