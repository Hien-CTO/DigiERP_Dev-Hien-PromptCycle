import { Injectable } from '@nestjs/common';
import { SalesOrderRepository } from '../../../infrastructure/database/repositories/sales-order.repository';
import { UpdateSalesOrderDto } from '../../dtos/sales-order.dto';
import { SalesOrder } from '../../../domain/entities/sales-order.entity';

@Injectable()
export class UpdateOrderUseCase {
  constructor(
    private readonly salesOrderRepository: SalesOrderRepository,
  ) {}

  async execute(id: number, updateOrderDto: UpdateSalesOrderDto, userId: number): Promise<SalesOrder> {
    // Check if order exists
    const existingOrder = await this.salesOrderRepository.findById(id);
    if (!existingOrder) {
      throw new Error('Order not found');
    }

    // Update order
    const updateData: any = {
      ...updateOrderDto,
      updatedBy: userId,
      updatedAt: new Date(),
    };
    
    // Convert orderDate string to Date if provided
    if (updateData.orderDate && typeof updateData.orderDate === 'string') {
      updateData.orderDate = new Date(updateData.orderDate);
    }
    
    return await this.salesOrderRepository.update(id, updateData);
  }
}
