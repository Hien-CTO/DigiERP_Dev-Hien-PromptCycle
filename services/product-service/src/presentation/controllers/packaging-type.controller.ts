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
import { PackagingTypeService } from '../../application/services/packaging-type.service';
import { CreatePackagingTypeDto, UpdatePackagingTypeDto, PackagingTypeResponseDto } from '../../application/dtos/packaging-type.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RbacGuard } from '../guards/rbac.guard';
import { Permissions } from '../decorators/permissions.decorator';
import { GetPackagingTypesQueryDto } from '../../application/dtos/get-packaging-types-query.dto';

@ApiTags("Packaging Types")
@Controller('packaging-types')
@UseGuards(JwtAuthGuard, RbacGuard)
@ApiBearerAuth()
export class PackagingTypeController {
  constructor(private readonly packagingTypeService: PackagingTypeService) {}

  @Post()
  @Permissions("product:create")
  @ApiOperation({ summary: "Create a new packaging type" })
  @ApiResponse({ status: 201, description: "PackagingType created successfully", type: PackagingTypeResponseDto })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 409, description: "PackagingType name already exists" })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPackagingTypeDto: CreatePackagingTypeDto): Promise<PackagingTypeResponseDto> {
    return await this.packagingTypeService.create(createPackagingTypeDto);
  }

  @Get()
  @Permissions("product:read")
  @ApiOperation({ summary: "Get all packaging types" })
  @ApiQuery({ name: "page", required: false, type: Number, description: "Page number" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Items per page" })
  @ApiQuery({ name: "search", required: false, type: String, description: "Search term" })
  @ApiQuery({ name: "isActive", required: false, type: Boolean, description: "Filter by active status" })
  @ApiResponse({ status: 200, description: "PackagingTypes retrieved successfully" })
  async findAll(
    @Query() query: GetPackagingTypesQueryDto,
  ): Promise<{ packagingTypes: PackagingTypeResponseDto[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.max(1, query.limit ?? 10);
    const search = query.search;
    const isActive = query.isActive;

    return await this.packagingTypeService.findAll({ page, limit, search, isActive });
  }

  @Get(':id')
  @Permissions("product:read")
  @ApiOperation({ summary: "Get packaging type by ID" })
  @ApiResponse({ status: 200, description: "PackagingType retrieved successfully", type: PackagingTypeResponseDto })
  @ApiResponse({ status: 404, description: "PackagingType not found" })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PackagingTypeResponseDto> {
    return await this.packagingTypeService.findOne(id);
  }

  @Put(':id')
  @Permissions("product:update")
  @ApiOperation({ summary: "Update packaging type" })
  @ApiResponse({ status: 200, description: "PackagingType updated successfully", type: PackagingTypeResponseDto })
  @ApiResponse({ status: 404, description: "PackagingType not found" })
  @ApiResponse({ status: 409, description: "PackagingType name already exists" })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePackagingTypeDto: UpdatePackagingTypeDto,
  ): Promise<PackagingTypeResponseDto> {
    return await this.packagingTypeService.update(id, updatePackagingTypeDto);
  }

  @Delete(':id')
  @Permissions("product:delete")
  @ApiOperation({ summary: "Delete packaging type" })
  @ApiResponse({ status: 200, description: "PackagingType deleted successfully" })
  @ApiResponse({ status: 404, description: "PackagingType not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.packagingTypeService.remove(id);
  }
}


