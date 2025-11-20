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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { CreateUserUseCase } from '@/application/use-cases/user/create-user.use-case';
import { UpdateUserUseCase } from '@/application/use-cases/user/update-user.use-case';
import { GetUserUseCase } from '@/application/use-cases/user/get-user.use-case';
import { GetUsersUseCase } from '@/application/use-cases/user/get-users.use-case';
import { GetUserRolesUseCase } from '@/application/use-cases/user/get-user-roles.use-case';
import { GetUserRolesWithPermissionsUseCase } from '@/application/use-cases/user/get-user-roles-permissions.use-case';
import { DeleteUserUseCase } from '@/application/use-cases/user/delete-user.use-case';
import { RemoveUserFromTenantUseCase } from '@/application/use-cases/tenant/remove-user-from-tenant.use-case';
import { RemoveRoleFromUserTenantUseCase } from '@/application/use-cases/tenant/remove-role-from-user-tenant.use-case';
import { RemoveRoleFromUserUseCase } from '@/application/use-cases/permission/remove-role-from-user.use-case';
import { LogoutUseCase } from '@/application/use-cases/auth/logout.use-case';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RbacGuard } from '../guards/rbac.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Roles } from '../decorators/roles.decorator';
import { Permissions } from '../decorators/permissions.decorator';
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
  UserListResponseDto,
} from '@/application/dtos/user.dto';
import { RoleResponseDto } from '@/application/dtos/role.dto';
import { UserRolesWithPermissionsResponseDto } from '@/application/dtos/user-roles-permissions.dto';
import { multerConfig } from '@/infrastructure/config/multer.config';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

