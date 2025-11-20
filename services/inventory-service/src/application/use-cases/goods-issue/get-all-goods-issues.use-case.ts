import { Injectable } from '@nestjs/common';
import { GoodsIssueRepository } from '../../../infrastructure/database/repositories/goods-issue.repository';
import { GoodsIssue } from '../../../domain/entities/goods-issue.entity';

@Injectable()
export class GetAllGoodsIssuesUseCase {
  constructor(
    private readonly goodsIssueRepository: GoodsIssueRepository,
  ) {}

  async execute(): Promise<GoodsIssue[]> {
    return await this.goodsIssueRepository.findAll();
  }
}
