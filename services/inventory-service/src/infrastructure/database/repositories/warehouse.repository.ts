import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Warehouse as WarehouseEntity } from '../entities/warehouse.entity';
import { WarehouseRepository as IWarehouseRepository } from '../../../domain/repositories/warehouse.repository.interface';
import { Warehouse } from '../../../domain/entities/warehouse.entity';

@Injectable()
export class WarehouseRepository implements IWarehouseRepository {
  constructor(
    @InjectRepository(WarehouseEntity)
    private readonly warehouseRepo: Repository<WarehouseEntity>,
  ) {}

  async findById(id: number): Promise<Warehouse | null> {
    const warehouse = await this.warehouseRepo.findOne({ where: { id } });
    return warehouse ? this.toDomain(warehouse) : null;
  }

  async findAll(page: number = 1, limit: number = 10, search?: string): Promise<{ warehouses: Warehouse[]; total: number }> {
    const queryBuilder = this.warehouseRepo.createQueryBuilder('warehouse');

    if (search) {
      queryBuilder.where(
        '(warehouse.name LIKE :search OR warehouse.code LIKE :search OR warehouse.ward LIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [warehouses, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('warehouse.created_at', 'DESC')
      .getManyAndCount();

    return {
      warehouses: warehouses.map(warehouse => this.toDomain(warehouse)),
      total,
    };
  }

  async findByCode(code: string): Promise<Warehouse | null> {
    const warehouse = await this.warehouseRepo.findOne({ where: { code } });
    return warehouse ? this.toDomain(warehouse) : null;
  }

  async create(warehouse: Partial<Warehouse>): Promise<Warehouse> {
    // Map from domain entity (camelCase) to database entity (snake_case)
    const entityData: any = {
      name: warehouse.name,
      code: warehouse.code,
      description: warehouse.description,
      address: warehouse.address,
      ward: warehouse.ward,
      state: warehouse.state,
      country: warehouse.country,
      postal_code: warehouse.postalCode,
      phone: warehouse.phone,
      email: warehouse.email,
      manager_id: warehouse.managerId,
      tenant_id: warehouse.tenantId,
      status_id: warehouse.status ? this.statusToNumber(warehouse.status) : 1,
      capacity: warehouse.capacity,
      notes: warehouse.notes,
      created_by: warehouse.createdBy,
      updated_by: warehouse.updatedBy,
      created_at: warehouse.createdAt || new Date(),
      updated_at: warehouse.updatedAt || new Date(),
    };
    
    const newWarehouse = this.warehouseRepo.create(entityData);
    const savedWarehouse = await this.warehouseRepo.save(newWarehouse);
    // save() can return array if saving multiple entities, so we need to handle that
    const warehouseEntity = Array.isArray(savedWarehouse) ? savedWarehouse[0] : savedWarehouse;
    return this.toDomain(warehouseEntity);
  }

  async update(id: number, warehouse: Partial<Warehouse>): Promise<Warehouse> {
    // Map from domain entity (camelCase) to database entity (snake_case)
    const entityData: any = {};
    
    if (warehouse.name !== undefined) entityData.name = warehouse.name;
    if (warehouse.code !== undefined) entityData.code = warehouse.code;
    if (warehouse.description !== undefined) entityData.description = warehouse.description;
    if (warehouse.address !== undefined) entityData.address = warehouse.address;
    if (warehouse.ward !== undefined) entityData.ward = warehouse.ward;
    if (warehouse.state !== undefined) entityData.state = warehouse.state;
    if (warehouse.country !== undefined) entityData.country = warehouse.country;
    if (warehouse.postalCode !== undefined) entityData.postal_code = warehouse.postalCode;
    if (warehouse.phone !== undefined) entityData.phone = warehouse.phone;
    if (warehouse.email !== undefined) entityData.email = warehouse.email;
    if (warehouse.managerId !== undefined) entityData.manager_id = warehouse.managerId;
    if (warehouse.tenantId !== undefined) entityData.tenant_id = warehouse.tenantId;
    if (warehouse.status !== undefined) entityData.status_id = this.statusToNumber(warehouse.status);
    if (warehouse.capacity !== undefined) entityData.capacity = warehouse.capacity;
    if (warehouse.notes !== undefined) entityData.notes = warehouse.notes;
    if (warehouse.updatedBy !== undefined) entityData.updated_by = warehouse.updatedBy;
    if (warehouse.updatedAt !== undefined) entityData.updated_at = warehouse.updatedAt;
    
    await this.warehouseRepo.update(id, entityData);
    const updatedWarehouse = await this.warehouseRepo.findOne({ where: { id } });
    return this.toDomain(updatedWarehouse!);
  }

  async delete(id: number): Promise<void> {
    await this.warehouseRepo.delete(id);
  }

  async findByStatus(status: string): Promise<Warehouse[]> {
    const warehouses = await this.warehouseRepo.find({ where: { status_id: this.statusToNumber(status) } });
    return warehouses.map(warehouse => this.toDomain(warehouse));
  }

  private toDomain(warehouse: WarehouseEntity): Warehouse {
    return {
      id: warehouse.id,
      name: warehouse.name,
      code: warehouse.code,
      description: warehouse.description,
      address: warehouse.address,
      ward: warehouse.ward,
      state: warehouse.state,
      country: warehouse.country,
      postalCode: warehouse.postal_code,
      phone: warehouse.phone,
      email: warehouse.email,
      managerId: warehouse.manager_id,
      tenantId: warehouse.tenant_id,
      status: this.numberToStatus(warehouse.status_id),
      capacity: warehouse.capacity,
      currentUtilization: Number(warehouse.current_utilization),
      notes: warehouse.notes,
      createdAt: warehouse.created_at,
      updatedAt: warehouse.updated_at,
      createdBy: warehouse.created_by,
      updatedBy: warehouse.updated_by,
    };
  }

  private numberToStatus(statusId: number): any {
    const statusMap: Record<number, any> = {
      1: 'ACTIVE',
      2: 'INACTIVE',
      3: 'MAINTENANCE',
      4: 'CLOSED',
    };
    return statusMap[statusId] || 'ACTIVE';
  }

  private statusToNumber(status: string): number {
    const statusMap: Record<string, number> = {
      'ACTIVE': 1,
      'INACTIVE': 2,
      'MAINTENANCE': 3,
      'CLOSED': 4,
    };
    return statusMap[status] || 1;
  }
}
