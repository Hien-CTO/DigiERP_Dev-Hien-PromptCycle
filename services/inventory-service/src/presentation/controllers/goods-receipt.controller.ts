import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/external/jwt-auth.guard';
import { CreateGoodsReceiptDto, UpdateGoodsReceiptDto, GoodsReceiptResponseDto } from '../../application/dtos/goods-receipt.dto';
import { CreateGoodsReceiptUseCase } from '../../application/use-cases/goods-receipt/create-goods-receipt.use-case';
import { GetGoodsReceiptUseCase } from '../../application/use-cases/goods-receipt/get-goods-receipt.use-case';
import { GetAllGoodsReceiptsUseCase } from '../../application/use-cases/goods-receipt/get-all-goods-receipts.use-case';
import { UpdateGoodsReceiptUseCase } from '../../application/use-cases/goods-receipt/update-goods-receipt.use-case';
import { DeleteGoodsReceiptUseCase } from '../../application/use-cases/goods-receipt/delete-goods-receipt.use-case';
import { VerifyGoodsReceiptUseCase } from '../../application/use-cases/goods-receipt/verify-goods-receipt.use-case';

@Controller('goods-receipts')
// @UseGuards(JwtAuthGuard)
export class GoodsReceiptController {
  constructor(
    private readonly createGoodsReceiptUseCase: CreateGoodsReceiptUseCase,
    private readonly getGoodsReceiptUseCase: GetGoodsReceiptUseCase,
    private readonly getAllGoodsReceiptsUseCase: GetAllGoodsReceiptsUseCase,
    private readonly updateGoodsReceiptUseCase: UpdateGoodsReceiptUseCase,
    private readonly deleteGoodsReceiptUseCase: DeleteGoodsReceiptUseCase,
    private readonly verifyGoodsReceiptUseCase: VerifyGoodsReceiptUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateGoodsReceiptDto, @Request() req): Promise<GoodsReceiptResponseDto> {
    const userId = req.user.id;
    return await this.createGoodsReceiptUseCase.execute(dto, userId);
  }

  @Get()
  async findAll(): Promise<GoodsReceiptResponseDto[]> {
    return await this.getAllGoodsReceiptsUseCase.execute();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<GoodsReceiptResponseDto> {
    return await this.getGoodsReceiptUseCase.execute(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGoodsReceiptDto,
    @Request() req,
  ): Promise<GoodsReceiptResponseDto> {
    const userId = req.user.id;
    return await this.updateGoodsReceiptUseCase.execute(id, dto, userId);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.deleteGoodsReceiptUseCase.execute(id);
  }

  @Patch(':id/verify')
  async verify(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { verifiedBy: string },
    @Request() req,
  ): Promise<GoodsReceiptResponseDto> {
    const userId = req.user.id;
    return await this.verifyGoodsReceiptUseCase.execute(id, body.verifiedBy, userId);
  }
}
