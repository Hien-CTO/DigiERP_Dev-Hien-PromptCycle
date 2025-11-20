import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/external/jwt-auth.guard';
import { CreateInventoryTransferDto, UpdateInventoryTransferDto, InventoryTransferResponseDto } from '../../application/dtos/inventory-transfer.dto';
import { CreateInventoryTransferUseCase } from '../../application/use-cases/inventory-transfer/create-inventory-transfer.use-case';
import { GetInventoryTransferUseCase } from '../../application/use-cases/inventory-transfer/get-inventory-transfer.use-case';
import { GetAllInventoryTransfersUseCase } from '../../application/use-cases/inventory-transfer/get-all-inventory-transfers.use-case';
import { UpdateInventoryTransferUseCase } from '../../application/use-cases/inventory-transfer/update-inventory-transfer.use-case';
import { DeleteInventoryTransferUseCase } from '../../application/use-cases/inventory-transfer/delete-inventory-transfer.use-case';
import { CompleteInventoryTransferUseCase } from '../../application/use-cases/inventory-transfer/complete-inventory-transfer.use-case';

@Controller('inventory-transfers')
@UseGuards(JwtAuthGuard)
export class InventoryTransferController {
  constructor(
    private readonly createInventoryTransferUseCase: CreateInventoryTransferUseCase,
    private readonly getInventoryTransferUseCase: GetInventoryTransferUseCase,
    private readonly getAllInventoryTransfersUseCase: GetAllInventoryTransfersUseCase,
    private readonly updateInventoryTransferUseCase: UpdateInventoryTransferUseCase,
    private readonly deleteInventoryTransferUseCase: DeleteInventoryTransferUseCase,
    private readonly completeInventoryTransferUseCase: CompleteInventoryTransferUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateInventoryTransferDto, @Request() req): Promise<InventoryTransferResponseDto> {
    const userId = req.user.id;
    return await this.createInventoryTransferUseCase.execute(dto, userId);
  }

  @Get()
  async findAll(): Promise<InventoryTransferResponseDto[]> {
    return await this.getAllInventoryTransfersUseCase.execute();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<InventoryTransferResponseDto> {
    return await this.getInventoryTransferUseCase.execute(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInventoryTransferDto,
    @Request() req,
  ): Promise<InventoryTransferResponseDto> {
    const userId = req.user.id;
    return await this.updateInventoryTransferUseCase.execute(id, dto, userId);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.deleteInventoryTransferUseCase.execute(id);
  }

  @Patch(':id/complete')
  async complete(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { receivedBy: string },
    @Request() req,
  ): Promise<InventoryTransferResponseDto> {
    const userId = req.user.id;
    return await this.completeInventoryTransferUseCase.execute(id, body.receivedBy, userId);
  }
}
