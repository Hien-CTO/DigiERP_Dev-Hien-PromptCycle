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
  HttpStatus,
  HttpCode,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { BrandService } from '../../application/services/brand.service';
import { CreateBrandDto, UpdateBrandDto, BrandResponseDto } from '../../application/dtos/brand.dto';
import { JwtAuthGuard } from '../../presentation/guards/jwt-auth.guard';
import { RbacGuard } from '../guards/rbac.guard';
import { Permissions } from '../decorators/permissions.decorator';
import { GetBrandsQueryDto } from '../../application/dtos/get-brands-query.dto';

@ApiTags("Brands")
@Controller('brands')
@UseGuards(JwtAuthGuard, RbacGuard)
@ApiBearerAuth()
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  @Permissions("product:create")
  @ApiOperation({ summary: "Create a new brand" })
  @ApiResponse({ status: 201, description: "Brand created successfully", type: BrandResponseDto })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 409, description: "Brand code already exists" })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createBrandDto: CreateBrandDto): Promise<BrandResponseDto> {
    return await this.brandService.create(createBrandDto);
  }

  @Get()
  @Permissions("product:read")
  @ApiOperation({ summary: "Get all brands" })
  @ApiQuery({ name: "page", required: false, type: Number, description: "Page number" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Items per page" })
  @ApiQuery({ name: "search", required: false, type: String, description: "Search term" })
  @ApiQuery({ name: "isActive", required: false, type: Boolean, description: "Filter by active status" })
  @ApiResponse({ status: 200, description: "Brands retrieved successfully" })
  async findAll(
    @Query() query: GetBrandsQueryDto,
  ): Promise<{ brands: BrandResponseDto[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.max(1, query.limit ?? 10);
    const search = query.search;
    const isActive = query.isActive;

    return await this.brandService.findAll({ page, limit, search, isActive });
  }

  @Get(':id')
  @Permissions("product:read")
  @ApiOperation({ summary: "Get brand by ID" })
  @ApiResponse({ status: 200, description: "Brand retrieved successfully", type: BrandResponseDto })
  @ApiResponse({ status: 404, description: "Brand not found" })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<BrandResponseDto> {
    return await this.brandService.findOne(id);
  }

  @Put(':id')
  @Permissions("product:update")
  @ApiOperation({ summary: "Update brand" })
  @ApiResponse({ status: 200, description: "Brand updated successfully", type: BrandResponseDto })
  @ApiResponse({ status: 404, description: "Brand not found" })
  @ApiResponse({ status: 409, description: "Brand code already exists" })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBrandDto: UpdateBrandDto,
  ): Promise<BrandResponseDto> {
    return await this.brandService.update(id, updateBrandDto);
  }

  @Delete(':id')
  @Permissions("product:delete")
  @ApiOperation({ summary: "Delete brand" })
  @ApiResponse({ status: 204, description: "Brand deleted successfully" })
  @ApiResponse({ status: 404, description: "Brand not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.brandService.remove(id);
  }

  @Put(':id/activate')
  @Permissions("product:update")
  @ApiOperation({ summary: "Activate brand" })
  @ApiResponse({ status: 200, description: "Brand activated successfully", type: BrandResponseDto })
  @ApiResponse({ status: 404, description: "Brand not found" })
  async activate(@Param('id', ParseIntPipe) id: number): Promise<BrandResponseDto> {
    return await this.brandService.activate(id);
  }

  @Put(':id/deactivate')
  @Permissions("product:update")
  @ApiOperation({ summary: "Deactivate brand" })
  @ApiResponse({ status: 200, description: "Brand deactivated successfully", type: BrandResponseDto })
  @ApiResponse({ status: 404, description: "Brand not found" })
  async deactivate(@Param('id', ParseIntPipe) id: number): Promise<BrandResponseDto> {
    return await this.brandService.deactivate(id);
  }
}
