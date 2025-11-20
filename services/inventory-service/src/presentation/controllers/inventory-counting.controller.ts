import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/external/jwt-auth.guard';
import { CreateInventoryCountingDto, UpdateInventoryCountingDto, InventoryCountingResponseDto } from '../../application/dtos/inventory-counting.dto';
import { CreateInventoryCountingUseCase } from '../../application/use-cases/inventory-counting/create-inventory-counting.use-case';
import { GetInventoryCountingUseCase } from '../../application/use-cases/inventory-counting/get-inventory-counting.use-case';
import { GetAllInventoryCountingsUseCase } from '../../application/use-cases/inventory-counting/get-all-inventory-countings.use-case';
import { UpdateInventoryCountingUseCase } from '../../application/use-cases/inventory-counting/update-inventory-counting.use-case';
import { DeleteInventoryCountingUseCase } from '../../application/use-cases/inventory-counting/delete-inventory-counting.use-case';
import { CompleteInventoryCountingUseCase } from '../../application/use-cases/inventory-counting/complete-inventory-counting.use-case';

@Controller('inventory-countings')
@UseGuards(JwtAuthGuard)
export class InventoryCountingController {
  constructor(
    private readonly createInventoryCountingUseCase: CreateInventoryCountingUseCase,
    private readonly getInventoryCountingUseCase: GetInventoryCountingUseCase,
    private readonly getAllInventoryCountingsUseCase: GetAllInventoryCountingsUseCase,
    private readonly updateInventoryCountingUseCase: UpdateInventoryCountingUseCase,
    private readonly deleteInventoryCountingUseCase: DeleteInventoryCountingUseCase,
    private readonly completeInventoryCountingUseCase: CompleteInventoryCountingUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateInventoryCountingDto, @Request() req): Promise<InventoryCountingResponseDto> {
    const userId = req.user.id;
    return await this.createInventoryCountingUseCase.execute(dto, userId);
  }

  @Get()
  async findAll(): Promise<InventoryCountingResponseDto[]> {
    return await this.getAllInventoryCountingsUseCase.execute();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<InventoryCountingResponseDto> {
    return await this.getInventoryCountingUseCase.execute(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInventoryCountingDto,
    @Request() req,
  ): Promise<InventoryCountingResponseDto> {
    const userId = req.user.id;
    return await this.updateInventoryCountingUseCase.execute(id, dto, userId);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.deleteInventoryCountingUseCase.execute(id);
  }

  @Patch(':id/complete')
  async complete(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { reviewedBy: string },
    @Request() req,
  ): Promise<InventoryCountingResponseDto> {
    const userId = req.user.id;
    return await this.completeInventoryCountingUseCase.execute(id, body.reviewedBy, userId);
  }
}
