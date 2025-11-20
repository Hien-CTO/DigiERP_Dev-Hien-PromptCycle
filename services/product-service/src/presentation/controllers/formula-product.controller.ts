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
import { FormulaProductService } from '../../application/services/formula-product.service';
import { CreateFormulaProductDto, UpdateFormulaProductDto, FormulaProductResponseDto } from '../../application/dtos/formula-product.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RbacGuard } from '../guards/rbac.guard';
import { Permissions } from '../decorators/permissions.decorator';
import { GetFormulaProductsQueryDto } from '../../application/dtos/get-formula-products-query.dto';

@ApiTags("Formula Products")
@Controller('formula-products')
@UseGuards(JwtAuthGuard, RbacGuard)
@ApiBearerAuth()
export class FormulaProductController {
  constructor(private readonly formulaProductService: FormulaProductService) {}

  @Post()
  @Permissions("product:create")
  @ApiOperation({ summary: "Create a new formula product" })
  @ApiResponse({ status: 201, description: "FormulaProduct created successfully", type: FormulaProductResponseDto })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 409, description: "FormulaProduct code already exists" })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createFormulaProductDto: CreateFormulaProductDto): Promise<FormulaProductResponseDto> {
    return await this.formulaProductService.create(createFormulaProductDto);
  }

  @Get()
  @Permissions("product:read")
  @ApiOperation({ summary: "Get all formula products" })
  @ApiQuery({ name: "page", required: false, type: Number, description: "Page number" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Items per page" })
  @ApiQuery({ name: "search", required: false, type: String, description: "Search term" })
  @ApiQuery({ name: "brandId", required: false, type: Number, description: "Filter by brand ID" })
  @ApiQuery({ name: "isActive", required: false, type: Boolean, description: "Filter by active status" })
  @ApiResponse({ status: 200, description: "FormulaProducts retrieved successfully" })
  async findAll(
    @Query() query: GetFormulaProductsQueryDto,
  ): Promise<{ models: FormulaProductResponseDto[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.max(1, query.limit ?? 10);
    const search = query.search;
    const brandId = query.brandId;
    const isActive = query.isActive;

    return await this.formulaProductService.findAll({
      page,
      limit,
      search,
      brandId,
      isActive,
    });
  }

  @Get(':id')
  @Permissions("product:read")
  @ApiOperation({ summary: "Get formula product by ID" })
  @ApiResponse({ status: 200, description: "FormulaProduct retrieved successfully", type: FormulaProductResponseDto })
  @ApiResponse({ status: 404, description: "FormulaProduct not found" })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<FormulaProductResponseDto> {
    return await this.formulaProductService.findOne(id);
  }

  @Put(':id')
  @Permissions("product:update")
  @ApiOperation({ summary: "Update formula product" })
  @ApiResponse({ status: 200, description: "FormulaProduct updated successfully", type: FormulaProductResponseDto })
  @ApiResponse({ status: 404, description: "FormulaProduct not found" })
  @ApiResponse({ status: 409, description: "FormulaProduct code already exists" })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFormulaProductDto: UpdateFormulaProductDto,
  ): Promise<FormulaProductResponseDto> {
    return await this.formulaProductService.update(id, updateFormulaProductDto);
  }

  @Delete(':id')
  @Permissions("product:delete")
  @ApiOperation({ summary: "Delete formula product" })
  @ApiResponse({ status: 200, description: "FormulaProduct deleted successfully" })
  @ApiResponse({ status: 404, description: "FormulaProduct not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.formulaProductService.remove(id);
  }
}

