import { Injectable } from '@nestjs/common';
import { GoodsReceiptRepository } from '../../../infrastructure/database/repositories/goods-receipt.repository';
import { GoodsReceipt, GoodsReceiptStatus } from '../../../domain/entities/goods-receipt.entity';

@Injectable()
export class VerifyGoodsReceiptUseCase {
  constructor(
    private readonly goodsReceiptRepository: GoodsReceiptRepository,
  ) {}

  async execute(id: number, verifiedBy: string, userId: number): Promise<GoodsReceipt> {
    const updateData: Partial<GoodsReceipt> = {
      status: GoodsReceiptStatus.VERIFIED,
      verifiedBy,
      updatedBy: userId,
    };

    return await this.goodsReceiptRepository.update(id, updateData);
  }
}
