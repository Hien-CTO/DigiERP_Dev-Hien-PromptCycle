import { Injectable } from '@nestjs/common';
import { GoodsReceiptRepository } from '../../../infrastructure/database/repositories/goods-receipt.repository';
import { CreateGoodsReceiptDto } from '../../dtos/goods-receipt.dto';
import { GoodsReceipt, GoodsReceiptStatus } from '../../../domain/entities/goods-receipt.entity';

@Injectable()
export class CreateGoodsReceiptUseCase {
  constructor(
    private readonly goodsReceiptRepository: GoodsReceiptRepository,
  ) {}

  async execute(dto: CreateGoodsReceiptDto, userId: number): Promise<GoodsReceipt> {
    const receiptNumber = await this.goodsReceiptRepository.generateReceiptNumber();
    
    const totalAmount = dto.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitCost);
    }, 0);

    const goodsReceipt: Partial<GoodsReceipt> = {
      receiptNumber,
      purchaseOrderId: dto.purchaseOrderId,
      warehouseId: dto.warehouseId,
      receiptDate: new Date(dto.receiptDate),
      status: GoodsReceiptStatus.DRAFT,
      receivedBy: dto.receivedBy,
      notes: dto.notes,
      items: dto.items.map(item => ({
        id: 0,
        goodsReceiptId: 0,
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

    return await this.goodsReceiptRepository.create(goodsReceipt as GoodsReceipt);
  }
}
