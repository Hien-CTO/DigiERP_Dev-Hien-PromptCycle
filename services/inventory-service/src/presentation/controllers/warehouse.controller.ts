import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/external/jwt-auth.guard';
import { CreateWarehouseDto, UpdateWarehouseDto } from '../../application/dtos/warehouse.dto';
import { CreateWarehouseUseCase } from '../../application/use-cases/warehouse/create-warehouse.use-case';
import { GetWarehouseUseCase } from '../../application/use-cases/warehouse/get-warehouse.use-case';
import { GetWarehousesUseCase } from '../../application/use-cases/warehouse/get-warehouses.use-case';
import { UpdateWarehouseUseCase } from '../../application/use-cases/warehouse/update-warehouse.use-case';
import { DeleteWarehouseUseCase } from '../../application/use-cases/warehouse/delete-warehouse.use-case';

@ApiTags('warehouses')
@Controller('warehouses')
// @UseGuards(JwtAuthGuard)
// @ApiBearerAuth()
export class WarehouseController {
  constructor(
    private readonly createWarehouseUseCase: CreateWarehouseUseCase,
    private readonly getWarehouseUseCase: GetWarehouseUseCase,
    private readonly getWarehousesUseCase: GetWarehousesUseCase,
    private readonly updateWarehouseUseCase: UpdateWarehouseUseCase,
    private readonly deleteWarehouseUseCase: DeleteWarehouseUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new warehouse' })
  @ApiResponse({ status: 201, description: 'Warehouse created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createWarehouseDto: CreateWarehouseDto, @Request() req: any) {
    const userId = req.user?.userId || req.user?.id || 1; // Default to 1 if no user
    return this.createWarehouseUseCase.execute(createWarehouseDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all warehouses' })
  @ApiResponse({ status: 200, description: 'Warehouses retrieved successfully' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.getWarehousesUseCase.execute(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get warehouse by ID' })
  @ApiResponse({ status: 200, description: 'Warehouse retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Warehouse not found' })
  async findOne(@Param('id') id: string) {
    return this.getWarehouseUseCase.execute(parseInt(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update warehouse' })
  @ApiResponse({ status: 200, description: 'Warehouse updated successfully' })
  @ApiResponse({ status: 404, description: 'Warehouse not found' })
  async update(
    @Param('id') id: string,
    @Body() updateWarehouseDto: UpdateWarehouseDto,
    @Request() req: any,
  ) {
    const userId = req.user?.userId || req.user?.id || 1; // Default to 1 if no user
    return this.updateWarehouseUseCase.execute(parseInt(id), updateWarehouseDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete warehouse' })
  @ApiResponse({ status: 200, description: 'Warehouse deleted successfully' })
  @ApiResponse({ status: 404, description: 'Warehouse not found' })
  async remove(@Param('id') id: string) {
    await this.deleteWarehouseUseCase.execute(parseInt(id));
    return { message: 'Warehouse deleted successfully' };
  }
}
