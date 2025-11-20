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
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { UnitService } from '../../application/services/unit.service';
import { CreateUnitDto, UpdateUnitDto, UnitResponseDto, UnitType } from '../../application/dtos/unit.dto';
import { JwtAuthGuard } from '../../presentation/guards/jwt-auth.guard';
import { RbacGuard } from '../guards/rbac.guard';
import { Permissions } from '../decorators/permissions.decorator';
import { GetUnitsQueryDto } from '../../application/dtos/get-units-query.dto';

@ApiTags("Units")
@Controller('units')
@UseGuards(JwtAuthGuard, RbacGuard)
@ApiBearerAuth()
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Post()
  @Permissions("product:create")
  @ApiOperation({ summary: "Create a new unit" })
  @ApiResponse({ status: 201, description: "Unit created successfully", type: UnitResponseDto })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 409, description: "Unit code already exists" })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUnitDto: CreateUnitDto): Promise<UnitResponseDto> {
    return await this.unitService.create(createUnitDto);
  }

  @Get()
  @Permissions("product:read")
  @ApiOperation({ summary: "Get all units" })
  @ApiQuery({ name: "page", required: false, type: Number, description: "Page number" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Items per page" })
  @ApiQuery({ name: "search", required: false, type: String, description: "Search term" })
  @ApiQuery({ name: "type", required: false, type: String, description: "Filter by unit type" })
  @ApiQuery({ name: "isActive", required: false, type: Boolean, description: "Filter by active status" })
  @ApiResponse({ status: 200, description: "Units retrieved successfully" })
  async findAll(
    @Query() query: GetUnitsQueryDto,
  ): Promise<{ units: UnitResponseDto[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.max(1, query.limit ?? 10);
    const search = query.search;
    const type = query.type;
    const isActive = query.isActive;

    return await this.unitService.findAll({ page, limit, search, type, isActive });
  }

  @Get(':id')
  @Permissions("product:read")
  @ApiOperation({ summary: "Get unit by ID" })
  @ApiResponse({ status: 200, description: "Unit retrieved successfully", type: UnitResponseDto })
  @ApiResponse({ status: 404, description: "Unit not found" })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UnitResponseDto> {
    return await this.unitService.findOne(id);
  }

  @Put(':id')
  @Permissions("product:update")
  @ApiOperation({ summary: "Update unit" })
  @ApiResponse({ status: 200, description: "Unit updated successfully", type: UnitResponseDto })
  @ApiResponse({ status: 404, description: "Unit not found" })
  @ApiResponse({ status: 409, description: "Unit code already exists" })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUnitDto: UpdateUnitDto,
  ): Promise<UnitResponseDto> {
    return await this.unitService.update(id, updateUnitDto);
  }

  @Delete(':id')
  @Permissions("product:delete")
  @ApiOperation({ summary: "Delete unit" })
  @ApiResponse({ status: 204, description: "Unit deleted successfully" })
  @ApiResponse({ status: 404, description: "Unit not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.unitService.remove(id);
  }

  @Get('by-type/:type')
  @Permissions("product:read")
  @ApiOperation({ summary: "Get units by type" })
  @ApiParam({ name: "type", enum: UnitType, description: "Unit type" })
  @ApiResponse({ status: 200, description: "Units retrieved successfully", type: [UnitResponseDto] })
  @ApiResponse({ status: 400, description: "Invalid unit type" })
  async findByType(@Param('type') type: string): Promise<UnitResponseDto[]> {
    // Validate that the type parameter is a valid UnitType
    if (!Object.values(UnitType).includes(type as UnitType)) {
      throw new BadRequestException(`Invalid unit type: ${type}. Valid types are: ${Object.values(UnitType).join(', ')}`);
    }
    return await this.unitService.findByType(type as UnitType);
  }
}
