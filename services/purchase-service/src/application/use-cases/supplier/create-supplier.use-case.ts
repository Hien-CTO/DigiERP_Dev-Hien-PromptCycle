import { Injectable } from '@nestjs/common';
import { TypeOrmSupplierRepository } from '../../../infrastructure/database/repositories/supplier.repository';
import { Supplier } from '../../../domain/entities/supplier.entity';
import { CreateSupplierDto } from '../../dtos/supplier.dto';
import {
  SupplierNameAlreadyExistsError,
  SupplierTaxCodeAlreadyExistsError,
} from '../../errors/supplier.errors';

@Injectable()
export class CreateSupplierUseCase {
  constructor(
    private readonly supplierRepository: TypeOrmSupplierRepository
  ) {}

  async execute(createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    // Check if supplier with same name already exists
    const existingSupplier = await this.supplierRepository.findByName(createSupplierDto.name);
    if (existingSupplier) {
      throw new SupplierNameAlreadyExistsError(createSupplierDto.name);
    }

    // Check if supplier with same tax code already exists (if provided)
    if (createSupplierDto.tax_code) {
      const existingTaxCode = await this.supplierRepository.findByTaxCode(createSupplierDto.tax_code);
      if (existingTaxCode) {
        throw new SupplierTaxCodeAlreadyExistsError(createSupplierDto.tax_code);
      }
    }

    const supplier = Supplier.create(
      createSupplierDto.name,
      createSupplierDto.contact_person,
      createSupplierDto.phone,
      createSupplierDto.email,
      createSupplierDto.address,
      createSupplierDto.tax_code,
      createSupplierDto.payment_terms,
      createSupplierDto.bank_name,
      createSupplierDto.bank_account_name,
      createSupplierDto.bank_account_number,
      createSupplierDto.credit_limit || 0,
      createSupplierDto.notes,
    );

    return await this.supplierRepository.save(supplier);
  }
}
