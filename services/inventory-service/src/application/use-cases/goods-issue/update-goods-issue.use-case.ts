import { Injectable } from '@nestjs/common';
import { GoodsIssueRepository } from '../../../infrastructure/database/repositories/goods-issue.repository';
import { UpdateGoodsIssueDto } from '../../dtos/goods-issue.dto';
import { GoodsIssue } from '../../../domain/entities/goods-issue.entity';

@Injectable()
export class UpdateGoodsIssueUseCase {
  constructor(
    private readonly goodsIssueRepository: GoodsIssueRepository,
  ) {}

  async execute(id: number, dto: UpdateGoodsIssueDto, userId: number): Promise<GoodsIssue> {
    const updateData: any = {
      updatedBy: userId,
    };

    if (dto.warehouseId) updateData.warehouseId = dto.warehouseId;
    if (dto.issueDate) updateData.issueDate = new Date(dto.issueDate);
    if (dto.status) updateData.status = dto.status;
    if (dto.issuedBy) updateData.issuedBy = dto.issuedBy;
    if (dto.verifiedBy) updateData.verifiedBy = dto.verifiedBy;
    if (dto.notes) updateData.notes = dto.notes;

    if (dto.items) {
      updateData.items = dto.items.map(item => ({
        id: 0,
        goodsIssueId: id,
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
      }));
    }

    return await this.goodsIssueRepository.update(id, updateData);
  }
}
