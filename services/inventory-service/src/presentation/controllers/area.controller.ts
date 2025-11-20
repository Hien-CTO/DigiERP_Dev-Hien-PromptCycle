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
import { CreateAreaDto, UpdateAreaDto } from '../../application/dtos/area.dto';
import { CreateAreaUseCase } from '../../application/use-cases/area/create-area.use-case';
import { GetAreaUseCase } from '../../application/use-cases/area/get-area.use-case';
import { GetAreasUseCase } from '../../application/use-cases/area/get-areas.use-case';
import { UpdateAreaUseCase } from '../../application/use-cases/area/update-area.use-case';
import { DeleteAreaUseCase } from '../../application/use-cases/area/delete-area.use-case';

@ApiTags('areas')
@Controller('areas')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AreaController {
  constructor(
    private readonly createAreaUseCase: CreateAreaUseCase,
    private readonly getAreaUseCase: GetAreaUseCase,
    private readonly getAreasUseCase: GetAreasUseCase,
    private readonly updateAreaUseCase: UpdateAreaUseCase,
    private readonly deleteAreaUseCase: DeleteAreaUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new area' })
  @ApiResponse({ status: 201, description: 'Area created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createAreaDto: CreateAreaDto, @Request() req: any) {
    return this.createAreaUseCase.execute(createAreaDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all areas' })
  @ApiResponse({ status: 200, description: 'Areas retrieved successfully' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('warehouseId') warehouseId?: string,
  ) {
    return this.getAreasUseCase.execute(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
      warehouseId ? parseInt(warehouseId) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get area by ID' })
  @ApiResponse({ status: 200, description: 'Area retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Area not found' })
  async findOne(@Param('id') id: string) {
    return this.getAreaUseCase.execute(parseInt(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update area' })
  @ApiResponse({ status: 200, description: 'Area updated successfully' })
  @ApiResponse({ status: 404, description: 'Area not found' })
  async update(
    @Param('id') id: string,
    @Body() updateAreaDto: UpdateAreaDto,
    @Request() req: any,
  ) {
    return this.updateAreaUseCase.execute(parseInt(id), updateAreaDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete area' })
  @ApiResponse({ status: 200, description: 'Area deleted successfully' })
  @ApiResponse({ status: 404, description: 'Area not found' })
  async remove(@Param('id') id: string) {
    await this.deleteAreaUseCase.execute(parseInt(id));
    return { message: 'Area deleted successfully' };
  }
}
