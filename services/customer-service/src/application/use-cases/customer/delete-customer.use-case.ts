import { Injectable } from '@nestjs/common';
import { TypeOrmCustomerRepository } from '../../../infrastructure/database/repositories/customer.repository';

@Injectable()
export class DeleteCustomerUseCase {
  constructor(
    private readonly customerRepository: TypeOrmCustomerRepository
  ) {}

  async execute(id: string): Promise<void> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new Error('Customer not found');
    }

    await this.customerRepository.delete(id);
  }
}
