import { Injectable } from '@nestjs/common';
import { GoodsIssueRepository } from '../../../infrastructure/database/repositories/goods-issue.repository';
import { GoodsIssue } from '../../../domain/entities/goods-issue.entity';

@Injectable()
export class GetGoodsIssueUseCase {
  constructor(
    private readonly goodsIssueRepository: GoodsIssueRepository,
  ) {}

  async execute(id: number): Promise<GoodsIssue | null> {
    return await this.goodsIssueRepository.findById(id);
  }
}
