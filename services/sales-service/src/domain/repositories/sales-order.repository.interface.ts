import { SalesOrder } from '../entities/sales-order.entity';

export interface SalesOrderRepository {
  findById(id: number): Promise<SalesOrder | null>;
  findByOrderNumber(orderNumber: string): Promise<SalesOrder | null>;
  findAll(page?: number, limit?: number, search?: string): Promise<{ orders: SalesOrder[]; total: number }>;
  findByCustomerId(customerId: number): Promise<SalesOrder[]>;
  findByStatus(status: string): Promise<SalesOrder[]>;
  save(order: SalesOrder): Promise<SalesOrder>;
  update(id: number, order: Partial<SalesOrder>): Promise<SalesOrder>;
  delete(id: number): Promise<void>;
}
