import { Injectable } from '@nestjs/common';
import { PurchaseOrderRepository } from '../../domain/repositories/purchase-order.repository.interface';
import { CreatePurchaseOrderUseCase } from '../../application/use-cases/purchase-order/create-purchase-order.use-case';
import { GetPurchaseOrderUseCase } from '../../application/use-cases/purchase-order/get-purchase-order.use-case';
import { UpdatePurchaseOrderUseCase } from '../../application/use-cases/purchase-order/update-purchase-order.use-case';
import { DeletePurchaseOrderUseCase } from '../../application/use-cases/purchase-order/delete-purchase-order.use-case';
import { GetAllPurchaseOrdersUseCase } from '../../application/use-cases/purchase-order/get-all-purchase-orders.use-case';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto, PurchaseOrderResponseDto } from '../../application/dtos/purchase-order.dto';

@Injectable()
export class PurchaseOrderService {
  constructor(
    private readonly createPurchaseOrderUseCase: CreatePurchaseOrderUseCase,
    private readonly getPurchaseOrderUseCase: GetPurchaseOrderUseCase,
    private readonly updatePurchaseOrderUseCase: UpdatePurchaseOrderUseCase,
    private readonly deletePurchaseOrderUseCase: DeletePurchaseOrderUseCase,
    private readonly getAllPurchaseOrdersUseCase: GetAllPurchaseOrdersUseCase,
  ) {}

  async create(dto: CreatePurchaseOrderDto, userId: number): Promise<PurchaseOrderResponseDto> {
    return await this.createPurchaseOrderUseCase.execute(dto, userId);
  }

  async findAll(page: number = 1, limit: number = 10, search?: string): Promise<PurchaseOrderResponseDto[]> {
    return await this.getAllPurchaseOrdersUseCase.execute(page, limit, search);
  }

  async findOne(id: string): Promise<PurchaseOrderResponseDto> {
    return await this.getPurchaseOrderUseCase.execute(id);
  }

  async update(id: string, dto: UpdatePurchaseOrderDto, userId: number): Promise<PurchaseOrderResponseDto> {
    return await this.updatePurchaseOrderUseCase.execute(id, dto, userId);
  }

  async remove(id: string): Promise<void> {
    return await this.deletePurchaseOrderUseCase.execute(id);
  }
}
