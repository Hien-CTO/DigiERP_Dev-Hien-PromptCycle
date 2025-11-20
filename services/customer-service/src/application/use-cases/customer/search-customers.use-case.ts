import { Injectable } from '@nestjs/common';
import { TypeOrmCustomerRepository } from '../../../infrastructure/database/repositories/customer.repository';
import { Customer } from '../../../domain/entities/customer.entity';

@Injectable()
export class SearchCustomersUseCase {
  constructor(
    private readonly customerRepository: TypeOrmCustomerRepository
  ) {}

  async execute(query: string): Promise<Customer[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }
    
    return this.customerRepository.searchCustomers(query.trim());
  }
}
