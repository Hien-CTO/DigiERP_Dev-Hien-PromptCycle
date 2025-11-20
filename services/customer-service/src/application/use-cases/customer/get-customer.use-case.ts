import { Injectable } from '@nestjs/common';
import { TypeOrmCustomerRepository } from '../../../infrastructure/database/repositories/customer.repository';
import { Customer } from '../../../domain/entities/customer.entity';

@Injectable()
export class GetCustomerUseCase {
  constructor(
    private readonly customerRepository: TypeOrmCustomerRepository
  ) {}

  async execute(id: string): Promise<Customer | null> {
    return this.customerRepository.findById(id);
  }
}
