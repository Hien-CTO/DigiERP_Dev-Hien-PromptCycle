import { SalesOrderItem } from '../entities/sales-order-item.entity';

export interface SalesOrderItemRepository {
  findById(id: number): Promise<SalesOrderItem | null>;
  findByOrderId(orderId: number): Promise<SalesOrderItem[]>;
  findByProductId(productId: number): Promise<SalesOrderItem[]>;
  save(item: SalesOrderItem): Promise<SalesOrderItem>;
  update(id: number, item: Partial<SalesOrderItem>): Promise<SalesOrderItem>;
  delete(id: number): Promise<void>;
  deleteByOrderId(orderId: number): Promise<void>;
}
