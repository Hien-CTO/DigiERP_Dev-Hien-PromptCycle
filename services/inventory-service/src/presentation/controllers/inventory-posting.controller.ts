import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/external/jwt-auth.guard';
import { CreateInventoryPostingDto, UpdateInventoryPostingDto, InventoryPostingResponseDto } from '../../application/dtos/inventory-posting.dto';
import { CreateInventoryPostingUseCase } from '../../application/use-cases/inventory-posting/create-inventory-posting.use-case';
import { GetInventoryPostingUseCase } from '../../application/use-cases/inventory-posting/get-inventory-posting.use-case';
import { GetAllInventoryPostingsUseCase } from '../../application/use-cases/inventory-posting/get-all-inventory-postings.use-case';
import { UpdateInventoryPostingUseCase } from '../../application/use-cases/inventory-posting/update-inventory-posting.use-case';
import { DeleteInventoryPostingUseCase } from '../../application/use-cases/inventory-posting/delete-inventory-posting.use-case';
import { PostInventoryPostingUseCase } from '../../application/use-cases/inventory-posting/post-inventory-posting.use-case';

@Controller('inventory-postings')
@UseGuards(JwtAuthGuard)
export class InventoryPostingController {
  constructor(
    private readonly createInventoryPostingUseCase: CreateInventoryPostingUseCase,
    private readonly getInventoryPostingUseCase: GetInventoryPostingUseCase,
    private readonly getAllInventoryPostingsUseCase: GetAllInventoryPostingsUseCase,
    private readonly updateInventoryPostingUseCase: UpdateInventoryPostingUseCase,
    private readonly deleteInventoryPostingUseCase: DeleteInventoryPostingUseCase,
    private readonly postInventoryPostingUseCase: PostInventoryPostingUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateInventoryPostingDto, @Request() req): Promise<InventoryPostingResponseDto> {
    const userId = req.user.id;
    return await this.createInventoryPostingUseCase.execute(dto, userId);
  }

  @Get()
  async findAll(): Promise<InventoryPostingResponseDto[]> {
    return await this.getAllInventoryPostingsUseCase.execute();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<InventoryPostingResponseDto> {
    return await this.getInventoryPostingUseCase.execute(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInventoryPostingDto,
    @Request() req,
  ): Promise<InventoryPostingResponseDto> {
    const userId = req.user.id;
    return await this.updateInventoryPostingUseCase.execute(id, dto, userId);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.deleteInventoryPostingUseCase.execute(id);
  }

  @Patch(':id/post')
  async post(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ): Promise<InventoryPostingResponseDto> {
    const userId = req.user.id;
    return await this.postInventoryPostingUseCase.execute(id, userId);
  }
}
