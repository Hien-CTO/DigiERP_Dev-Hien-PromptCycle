import { Injectable } from '@nestjs/common';
import { SalesOrderRepository } from '../../../infrastructure/database/repositories/sales-order.repository';
import { SalesOrder } from '../../../domain/entities/sales-order.entity';

@Injectable()
export class GetOrderUseCase {
  constructor(
    private readonly salesOrderRepository: SalesOrderRepository,
  ) {}

  async execute(id: number): Promise<SalesOrder> {
    const order = await this.salesOrderRepository.findById(id);
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  }
}
