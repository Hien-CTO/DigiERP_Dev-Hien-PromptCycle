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
  ApiQuery,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RbacGuard } from "../guards/rbac.guard";
import { Permissions } from "../decorators/permissions.decorator";
import { CurrentUser } from "../decorators/current-user.decorator";

import { CreateProductPriceUseCase } from "../../application/use-cases/product-price/create-product-price.use-case";
import { GetProductPriceUseCase } from "../../application/use-cases/product-price/get-product-price.use-case";
import { GetProductPricesUseCase } from "../../application/use-cases/product-price/get-product-prices.use-case";
import { UpdateProductPriceUseCase } from "../../application/use-cases/product-price/update-product-price.use-case";
import { DeleteProductPriceUseCase } from "../../application/use-cases/product-price/delete-product-price.use-case";

import {
  CreateProductPriceDto,
  UpdateProductPriceDto,
  ProductPriceResponseDto,
  ProductPriceListResponseDto,
} from "../../application/dtos/product-price.dto";

@ApiTags("Product Prices")
@Controller("product-prices")
@UseGuards(JwtAuthGuard, RbacGuard)
@ApiBearerAuth()
export class ProductPriceController {
  constructor(
    private readonly createProductPriceUseCase: CreateProductPriceUseCase,
    private readonly getProductPriceUseCase: GetProductPriceUseCase,
    private readonly getProductPricesUseCase: GetProductPricesUseCase,
    private readonly updateProductPriceUseCase: UpdateProductPriceUseCase,
    private readonly deleteProductPriceUseCase: DeleteProductPriceUseCase,
  ) {}

  @Post()
  @Permissions("product:create")
  @ApiOperation({ summary: "Create a new product price" })
  @ApiResponse({
    status: 201,
    description: "Product price created successfully",
    type: ProductPriceResponseDto,
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async create(
    @Body() createPriceDto: CreateProductPriceDto,
    @CurrentUser() user: any,
  ): Promise<ProductPriceResponseDto> {
    const price = await this.createProductPriceUseCase.execute(
      createPriceDto,
      user.id,
    );
    return this.toResponseDto(price);
  }

  @Get()
  @Permissions("product:read")
  @ApiOperation({ summary: "Get all product prices" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "productId", required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: "Product prices retrieved successfully",
    type: ProductPriceListResponseDto,
  })
  async findAll(
    @Query("page") pageStr?: string,
    @Query("limit") limitStr?: string,
    @Query("search") search?: string,
    @Query("productId") productIdStr?: string,
  ): Promise<ProductPriceListResponseDto> {
    const page = pageStr ? parseInt(pageStr, 10) : 1;
    const limit = limitStr ? parseInt(limitStr, 10) : 10;
    const productId = productIdStr ? parseInt(productIdStr, 10) : undefined;

    const result = await this.getProductPricesUseCase.execute(
      page,
      limit,
      search,
      productId,
    );
    return {
      prices: result.prices.map((price) => this.toResponseDto(price)),
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    };
  }

  @Get(":id")
  @Permissions("product:read")
  @ApiOperation({ summary: "Get product price by ID" })
  @ApiResponse({
    status: 200,
    description: "Product price retrieved successfully",
    type: ProductPriceResponseDto,
  })
  @ApiResponse({ status: 404, description: "Product price not found" })
  async findOne(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<ProductPriceResponseDto> {
    const price = await this.getProductPriceUseCase.execute(id);
    return this.toResponseDto(price);
  }

  @Put(":id")
  @Permissions("product:update")
  @ApiOperation({ summary: "Update product price" })
  @ApiResponse({
    status: 200,
    description: "Product price updated successfully",
    type: ProductPriceResponseDto,
  })
  @ApiResponse({ status: 404, description: "Product price not found" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updatePriceDto: UpdateProductPriceDto,
    @CurrentUser() user: any,
  ): Promise<ProductPriceResponseDto> {
    const price = await this.updateProductPriceUseCase.execute(
      id,
      updatePriceDto,
      user.id,
    );
    return this.toResponseDto(price);
  }

  @Delete(":id")
  @Permissions("product:delete")
  @ApiOperation({ summary: "Delete product price" })
  @ApiResponse({
    status: 200,
    description: "Product price deleted successfully",
  })
  @ApiResponse({ status: 404, description: "Product price not found" })
  async remove(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.deleteProductPriceUseCase.execute(id);
    return { message: "Product price deleted successfully" };
  }

  private toResponseDto(price: any): ProductPriceResponseDto {
    return {
      id: price.id,
      productId: price.productId,
      price: price.price,
      documentPrice: price.documentPrice,
      isActive: price.isActive,
      notes: price.notes,
      createdAt: price.createdAt,
      updatedAt: price.updatedAt,
      createdBy: price.createdBy,
      updatedBy: price.updatedBy,
    };
  }
}

