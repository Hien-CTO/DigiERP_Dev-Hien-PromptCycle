import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/external/jwt-auth.guard';
import { CreateInventoryRevaluationDto, UpdateInventoryRevaluationDto, InventoryRevaluationResponseDto } from '../../application/dtos/inventory-revaluation.dto';
import { CreateInventoryRevaluationUseCase } from '../../application/use-cases/inventory-revaluation/create-inventory-revaluation.use-case';
import { GetInventoryRevaluationUseCase } from '../../application/use-cases/inventory-revaluation/get-inventory-revaluation.use-case';
import { GetAllInventoryRevaluationsUseCase } from '../../application/use-cases/inventory-revaluation/get-all-inventory-revaluations.use-case';
import { UpdateInventoryRevaluationUseCase } from '../../application/use-cases/inventory-revaluation/update-inventory-revaluation.use-case';
import { DeleteInventoryRevaluationUseCase } from '../../application/use-cases/inventory-revaluation/delete-inventory-revaluation.use-case';
import { PostInventoryRevaluationUseCase } from '../../application/use-cases/inventory-revaluation/post-inventory-revaluation.use-case';

@Controller('inventory-revaluations')
@UseGuards(JwtAuthGuard)
export class InventoryRevaluationController {
  constructor(
    private readonly createInventoryRevaluationUseCase: CreateInventoryRevaluationUseCase,
    private readonly getInventoryRevaluationUseCase: GetInventoryRevaluationUseCase,
    private readonly getAllInventoryRevaluationsUseCase: GetAllInventoryRevaluationsUseCase,
    private readonly updateInventoryRevaluationUseCase: UpdateInventoryRevaluationUseCase,
    private readonly deleteInventoryRevaluationUseCase: DeleteInventoryRevaluationUseCase,
    private readonly postInventoryRevaluationUseCase: PostInventoryRevaluationUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateInventoryRevaluationDto, @Request() req): Promise<InventoryRevaluationResponseDto> {
    const userId = req.user.id;
    return await this.createInventoryRevaluationUseCase.execute(dto, userId);
  }

  @Get()
  async findAll(): Promise<InventoryRevaluationResponseDto[]> {
    return await this.getAllInventoryRevaluationsUseCase.execute();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<InventoryRevaluationResponseDto> {
    return await this.getInventoryRevaluationUseCase.execute(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInventoryRevaluationDto,
    @Request() req,
  ): Promise<InventoryRevaluationResponseDto> {
    const userId = req.user.id;
    return await this.updateInventoryRevaluationUseCase.execute(id, dto, userId);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.deleteInventoryRevaluationUseCase.execute(id);
  }

  @Patch(':id/post')
  async post(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ): Promise<InventoryRevaluationResponseDto> {
    const userId = req.user.id;
    return await this.postInventoryRevaluationUseCase.execute(id, userId);
  }
}
