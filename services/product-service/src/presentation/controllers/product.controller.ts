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
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RbacGuard } from "../guards/rbac.guard";
import { Permissions } from "../decorators/permissions.decorator";
import { CurrentUser } from "../decorators/current-user.decorator";

import { CreateProductUseCase } from "../../application/use-cases/product/create-product.use-case";
import { GetProductUseCase } from "../../application/use-cases/product/get-product.use-case";
import { GetProductsUseCase } from "../../application/use-cases/product/get-products.use-case";
import { UpdateProductUseCase } from "../../application/use-cases/product/update-product.use-case";
import { DeleteProductUseCase } from "../../application/use-cases/product/delete-product.use-case";
import {
  CreateProductDto,
  UpdateProductDto,
  ProductResponseDto,
  ProductListResponseDto,
} from "../../application/dtos/product.dto";
import { PaginationQueryDto } from "../../application/dtos/pagination-query.dto";
import { DataSource } from "typeorm";

@ApiTags("Products")
@Controller("products")
@UseGuards(JwtAuthGuard, RbacGuard)
@ApiBearerAuth()
export class ProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly getProductUseCase: GetProductUseCase,
    private readonly getProductsUseCase: GetProductsUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
    private readonly dataSource: DataSource,
  ) {}

  @Post()
  @Permissions("product:create")
  @ApiOperation({ summary: "Create a new product" })
  @ApiResponse({ status: 201, description: "Product created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() user: any,
  ): Promise<ProductResponseDto> {
    const product = await this.createProductUseCase.execute(
      createProductDto,
      user.id,
    );
    return this.toResponseDto(product);
  }

  @Get()
  @Permissions("product:read")
  @ApiOperation({ summary: "Get all products" })
  @ApiResponse({ status: 200, description: "Products retrieved successfully" })
  async findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<ProductListResponseDto> {
    try {
      const page = Math.max(1, query.page ?? 1);
      const limit = Math.max(1, query.limit ?? 10);
      const search = query.search;

      console.log(`[ProductController] findAll - page: ${page}, limit: ${limit}, search: ${search}`);
      const result = await this.getProductsUseCase.execute(page, limit, search);
      console.log(`[ProductController] findAll - found ${result.products.length} products, total: ${result.total}`);
      return {
        products: result.products.map((product) => this.toResponseDto(product)),
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      };
    } catch (error) {
      console.error(`[ProductController] findAll error:`, error);
      throw error;
    }
  }

  @Get(":id")
  @Permissions("product:read")
  @ApiOperation({ summary: "Get product by ID" })
  @ApiResponse({ status: 200, description: "Product retrieved successfully" })
  @ApiResponse({ status: 404, description: "Product not found" })
  async findOne(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<ProductResponseDto> {
    const product = await this.getProductUseCase.execute(id);
    return this.toResponseDto(product);
  }

  @Put(":id")
  @Permissions("product:update")
  @ApiOperation({ summary: "Update product" })
  @ApiResponse({ status: 200, description: "Product updated successfully" })
  @ApiResponse({ status: 404, description: "Product not found" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: any,
  ): Promise<ProductResponseDto> {
    const product = await this.updateProductUseCase.execute(
      id,
      updateProductDto,
      user.id,
    );
    return this.toResponseDto(product);
  }

  @Delete(":id")
  @Permissions("product:delete")
  @ApiOperation({ summary: "Delete product" })
  @ApiResponse({ status: 200, description: "Product deleted successfully" })
  @ApiResponse({ status: 404, description: "Product not found" })
  async remove(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.deleteProductUseCase.execute(id);
    return { message: "Product deleted successfully" };
  }

  private toResponseDto(product: any): ProductResponseDto {
    try {
      // Handle category - can be either from domain entity or joined relation
      let category = undefined;
      if (product.category) {
        category = {
          id: product.category.id || product.categoryId,
          name: product.category.name || '',
          displayName: product.category.display_name || product.category.name || '',
        };
      }

      // Handle material - can be either from domain entity or joined relation
      let material = undefined;
      if (product.material) {
        material = {
          id: product.material.id || product.materialId,
          name: product.material.name || '',
          displayName: product.material.display_name || product.material.name || '',
        };
      }

      return {
        id: product.id,
        sku: product.sku || '',
        name: product.name || '',
        description: product.description || '',
        categoryId: product.categoryId || product.category?.id,
        materialId: product.materialId || product.material?.id,
        category,
        material,
        brand: product.brand || '',
        model: product.model || '',
        unit: product.unit || '',
        packagingTypeId: product.packagingTypeId,
        packaging: product.packaging || '',
        weight: product.weight || 0,
        status: product.status || 'ACTIVE',
        isActive: product.isActive !== undefined ? product.isActive : true,
        imageUrl: product.imageUrl || '',
        images: product.images || '',
        sortOrder: product.sortOrder || 0,
        isBatchManaged: product.isBatchManaged || false,
        hasExpiryDate: product.hasExpiryDate || false,
        expiryWarningDays: product.expiryWarningDays || 30,
        batchRequired: product.batchRequired || false,
        stockStatus: product.stockStatus || 'IN_STOCK',
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        createdBy: product.createdBy,
        updatedBy: product.updatedBy,
      };
    } catch (error) {
      console.error(`[ProductController] toResponseDto error for product ${product.id}:`, error);
      throw error;
    }
  }
}
