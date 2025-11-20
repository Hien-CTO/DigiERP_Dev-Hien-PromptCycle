import { Injectable } from '@nestjs/common';
import { GoodsIssueRepository } from '../../../infrastructure/database/repositories/goods-issue.repository';

@Injectable()
export class DeleteGoodsIssueUseCase {
  constructor(
    private readonly goodsIssueRepository: GoodsIssueRepository,
  ) {}

  async execute(id: number): Promise<void> {
    await this.goodsIssueRepository.delete(id);
  }
}
