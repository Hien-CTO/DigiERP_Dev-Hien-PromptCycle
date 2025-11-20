import { Injectable } from '@nestjs/common';
import { TypeOrmSupplierRepository } from '../../../infrastructure/database/repositories/supplier.repository';
import { Supplier } from '../../../domain/entities/supplier.entity';

@Injectable()
export class GetActiveSuppliersUseCase {
  constructor(
    private readonly supplierRepository: TypeOrmSupplierRepository
  ) {}

  async execute(): Promise<Supplier[]> {
    return this.supplierRepository.findActiveSuppliers();
  }
}
