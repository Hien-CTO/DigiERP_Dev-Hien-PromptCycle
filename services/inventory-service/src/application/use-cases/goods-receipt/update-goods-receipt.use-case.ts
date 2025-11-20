import { Injectable } from '@nestjs/common';
import { GoodsReceiptRepository } from '../../../infrastructure/database/repositories/goods-receipt.repository';
import { UpdateGoodsReceiptDto } from '../../dtos/goods-receipt.dto';
import { GoodsReceipt } from '../../../domain/entities/goods-receipt.entity';

@Injectable()
export class UpdateGoodsReceiptUseCase {
  constructor(
    private readonly goodsReceiptRepository: GoodsReceiptRepository,
  ) {}

  async execute(id: number, dto: UpdateGoodsReceiptDto, userId: number): Promise<GoodsReceipt> {
    const updateData: any = {
      updatedBy: userId,
    };

    if (dto.warehouseId) updateData.warehouseId = dto.warehouseId;
    if (dto.receiptDate) updateData.receiptDate = new Date(dto.receiptDate);
    if (dto.status) updateData.status = dto.status;
    if (dto.receivedBy) updateData.receivedBy = dto.receivedBy;
    if (dto.verifiedBy) updateData.verifiedBy = dto.verifiedBy;
    if (dto.notes) updateData.notes = dto.notes;

    if (dto.items) {
      updateData.items = dto.items.map(item => ({
        id: 0,
        goodsReceiptId: id,
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

    return await this.goodsReceiptRepository.update(id, updateData);
  }
}
