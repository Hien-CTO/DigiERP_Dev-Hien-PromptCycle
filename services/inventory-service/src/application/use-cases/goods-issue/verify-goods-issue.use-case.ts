import { Injectable } from '@nestjs/common';
import { GoodsIssueRepository } from '../../../infrastructure/database/repositories/goods-issue.repository';
import { GoodsIssue, GoodsIssueStatus } from '../../../domain/entities/goods-issue.entity';

@Injectable()
export class VerifyGoodsIssueUseCase {
  constructor(
    private readonly goodsIssueRepository: GoodsIssueRepository,
  ) {}

  async execute(id: number, verifiedBy: string, userId: number): Promise<GoodsIssue> {
    const updateData: Partial<GoodsIssue> = {
      status: GoodsIssueStatus.VERIFIED,
      verifiedBy,
      updatedBy: userId,
    };

    return await this.goodsIssueRepository.update(id, updateData);
  }
}
