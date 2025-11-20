import { Injectable } from '@nestjs/common';
import { SalesOrderRepository } from '../../../infrastructure/database/repositories/sales-order.repository';

@Injectable()
export class DeleteOrderUseCase {
  constructor(
    private readonly salesOrderRepository: SalesOrderRepository,
  ) {}

  async execute(id: number): Promise<void> {
    // Check if order exists
    const existingOrder = await this.salesOrderRepository.findById(id);
    if (!existingOrder) {
      throw new Error('Order not found');
    }

    // Delete order
    await this.salesOrderRepository.delete(id);
  }
}
