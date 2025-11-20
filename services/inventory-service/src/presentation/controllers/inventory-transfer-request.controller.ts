import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/external/jwt-auth.guard';
import { CreateTransferRequestDto, UpdateTransferRequestDto, TransferRequestResponseDto } from '../../application/dtos/inventory-transfer-request.dto';
import { CreateTransferRequestUseCase } from '../../application/use-cases/inventory-transfer-request/create-transfer-request.use-case';
import { GetTransferRequestUseCase } from '../../application/use-cases/inventory-transfer-request/get-transfer-request.use-case';
import { GetAllTransferRequestsUseCase } from '../../application/use-cases/inventory-transfer-request/get-all-transfer-requests.use-case';
import { UpdateTransferRequestUseCase } from '../../application/use-cases/inventory-transfer-request/update-transfer-request.use-case';
import { DeleteTransferRequestUseCase } from '../../application/use-cases/inventory-transfer-request/delete-transfer-request.use-case';
import { ApproveTransferRequestUseCase } from '../../application/use-cases/inventory-transfer-request/approve-transfer-request.use-case';
import { RejectTransferRequestUseCase } from '../../application/use-cases/inventory-transfer-request/reject-transfer-request.use-case';

@Controller('inventory-transfer-requests')
@UseGuards(JwtAuthGuard)
export class InventoryTransferRequestController {
  constructor(
    private readonly createTransferRequestUseCase: CreateTransferRequestUseCase,
    private readonly getTransferRequestUseCase: GetTransferRequestUseCase,
    private readonly getAllTransferRequestsUseCase: GetAllTransferRequestsUseCase,
    private readonly updateTransferRequestUseCase: UpdateTransferRequestUseCase,
    private readonly deleteTransferRequestUseCase: DeleteTransferRequestUseCase,
    private readonly approveTransferRequestUseCase: ApproveTransferRequestUseCase,
    private readonly rejectTransferRequestUseCase: RejectTransferRequestUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateTransferRequestDto, @Request() req): Promise<TransferRequestResponseDto> {
    const userId = req.user.id;
    return await this.createTransferRequestUseCase.execute(dto, userId);
  }

  @Get()
  async findAll(): Promise<TransferRequestResponseDto[]> {
    return await this.getAllTransferRequestsUseCase.execute();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<TransferRequestResponseDto> {
    return await this.getTransferRequestUseCase.execute(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTransferRequestDto,
    @Request() req,
  ): Promise<TransferRequestResponseDto> {
    const userId = req.user.id;
    return await this.updateTransferRequestUseCase.execute(id, dto, userId);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.deleteTransferRequestUseCase.execute(id);
  }

  @Patch(':id/approve')
  async approve(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { approvedBy: string },
    @Request() req,
  ): Promise<TransferRequestResponseDto> {
    const userId = req.user.id;
    return await this.approveTransferRequestUseCase.execute(id, body.approvedBy, userId);
  }

  @Patch(':id/reject')
  async reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { approvedBy: string },
    @Request() req,
  ): Promise<TransferRequestResponseDto> {
    const userId = req.user.id;
    return await this.rejectTransferRequestUseCase.execute(id, body.approvedBy, userId);
  }
}
