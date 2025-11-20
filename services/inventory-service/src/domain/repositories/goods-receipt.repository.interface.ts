import { GoodsReceipt } from '../entities/goods-receipt.entity';

export interface IGoodsReceiptRepository {
  create(goodsReceipt: GoodsReceipt): Promise<GoodsReceipt>;
  findById(id: number): Promise<GoodsReceipt | null>;
  findAll(): Promise<GoodsReceipt[]>;
  findByWarehouseId(warehouseId: number): Promise<GoodsReceipt[]>;
  findByStatus(status: string): Promise<GoodsReceipt[]>;
  findByPurchaseOrderId(purchaseOrderId: number): Promise<GoodsReceipt[]>;
  update(id: number, goodsReceipt: Partial<GoodsReceipt>): Promise<GoodsReceipt>;
  delete(id: number): Promise<void>;
  generateReceiptNumber(): Promise<string>;
}
