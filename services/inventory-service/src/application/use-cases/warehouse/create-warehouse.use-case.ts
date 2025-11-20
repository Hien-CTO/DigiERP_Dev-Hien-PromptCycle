import { Injectable } from '@nestjs/common';
import { WarehouseRepository } from '../../../infrastructure/database/repositories/warehouse.repository';
import { CreateWarehouseDto } from '../../dtos/warehouse.dto';
import { Warehouse } from '../../../domain/entities/warehouse.entity';

@Injectable()
export class CreateWarehouseUseCase {
  constructor(private readonly warehouseRepository: WarehouseRepository) {}

  async execute(createWarehouseDto: CreateWarehouseDto, userId: number): Promise<Warehouse> {
    // Check if warehouse code already exists
    const existingWarehouse = await this.warehouseRepository.findByCode(createWarehouseDto.code);
    if (existingWarehouse) {
      throw new Error('Warehouse code already exists');
    }

    const warehouse = await this.warehouseRepository.create({
      ...createWarehouseDto,
      createdBy: userId,
      updatedBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return warehouse;
  }
}
