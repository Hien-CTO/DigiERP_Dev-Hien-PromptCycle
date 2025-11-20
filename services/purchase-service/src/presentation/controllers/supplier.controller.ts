import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto, UpdateSupplierDto, SupplierResponseDto, SupplierSearchQueryDto, SupplierPaginationResponseDto } from '../../application/dtos/supplier.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RbacGuard } from '../guards/rbac.guard';
import { Permissions } from '../decorators/permissions.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';

@ApiTags('Suppliers')
@ApiBearerAuth()
@Controller('suppliers')
@UseGuards(JwtAuthGuard, RbacGuard)
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new supplier' })
  @ApiResponse({ status: 201, description: 'Supplier created successfully', type: SupplierResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Permissions('supplier:create')
  async create(
    @Body() createSupplierDto: CreateSupplierDto,
    @CurrentUser() user: any,
  ): Promise<SupplierResponseDto> {
    return await this.supplierService.create(createSupplierDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get suppliers with pagination and optional search' })
  @ApiResponse({ status: 200, description: 'Suppliers retrieved successfully', type: SupplierPaginationResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (>=1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (>=1)', example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Keyword matches name/contact/email/phone/tax_code', example: 'MAG' })
  @ApiQuery({ name: 'is_active', required: false, type: Boolean, description: 'Filter by active status', example: true })
  @Permissions('supplier:read')
  async findAll(
    @Query() query: SupplierSearchQueryDto,
  ): Promise<SupplierPaginationResponseDto> {
    return await this.supplierService.findAll(query);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active suppliers' })
  @ApiResponse({ status: 200, description: 'Active suppliers retrieved successfully', type: [SupplierResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Permissions('supplier:read')
  async findActiveSuppliers(): Promise<SupplierResponseDto[]> {
    return await this.supplierService.findActiveSuppliers();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get supplier by ID' })
  @ApiResponse({ status: 200, description: 'Supplier retrieved successfully', type: SupplierResponseDto })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Permissions('supplier:read')
  async findOne(@Param('id') id: string): Promise<SupplierResponseDto> {
    return await this.supplierService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update supplier' })
  @ApiResponse({ status: 200, description: 'Supplier updated successfully', type: SupplierResponseDto })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Permissions('supplier:update')
  async update(
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
    @CurrentUser() user: any,
  ): Promise<SupplierResponseDto> {
    return await this.supplierService.update(id, updateSupplierDto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete supplier' })
  @ApiResponse({ status: 204, description: 'Supplier deleted successfully' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Permissions('supplier:delete')
  async remove(@Param('id') id: string): Promise<void> {
    return await this.supplierService.remove(id);
  }
}
