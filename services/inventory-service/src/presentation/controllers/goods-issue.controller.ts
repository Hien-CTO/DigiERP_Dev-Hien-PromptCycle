import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/external/jwt-auth.guard';
import { CreateGoodsIssueDto, UpdateGoodsIssueDto, GoodsIssueResponseDto } from '../../application/dtos/goods-issue.dto';
import { CreateGoodsIssueUseCase } from '../../application/use-cases/goods-issue/create-goods-issue.use-case';
import { GetGoodsIssueUseCase } from '../../application/use-cases/goods-issue/get-goods-issue.use-case';
import { GetAllGoodsIssuesUseCase } from '../../application/use-cases/goods-issue/get-all-goods-issues.use-case';
import { UpdateGoodsIssueUseCase } from '../../application/use-cases/goods-issue/update-goods-issue.use-case';
import { DeleteGoodsIssueUseCase } from '../../application/use-cases/goods-issue/delete-goods-issue.use-case';
import { VerifyGoodsIssueUseCase } from '../../application/use-cases/goods-issue/verify-goods-issue.use-case';

@Controller('goods-issues')
@UseGuards(JwtAuthGuard)
export class GoodsIssueController {
  constructor(
    private readonly createGoodsIssueUseCase: CreateGoodsIssueUseCase,
    private readonly getGoodsIssueUseCase: GetGoodsIssueUseCase,
    private readonly getAllGoodsIssuesUseCase: GetAllGoodsIssuesUseCase,
    private readonly updateGoodsIssueUseCase: UpdateGoodsIssueUseCase,
    private readonly deleteGoodsIssueUseCase: DeleteGoodsIssueUseCase,
    private readonly verifyGoodsIssueUseCase: VerifyGoodsIssueUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateGoodsIssueDto, @Request() req): Promise<GoodsIssueResponseDto> {
    const userId = req.user.id;
    return await this.createGoodsIssueUseCase.execute(dto, userId);
  }

  @Get()
  async findAll(): Promise<GoodsIssueResponseDto[]> {
    return await this.getAllGoodsIssuesUseCase.execute();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<GoodsIssueResponseDto> {
    return await this.getGoodsIssueUseCase.execute(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGoodsIssueDto,
    @Request() req,
  ): Promise<GoodsIssueResponseDto> {
    const userId = req.user.id;
    return await this.updateGoodsIssueUseCase.execute(id, dto, userId);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.deleteGoodsIssueUseCase.execute(id);
  }

  @Patch(':id/verify')
  async verify(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { verifiedBy: string },
    @Request() req,
  ): Promise<GoodsIssueResponseDto> {
    const userId = req.user.id;
    return await this.verifyGoodsIssueUseCase.execute(id, body.verifiedBy, userId);
  }
}
