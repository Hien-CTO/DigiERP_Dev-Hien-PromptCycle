import { Injectable } from '@nestjs/common';
import { GoodsIssueRepository } from '../../../infrastructure/database/repositories/goods-issue.repository';
import { CreateGoodsIssueDto } from '../../dtos/goods-issue.dto';
import { GoodsIssue, GoodsIssueStatus } from '../../../domain/entities/goods-issue.entity';

@Injectable()
export class CreateGoodsIssueUseCase {
  constructor(
    private readonly goodsIssueRepository: GoodsIssueRepository,
  ) {}

  async execute(dto: CreateGoodsIssueDto, userId: number): Promise<GoodsIssue> {
    const issueNumber = await this.goodsIssueRepository.generateIssueNumber();
    
    const totalAmount = dto.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitCost);
    }, 0);

    const goodsIssue: Partial<GoodsIssue> = {
      issueNumber,
      salesOrderId: dto.salesOrderId,
      warehouseId: dto.warehouseId,
      issueDate: new Date(dto.issueDate),
      status: GoodsIssueStatus.DRAFT,
      issuedBy: dto.issuedBy,
      notes: dto.notes,
      items: dto.items.map(item => ({
        id: 0,
        goodsIssueId: 0,
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku,
        quantity: item.quantity,
        unit: item.unit,
        unitCost: item.unitCost,
        totalAmount: item.quantity * item.unitCost,
        notes: item.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      createdBy: userId,
      updatedBy: userId,
    };

    return await this.goodsIssueRepository.create(goodsIssue as GoodsIssue);
  }
}
