import { Injectable } from '@nestjs/common';
import { GoodsReceiptRepository } from '../../../infrastructure/database/repositories/goods-receipt.repository';
import { GoodsReceipt } from '../../../domain/entities/goods-receipt.entity';

@Injectable()
export class GetAllGoodsReceiptsUseCase {
  constructor(
    private readonly goodsReceiptRepository: GoodsReceiptRepository,
  ) {}

  async execute(): Promise<GoodsReceipt[]> {
    return await this.goodsReceiptRepository.findAll();
  }
}
