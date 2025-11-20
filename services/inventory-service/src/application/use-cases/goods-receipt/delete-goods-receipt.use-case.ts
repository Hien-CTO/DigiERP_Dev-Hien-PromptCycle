import { Injectable } from '@nestjs/common';
import { GoodsReceiptRepository } from '../../../infrastructure/database/repositories/goods-receipt.repository';

@Injectable()
export class DeleteGoodsReceiptUseCase {
  constructor(
    private readonly goodsReceiptRepository: GoodsReceiptRepository,
  ) {}

  async execute(id: number): Promise<void> {
    await this.goodsReceiptRepository.delete(id);
  }
}
