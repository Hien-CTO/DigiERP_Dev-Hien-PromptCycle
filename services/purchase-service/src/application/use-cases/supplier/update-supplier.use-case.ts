import { Injectable } from '@nestjs/common';
import { TypeOrmSupplierRepository } from '../../../infrastructure/database/repositories/supplier.repository';
import { Supplier } from '../../../domain/entities/supplier.entity';
import { UpdateSupplierDto } from '../../dtos/supplier.dto';
import {
  SupplierNameAlreadyExistsError,
  SupplierNotFoundError,
  SupplierTaxCodeAlreadyExistsError,
} from '../../errors/supplier.errors';

@Injectable()
export class UpdateSupplierUseCase {
  constructor(
    private readonly supplierRepository: TypeOrmSupplierRepository
  ) {}

  async execute(id: string, updateData: UpdateSupplierDto): Promise<Supplier> {
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) {
      throw new SupplierNotFoundError(id);
    }

    if (updateData.name && updateData.name !== supplier.name) {
      const existingWithName = await this.supplierRepository.findByName(updateData.name);
      if (existingWithName && existingWithName.id !== supplier.id) {
        throw new SupplierNameAlreadyExistsError(updateData.name);
      }
    }

    if (updateData.tax_code && updateData.tax_code !== supplier.taxCode) {
      const existingWithTaxCode = await this.supplierRepository.findByTaxCode(updateData.tax_code);
      if (existingWithTaxCode && existingWithTaxCode.id !== supplier.id) {
        throw new SupplierTaxCodeAlreadyExistsError(updateData.tax_code);
      }
    }

    const updatedSupplier = supplier.update(
      updateData.name,
      updateData.contact_person,
      updateData.phone,
      updateData.email,
      updateData.address,
      updateData.tax_code,
      updateData.payment_terms,
      updateData.bank_name,
      updateData.bank_account_name,
      updateData.bank_account_number,
      updateData.credit_limit,
      updateData.is_active,
      updateData.notes,
    );

    return this.supplierRepository.save(updatedSupplier);
  }
}
