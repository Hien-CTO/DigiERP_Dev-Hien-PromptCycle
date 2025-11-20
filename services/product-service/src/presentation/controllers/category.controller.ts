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

import { CreateCategoryUseCase } from "../../application/use-cases/category/create-category.use-case";
import { GetCategoryUseCase } from "../../application/use-cases/category/get-category.use-case";
import { GetCategoriesUseCase } from "../../application/use-cases/category/get-categories.use-case";
import { UpdateCategoryUseCase } from "../../application/use-cases/category/update-category.use-case";
import { DeleteCategoryUseCase } from "../../application/use-cases/category/delete-category.use-case";

import {
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
  ProductCategoryResponseDto,
  ProductCategoryListResponseDto,
} from "../../application/dtos/product-category.dto";
import { PaginationQueryDto } from "../../application/dtos/pagination-query.dto";

@ApiTags("Categories")
@Controller("categories")
@UseGuards(JwtAuthGuard, RbacGuard)
@ApiBearerAuth()
export class CategoryController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly getCategoryUseCase: GetCategoryUseCase,
    private readonly getCategoriesUseCase: GetCategoriesUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
  ) {}

  @Post()
  @Permissions("product:create")
  @ApiOperation({ summary: "Create a new category" })
  @ApiResponse({ status: 201, description: "Category created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async create(
    @Body() createCategoryDto: CreateProductCategoryDto,
    @CurrentUser() user: any,
  ): Promise<ProductCategoryResponseDto> {
    const category = await this.createCategoryUseCase.execute(
      createCategoryDto,
      user.id,
    );
    return this.toResponseDto(category);
  }

  @Get()
  @Permissions("product:read")
  @ApiOperation({ summary: "Get all categories" })
  @ApiResponse({
    status: 200,
    description: "Categories retrieved successfully",
  })
  async findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<ProductCategoryListResponseDto> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.max(1, query.limit ?? 10);
    const search = query.search;

    const result = await this.getCategoriesUseCase.execute(page, limit, search);
    return {
      categories: result.categories.map((category) =>
        this.toResponseDto(category),
      ),
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    };
  }

  @Get(":id")
  @Permissions("product:read")
  @ApiOperation({ summary: "Get category by ID" })
  @ApiResponse({ status: 200, description: "Category retrieved successfully" })
  @ApiResponse({ status: 404, description: "Category not found" })
  async findOne(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<ProductCategoryResponseDto> {
    const category = await this.getCategoryUseCase.execute(id);
    return this.toResponseDto(category);
  }

  @Put(":id")
  @Permissions("product:update")
  @ApiOperation({ summary: "Update category" })
  @ApiResponse({ status: 200, description: "Category updated successfully" })
  @ApiResponse({ status: 404, description: "Category not found" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateProductCategoryDto,
    @CurrentUser() user: any,
  ): Promise<ProductCategoryResponseDto> {
    const category = await this.updateCategoryUseCase.execute(
      id,
      updateCategoryDto,
      user.id,
    );
    return this.toResponseDto(category);
  }

  @Delete(":id")
  @Permissions("product:delete")
  @ApiOperation({ summary: "Delete category" })
  @ApiResponse({ status: 200, description: "Category deleted successfully" })
  @ApiResponse({ status: 404, description: "Category not found" })
  async remove(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.deleteCategoryUseCase.execute(id);
    return { message: "Category deleted successfully" };
  }

  private toResponseDto(category: any): ProductCategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      code: category.code,
      parentCategory: category.parentCategory,
      parentId: category.parentId,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      imageUrl: category.imageUrl,
      metaTitle: category.metaTitle,
      metaDescription: category.metaDescription,
      metaKeywords: category.metaKeywords,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      createdBy: category.createdBy,
      updatedBy: category.updatedBy,
    };
  }
}
