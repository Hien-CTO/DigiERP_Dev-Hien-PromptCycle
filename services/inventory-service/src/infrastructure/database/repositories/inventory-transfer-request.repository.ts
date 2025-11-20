import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IInventoryTransferRequestRepository } from '../../../domain/repositories/inventory-transfer-request.repository.interface';
import { InventoryTransferRequest } from '../../../domain/entities/inventory-transfer-request.entity';
import { InventoryTransferRequest as InventoryTransferRequestEntity } from '../entities/inventory-transfer-request.entity';

@Injectable()
export class InventoryTransferRequestRepository implements IInventoryTransferRequestRepository {
  constructor(
    @InjectRepository(InventoryTransferRequestEntity)
    private readonly repository: Repository<InventoryTransferRequestEntity>,
  ) {}

  async create(transferRequest: InventoryTransferRequest): Promise<InventoryTransferRequest> {
    const entity = this.repository.create(transferRequest);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: number): Promise<InventoryTransferRequest | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['items'],
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<InventoryTransferRequest[]> {
    const entities = await this.repository.find({
      relations: ['items'],
      order: { created_at: 'DESC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findByFromWarehouseId(warehouseId: number): Promise<InventoryTransferRequest[]> {
    const entities = await this.repository.find({
      where: { from_warehouse_id: warehouseId },
      relations: ['items'],
      order: { created_at: 'DESC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findByToWarehouseId(warehouseId: number): Promise<InventoryTransferRequest[]> {
    const entities = await this.repository.find({
      where: { to_warehouse_id: warehouseId },
      relations: ['items'],
      order: { created_at: 'DESC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findByStatus(status: string): Promise<InventoryTransferRequest[]> {
    const entities = await this.repository.find({
      where: { status },
      relations: ['items'],
      order: { created_at: 'DESC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async update(id: number, transferRequest: Partial<InventoryTransferRequest>): Promise<InventoryTransferRequest> {
    await this.repository.update(id, transferRequest);
    const updated = await this.repository.findOne({
      where: { id },
      relations: ['items'],
    });
    return this.toDomain(updated!);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async generateRequestNumber(): Promise<string> {
    const count = await this.repository.count();
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const sequence = String(count + 1).padStart(4, '0');
    return `TR${year}${month}${sequence}`;
  }

  private toDomain(entity: InventoryTransferRequestEntity): InventoryTransferRequest {
    return {
      id: entity.id,
      requestNumber: entity.request_number,
      fromWarehouseId: entity.from_warehouse_id,
      toWarehouseId: entity.to_warehouse_id,
      requestDate: entity.request_date,
      status: entity.status as any,
      requestedBy: entity.requested_by,
      approvedBy: entity.approved_by,
      reason: entity.reason,
      notes: entity.notes,
      items: entity.items?.map(item => ({
        id: item.id,
        transferRequestId: item.transfer_request_id,
        productId: item.product_id,
        productName: item.product_name,
        productSku: item.product_sku,
        quantity: item.quantity,
        unit: item.unit,
        notes: item.notes,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      })) || [],
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
      createdBy: entity.created_by,
      updatedBy: entity.updated_by,
    };
  }
}
