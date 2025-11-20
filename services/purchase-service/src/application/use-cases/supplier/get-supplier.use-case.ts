import { Injectable } from '@nestjs/common';
import { TypeOrmSupplierRepository } from '../../../infrastructure/database/repositories/supplier.repository';
import { Supplier } from '../../../domain/entities/supplier.entity';

@Injectable()
export class GetSupplierUseCase {
  constructor(
    private readonly supplierRepository: TypeOrmSupplierRepository
  ) {}

  async execute(id: string): Promise<Supplier | null> {
    return this.supplierRepository.findById(id);
  }
}
