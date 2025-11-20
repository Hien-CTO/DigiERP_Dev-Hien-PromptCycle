import { Injectable } from '@nestjs/common';
import { WarehouseRepository } from '../../../infrastructure/database/repositories/warehouse.repository';
import { UpdateWarehouseDto } from '../../dtos/warehouse.dto';
import { Warehouse } from '../../../domain/entities/warehouse.entity';

@Injectable()
export class UpdateWarehouseUseCase {
  constructor(private readonly warehouseRepository: WarehouseRepository) {}

  async execute(
    id: number,
    updateWarehouseDto: UpdateWarehouseDto,
    userId: number,
  ): Promise<Warehouse> {
    // Check if warehouse exists
    const existingWarehouse = await this.warehouseRepository.findById(id);
    if (!existingWarehouse) {
      throw new Error('Warehouse not found');
    }

    // Check if new code already exists (if code is being updated)
    if (updateWarehouseDto.code && updateWarehouseDto.code !== existingWarehouse.code) {
      const warehouseWithCode = await this.warehouseRepository.findByCode(updateWarehouseDto.code);
      if (warehouseWithCode) {
        throw new Error('Warehouse code already exists');
      }
    }

    const updatedWarehouse = await this.warehouseRepository.update(id, {
      ...updateWarehouseDto,
      updatedBy: userId,
      updatedAt: new Date(),
    });

    return updatedWarehouse;
  }
}
