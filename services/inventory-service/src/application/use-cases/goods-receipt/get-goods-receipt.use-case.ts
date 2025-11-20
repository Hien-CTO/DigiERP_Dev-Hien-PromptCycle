import { Injectable } from '@nestjs/common';
import { GoodsReceiptRepository } from '../../../infrastructure/database/repositories/goods-receipt.repository';
import { GoodsReceipt } from '../../../domain/entities/goods-receipt.entity';

@Injectable()
export class GetGoodsReceiptUseCase {
  constructor(
    private readonly goodsReceiptRepository: GoodsReceiptRepository,
  ) {}

  async execute(id: number): Promise<GoodsReceipt | null> {
    return await this.goodsReceiptRepository.findById(id);
  }
}
