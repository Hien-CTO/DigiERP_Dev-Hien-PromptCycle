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
import { CreateRoleUseCase } from '@/application/use-cases/role/create-role.use-case';
import { GetRoleUseCase } from '@/application/use-cases/role/get-role.use-case';
import { GetRolesUseCase } from '@/application/use-cases/role/get-roles.use-case';
import { GetRolePermissionsUseCase, RolePermissionsResponseDto } from '@/application/use-cases/role/get-role-permissions.use-case';
import { UpdateRoleUseCase } from '@/application/use-cases/role/update-role.use-case';
import { DeleteRoleUseCase } from '@/application/use-cases/role/delete-role.use-case';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RbacGuard } from '../guards/rbac.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Permissions } from '../decorators/permissions.decorator';
import {
  CreateRoleDto,
  UpdateRoleDto,
  RoleResponseDto,
  RoleListResponseDto,
} from '@/application/dtos/role.dto';

@ApiTags('Roles')
@Controller('roles')
// Authorization disabled - will be handled by API Gateway
// @UseGuards(JwtAuthGuard, RbacGuard)
// @ApiBearerAuth()
export class RoleController {
  constructor(
    private readonly createRoleUseCase: CreateRoleUseCase,
    private readonly getRoleUseCase: GetRoleUseCase,
    private readonly getRolesUseCase: GetRolesUseCase,
    private readonly getRolePermissionsUseCase: GetRolePermissionsUseCase,
    private readonly updateRoleUseCase: UpdateRoleUseCase,
    private readonly deleteRoleUseCase: DeleteRoleUseCase,
  ) {}

  @Post()
  // @Permissions('role:create')
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully', type: RoleResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Role name already exists' })
  async create(@Body() createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    return this.createRoleUseCase.execute(createRoleDto);
  }

  @Get()
  // @Permissions('role:read')
  @ApiOperation({ summary: 'Get all roles (supports pagination and search)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiResponse({ status: 200, description: 'Roles retrieved successfully', type: RoleListResponseDto })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ): Promise<RoleListResponseDto> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.getRolesUseCase.execute(pageNum, limitNum, search);
  }

  @Get(':id')
  // @Permissions('role:read')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({ status: 200, description: 'Role retrieved successfully', type: RoleResponseDto })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<RoleResponseDto> {
    return this.getRoleUseCase.execute(id);
  }

  @Get(':id/permissions')
  // @Permissions('role:read')
  @ApiOperation({ summary: 'Get role permissions by role ID' })
  @ApiResponse({ status: 200, description: 'Role permissions retrieved successfully', type: RolePermissionsResponseDto })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async getRolePermissions(@Param('id', ParseIntPipe) id: number): Promise<RolePermissionsResponseDto> {
    return this.getRolePermissionsUseCase.execute(id);
  }

  @Put(':id')
  // @Permissions('role:update')
  @ApiOperation({ summary: 'Update role' })
  @ApiResponse({ status: 200, description: 'Role updated successfully', type: RoleResponseDto })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 403, description: 'System roles cannot be modified' })
  @ApiResponse({ status: 409, description: 'Role name already exists' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<RoleResponseDto> {
    return this.updateRoleUseCase.execute(id, updateRoleDto);
  }

  @Delete(':id')
  // @Permissions('role:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete role' })
  @ApiResponse({ status: 204, description: 'Role deleted successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 403, description: 'System roles cannot be deleted' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.deleteRoleUseCase.execute(id);
  }
}
