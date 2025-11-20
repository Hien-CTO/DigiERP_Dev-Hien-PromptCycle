import { Injectable } from '@nestjs/common';
import { TypeOrmPurchaseOrderRepository } from '../../../infrastructure/database/repositories/purchase-order.repository';

@Injectable()
export class DeletePurchaseOrderUseCase {
  constructor(
    private readonly purchaseOrderRepository: TypeOrmPurchaseOrderRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existingOrder = await this.purchaseOrderRepository.findById(id);
    if (!existingOrder) {
      throw new Error('Purchase order not found');
    }

    return await this.purchaseOrderRepository.delete(id);
  }
}
