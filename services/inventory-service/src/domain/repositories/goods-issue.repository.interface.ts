import { GoodsIssue } from '../entities/goods-issue.entity';

export interface IGoodsIssueRepository {
  create(goodsIssue: GoodsIssue): Promise<GoodsIssue>;
  findById(id: number): Promise<GoodsIssue | null>;
  findAll(): Promise<GoodsIssue[]>;
  findByWarehouseId(warehouseId: number): Promise<GoodsIssue[]>;
  findByStatus(status: string): Promise<GoodsIssue[]>;
  findBySalesOrderId(salesOrderId: number): Promise<GoodsIssue[]>;
  update(id: number, goodsIssue: Partial<GoodsIssue>): Promise<GoodsIssue>;
  delete(id: number): Promise<void>;
  generateIssueNumber(): Promise<string>;
}
