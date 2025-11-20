import { Injectable } from '@nestjs/common';
import { SalesOrderRepository } from '../../../infrastructure/database/repositories/sales-order.repository';
import { SalesOrder } from '../../../domain/entities/sales-order.entity';

@Injectable()
export class GetOrdersUseCase {
  constructor(
    private readonly salesOrderRepository: SalesOrderRepository,
  ) {}

  async execute(page: number = 1, limit: number = 10, search?: string): Promise<{ orders: SalesOrder[]; total: number }> {
    return await this.salesOrderRepository.findAll(page, limit, search);
  }
}