@ApiTags('Users')
@Controller('users')
// Authorization disabled - will be handled by API Gateway
// @UseGuards(JwtAuthGuard, RbacGuard)
// @ApiBearerAuth()
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly getUserRolesUseCase: GetUserRolesUseCase,
    private readonly getUserRolesWithPermissionsUseCase: GetUserRolesWithPermissionsUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly removeUserFromTenantUseCase: RemoveUserFromTenantUseCase,
    private readonly removeRoleFromUserTenantUseCase: RemoveRoleFromUserTenantUseCase,
    private readonly removeRoleFromUserUseCase: RemoveRoleFromUserUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  // @Permissions('user:create')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Username or email already exists' })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.createUserUseCase.execute(createUserDto);
  }

  @Get()
  // @Permissions('user:read')
  @ApiOperation({ summary: 'Get all users or get users by tenant ID' })
  @ApiQuery({ name: 'tenantId', required: false, type: Number, description: 'Filter users by tenant ID' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully', type: UserListResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid tenantId parameter' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async findAll(
    @Query('tenantId') tenantId?: string,
  ): Promise<UserListResponseDto> {
    const tenantIdNumber = tenantId ? parseInt(tenantId, 10) : undefined;
    if (tenantId && isNaN(tenantIdNumber)) {
      throw new BadRequestException('Invalid tenantId parameter. Must be a valid number.');
    }
    return this.getUsersUseCase.execute(tenantIdNumber);
  }

  @Get(':id')
  // @Permissions('user:read')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    return this.getUserUseCase.execute(id);
  }

  @Put(':id')
  // @Permissions('user:update')
  @UseInterceptors(FileInterceptor('avatarUrl', multerConfig))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        email: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        phone: { type: 'string' },
        avatarUrl: { type: 'string', format: 'binary' },
        isActive: { type: 'boolean' },
        isVerified: { type: 'boolean' },
        tenantId: { type: 'number' },
        roleId: { type: 'number' },
        isPrimary: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Username or email already exists' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto, 
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<UserResponseDto> {
    // Parse boolean fields from form-data (they come as strings)
    const parsedDto: UpdateUserDto = {
      ...updateUserDto,
      isActive: updateUserDto.isActive !== undefined
        ? (typeof updateUserDto.isActive === 'string'
          ? updateUserDto.isActive === 'true'
          : updateUserDto.isActive)
        : undefined,
      isVerified: updateUserDto.isVerified !== undefined
        ? (typeof updateUserDto.isVerified === 'string'
          ? updateUserDto.isVerified === 'true'
          : updateUserDto.isVerified)
        : undefined,
      isPrimary: updateUserDto.isPrimary !== undefined
        ? (typeof updateUserDto.isPrimary === 'string'
          ? updateUserDto.isPrimary === 'true'
          : updateUserDto.isPrimary)
        : undefined,
      tenantId: updateUserDto.tenantId !== undefined && updateUserDto.tenantId !== null
        ? (typeof updateUserDto.tenantId === 'string' ? parseInt(updateUserDto.tenantId, 10) : updateUserDto.tenantId)
        : undefined,
      roleId: updateUserDto.roleId !== undefined && updateUserDto.roleId !== null
        ? (typeof updateUserDto.roleId === 'string' ? parseInt(updateUserDto.roleId, 10) : updateUserDto.roleId)
        : undefined,
    };

    // Handle file upload
    let avatarUrl: string | undefined;
    if (file) {
      // Get existing user to check for old avatar
      const existingUser = await this.getUserUseCase.execute(id);
      
      // Delete old avatar file if exists
      if (existingUser.avatarUrl) {
        try {
          // Extract filename from avatarUrl (could be full path or relative path)
          const oldAvatarPath = existingUser.avatarUrl.startsWith('uploads/')
            ? join(process.cwd(), existingUser.avatarUrl)
            : join(process.cwd(), 'uploads', 'avatars', existingUser.avatarUrl.split('/').pop() || '');
          
          await unlink(oldAvatarPath);
        } catch (error: any) {
          // Ignore error if file doesn't exist (ENOENT)
          if (error.code !== 'ENOENT') {
            console.warn(`Failed to delete old avatar file: ${error.message}`);
          }
        }
      }
      
      // File is saved to ./uploads/avatars/user-{id}-{timestamp}.{ext}
      // The filename is already set by multer config
      // Construct URL path accessible through API Gateway
      const apiGatewayUrl = this.configService.get<string>('API_GATEWAY_URL', 'http://localhost:4000');
      const relativePath = `uploads/avatars/${file.filename}`;
      // Store full URL with API Gateway base URL so frontend can access it
      avatarUrl = `${apiGatewayUrl}/${relativePath}`;
    } else if (updateUserDto.avatarUrl && typeof updateUserDto.avatarUrl === 'string') {
      // If avatarUrl is provided as a string (existing URL), use it
      avatarUrl = updateUserDto.avatarUrl;
    }

    return this.updateUserUseCase.execute(id, parsedDto, avatarUrl);
  }

  @Get(':id/roles')
  // @Permissions('user:read')
  @ApiOperation({ summary: 'Get user roles by user ID (supports tenant context)' })
  @ApiQuery({ name: 'tenantId', required: false, type: Number, description: 'Filter roles by tenant context' })
  @ApiResponse({ status: 200, description: 'User roles retrieved successfully', type: [RoleResponseDto] })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserRoles(
    @Param('id', ParseIntPipe) id: number,
    @Query('tenantId') tenantId?: string,
  ): Promise<{ roles: RoleResponseDto[] }> {
    const tenantIdNumber = tenantId ? parseInt(tenantId, 10) : undefined;
    if (tenantId && isNaN(tenantIdNumber)) {
      throw new BadRequestException('Invalid tenantId parameter. Must be a valid number.');
    }
    return this.getUserRolesUseCase.execute(id, tenantIdNumber);
  }

  @Get(':id/roles-permissions')
  // @Permissions('user:read')
  @ApiOperation({ summary: 'Get user roles with permissions by user ID (supports tenant context)' })
  @ApiQuery({ name: 'tenantId', required: false, type: Number, description: 'Filter roles and permissions by tenant context' })
  @ApiResponse({ status: 200, description: 'User roles and permissions retrieved successfully', type: UserRolesWithPermissionsResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserRolesWithPermissions(
    @Param('id', ParseIntPipe) id: number,
    @Query('tenantId') tenantId?: string,
  ): Promise<UserRolesWithPermissionsResponseDto> {
    const tenantIdNumber = tenantId ? parseInt(tenantId, 10) : undefined;
    if (tenantId && isNaN(tenantIdNumber)) {
      throw new BadRequestException('Invalid tenantId parameter. Must be a valid number.');
    }
    return this.getUserRolesWithPermissionsUseCase.execute(id, tenantIdNumber);
  }

  @Delete(':id/roles/:roleId')
  // @Permissions('user:update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove GLOBAL role from user' })
  @ApiResponse({ status: 200, description: 'Role removed from user successfully' })
  @ApiResponse({ status: 404, description: 'User not found, role not found, or user does not have this GLOBAL role' })
  async removeRoleFromUser(
    @Param('id', ParseIntPipe) id: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ): Promise<{ message: string }> {
    return this.removeRoleFromUserUseCase.execute(id, roleId);
  }

  @Delete(':id/tenants/:tenantId/roles/:roleId')
  // @Permissions('user:update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove specific role from user tenant' })
  @ApiResponse({ status: 200, description: 'Role removed from user tenant successfully' })
  @ApiResponse({ status: 404, description: 'User not found, tenant not found, role not found, or user does not have this role in this tenant' })
  async removeRoleFromUserTenant(
    @Param('id', ParseIntPipe) id: number,
    @Param('tenantId', ParseIntPipe) tenantId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ): Promise<{ message: string }> {
    return this.removeRoleFromUserTenantUseCase.execute(id, tenantId, roleId);
  }

  @Delete(':id/tenants/:tenantId')
  // @Permissions('user:update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove tenant from user (removes all roles)' })
  @ApiResponse({ status: 200, description: 'Tenant removed from user successfully' })
  @ApiResponse({ status: 404, description: 'User not found, tenant not found, or user is not assigned to this tenant' })
  async removeTenantFromUser(
    @Param('id', ParseIntPipe) id: number,
    @Param('tenantId', ParseIntPipe) tenantId: number,
  ): Promise<{ message: string }> {
    return this.removeUserFromTenantUseCase.execute(id, tenantId);
  }

  @Post(':id/logout')
  // @Permissions('user:update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Force logout user' })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async forceLogoutUser(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.logoutUseCase.execute({ refreshToken: '' }, id);
    return { message: 'User logged out successfully' };
  }

  @Delete(':id')
  // @Permissions('user:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Cannot delete your own account' })
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any): Promise<void> {
    return this.deleteUserUseCase.execute(id, user.id);
  }
}