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
  NotFoundException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { MaterialRepository } from "../../infrastructure/database/repositories/material.repository";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RbacGuard } from "../guards/rbac.guard";
import { Permissions } from "../decorators/permissions.decorator";
import {
  CreateMaterialDto,
  UpdateMaterialDto,
  MaterialResponseDto,
  MaterialListResponseDto,
} from "../../application/dtos/material.dto";
import { PaginationQueryDto } from "../../application/dtos/pagination-query.dto";

@ApiTags("Materials")
@Controller("materials")
@UseGuards(JwtAuthGuard, RbacGuard)
@ApiBearerAuth()
export class MaterialController {
  constructor(private readonly materialRepository: MaterialRepository) {}

  @Post()
  @Permissions("product:create")
  @ApiOperation({ summary: "Create a new material" })
  @ApiResponse({ status: 201, description: "Material created successfully", type: MaterialResponseDto })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 409, description: "Material name already exists" })
  async create(@Body() createMaterialDto: CreateMaterialDto): Promise<MaterialResponseDto> {
    const material = await this.materialRepository.create(createMaterialDto);
    return this.mapToResponseDto(material);
  }

  @Get()
  @Permissions("product:read")
  @ApiOperation({ summary: "Get all materials" })
  @ApiQuery({ name: "page", required: false, type: Number, description: "Page number" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Items per page" })
  @ApiResponse({ status: 200, description: "Materials retrieved successfully", type: MaterialListResponseDto })
  async findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<MaterialListResponseDto> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.max(1, query.limit ?? 10);

    const { materials, total } = await this.materialRepository.findAll(page, limit);
    const totalPages = Math.ceil(total / limit);

    return {
      materials: materials.map((material) => this.mapToResponseDto(material)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  @Get(":id")
  @Permissions("product:read")
  @ApiOperation({ summary: "Get material by ID" })
  @ApiResponse({ status: 200, description: "Material retrieved successfully", type: MaterialResponseDto })
  @ApiResponse({ status: 404, description: "Material not found" })
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<MaterialResponseDto> {
    const material = await this.materialRepository.findById(id);
    if (!material) {
      throw new NotFoundException(`Material with ID ${id} not found`);
    }
    return this.mapToResponseDto(material);
  }

  @Put(":id")
  @Permissions("product:update")
  @ApiOperation({ summary: "Update material" })
  @ApiResponse({ status: 200, description: "Material updated successfully", type: MaterialResponseDto })
  @ApiResponse({ status: 404, description: "Material not found" })
  @ApiResponse({ status: 409, description: "Material name already exists" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateMaterialDto: UpdateMaterialDto,
  ): Promise<MaterialResponseDto> {
    const material = await this.materialRepository.update(id, updateMaterialDto);
    if (!material) {
      throw new NotFoundException(`Material with ID ${id} not found`);
    }
    return this.mapToResponseDto(material);
  }

  @Delete(":id")
  @Permissions("product:delete")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete material" })
  @ApiResponse({ status: 204, description: "Material deleted successfully" })
  @ApiResponse({ status: 404, description: "Material not found" })
  async remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
    const success = await this.materialRepository.delete(id);
    if (!success) {
      throw new NotFoundException(`Material with ID ${id} not found`);
    }
  }

  private mapToResponseDto(material: any): MaterialResponseDto {
    return {
      id: material.id,
      name: material.name,
      displayName: material.display_name,
      description: material.description,
      isActive: material.is_active,
      sortOrder: material.sort_order,
      createdAt: material.created_at,
      updatedAt: material.updated_at,
    };
  }
}
