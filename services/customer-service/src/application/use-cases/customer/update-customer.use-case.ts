import { Injectable } from '@nestjs/common';
import { TypeOrmCustomerRepository } from '../../../infrastructure/database/repositories/customer.repository';
import { TypeOrmCustomerGroupRepository } from '../../../infrastructure/database/repositories/customer-group.repository';
import { Customer } from '../../../domain/entities/customer.entity';
import { UpdateCustomerDto } from '../../dtos/customer.dto';

@Injectable()
export class UpdateCustomerUseCase {
  constructor(
    private readonly customerRepository: TypeOrmCustomerRepository,
    private readonly customerGroupRepository: TypeOrmCustomerGroupRepository,
  ) {}

  async execute(id: string, updateData: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Validate customer group exists if being updated
    let customerGroup = null;
    if (updateData.customerGroupId) {
      customerGroup = await this.customerGroupRepository.findById(updateData.customerGroupId);
      if (!customerGroup) {
        throw new Error('Customer group not found');
      }
    } else if (customer.customerGroupId) {
      customerGroup = await this.customerGroupRepository.findById(customer.customerGroupId);
    }

    // Business logic validation based on customer group type
    if (customerGroup?.isCompany) {
      // For company customers, tax_code is required
      const taxCode = updateData.taxCode ?? customer.taxCode;
      if (!taxCode) {
        throw new Error('Tax code is required for company customers');
      }
      
      // Check if tax code already exists (excluding current customer)
      if (updateData.taxCode && updateData.taxCode !== customer.taxCode) {
        const existingCustomerByTaxCode = await this.customerRepository.findByTaxCode(updateData.taxCode);
        if (existingCustomerByTaxCode && existingCustomerByTaxCode.id !== id) {
          throw new Error('Customer with this tax code already exists');
        }
      }
    }

    // Check if name already exists (excluding current customer)
    if (updateData.name && updateData.name !== customer.name) {
      const existingCustomer = await this.customerRepository.findByName(updateData.name);
      if (existingCustomer && existingCustomer.id !== id) {
        throw new Error('Customer with this name already exists');
      }
    }

    // Check if email already exists (excluding current customer)
    if (updateData.email && updateData.email !== customer.email) {
      const existingCustomerByEmail = await this.customerRepository.findByEmail(updateData.email);
      if (existingCustomerByEmail && existingCustomerByEmail.id !== id) {
        throw new Error('Customer with this email already exists');
      }
    }

    // Check if phone already exists (excluding current customer)
    if (updateData.phone && updateData.phone !== customer.phone) {
      const existingCustomerByPhone = await this.customerRepository.findByPhone(updateData.phone);
      if (existingCustomerByPhone && existingCustomerByPhone.id !== id) {
        throw new Error('Customer with this phone already exists');
      }
    }

    const updatedCustomer = customer.update(
      updateData.name,
      updateData.phone,
      updateData.email,
      updateData.address,
      updateData.taxCode,
      updateData.contactPerson,
      updateData.paymentTerms,
      updateData.creditLimit,
      updateData.isActive,
      updateData.notes,
      updateData.salesRep,
      updateData.customerGroupId,
    );

    return await this.customerRepository.update(id, updatedCustomer);
  }
}
