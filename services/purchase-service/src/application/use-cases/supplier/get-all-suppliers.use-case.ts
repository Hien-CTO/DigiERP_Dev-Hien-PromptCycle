import { Injectable } from '@nestjs/common';
import { TypeOrmSupplierRepository } from '../../../infrastructure/database/repositories/supplier.repository';
import { Supplier } from '../../../domain/entities/supplier.entity';
import { SupplierSearchParams } from '../../../domain/repositories/supplier.repository.interface';

@Injectable()
export class GetAllSuppliersUseCase {
  constructor(
    private readonly supplierRepository: TypeOrmSupplierRepository
  ) {}

  async execute(params: SupplierSearchParams): Promise<{ data: Supplier[]; total: number }> {
    return this.supplierRepository.search(params);
  }
}
