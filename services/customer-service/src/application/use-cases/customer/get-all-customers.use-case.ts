import { Injectable } from '@nestjs/common';
import { TypeOrmCustomerRepository } from '../../../infrastructure/database/repositories/customer.repository';
import { Customer } from '../../../domain/entities/customer.entity';

@Injectable()
export class GetAllCustomersUseCase {
  constructor(
    private readonly customerRepository: TypeOrmCustomerRepository
  ) {}

  async execute(): Promise<Customer[]> {
    return this.customerRepository.findAll();
  }
}
