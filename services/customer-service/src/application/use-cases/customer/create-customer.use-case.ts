import { Injectable } from '@nestjs/common';
import { TypeOrmCustomerRepository } from '../../../infrastructure/database/repositories/customer.repository';
import { TypeOrmCustomerGroupRepository } from '../../../infrastructure/database/repositories/customer-group.repository';
import { Customer } from '../../../domain/entities/customer.entity';
import { CreateCustomerDto } from '../../dtos/customer.dto';

@Injectable()
export class CreateCustomerUseCase {
  constructor(
    private readonly customerRepository: TypeOrmCustomerRepository,
    private readonly customerGroupRepository: TypeOrmCustomerGroupRepository,
  ) {}

  async execute(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    // Validate customer group exists
    let customerGroup = null;
    if (createCustomerDto.customerGroupId) {
      customerGroup = await this.customerGroupRepository.findById(createCustomerDto.customerGroupId);
      if (!customerGroup) {
        throw new Error('Customer group not found');
      }
    }

    // Business logic validation based on customer group type
    if (customerGroup?.isCompany) {
      // For company customers, tax_code is required
      if (!createCustomerDto.taxCode) {
        throw new Error('Tax code is required for company customers');
      }
      
      // Check if tax code already exists
      const existingCustomerByTaxCode = await this.customerRepository.findByTaxCode(createCustomerDto.taxCode);
      if (existingCustomerByTaxCode) {
        throw new Error('Customer with this tax code already exists');
      }
    }

    // Check if customer with same name already exists
    const existingCustomer = await this.customerRepository.findByName(createCustomerDto.name);
    if (existingCustomer) {
      throw new Error('Customer with this name already exists');
    }

    // Check if email already exists (if provided)
    if (createCustomerDto.email) {
      const existingCustomerByEmail = await this.customerRepository.findByEmail(createCustomerDto.email);
      if (existingCustomerByEmail) {
        throw new Error('Customer with this email already exists');
      }
    }

    // Check if phone already exists (if provided)
    if (createCustomerDto.phone) {
      const existingCustomerByPhone = await this.customerRepository.findByPhone(createCustomerDto.phone);
      if (existingCustomerByPhone) {
        throw new Error('Customer with this phone already exists');
      }
    }

    const customer = Customer.create(
      createCustomerDto.name,
      createCustomerDto.phone,
      createCustomerDto.email,
      createCustomerDto.address,
      createCustomerDto.taxCode,
      createCustomerDto.contactPerson,
      createCustomerDto.paymentTerms,
      createCustomerDto.creditLimit || 0,
      createCustomerDto.notes,
      createCustomerDto.salesRep,
      createCustomerDto.customerGroupId,
    );

    // Add code if provided (will be auto-generated in repository if not provided)
    const customerWithCode = createCustomerDto.code 
      ? new Customer(
          customer.id,
          customer.name,
          customer.phone,
          customer.email,
          customer.address,
          customer.taxCode,
          customer.contactPerson,
          customer.paymentTerms,
          customer.creditLimit,
          customer.isActive,
          customer.notes,
          customer.salesRep,
          customer.customerGroupId,
          createCustomerDto.code,
          customer.createdAt,
          customer.updatedAt,
        )
      : customer;

    return await this.customerRepository.save(customerWithCode);
  }
}
