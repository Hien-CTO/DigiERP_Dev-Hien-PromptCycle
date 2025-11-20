import { Injectable } from '@nestjs/common';
import { TypeOrmCustomerContactRepository } from '../../../infrastructure/database/repositories/customer-contact.repository';
import { CustomerContact } from '../../../domain/entities/customer-contact.entity';

@Injectable()
export class GetCustomerContactsUseCase {
  constructor(
    private readonly contactRepository: TypeOrmCustomerContactRepository,
  ) {}

  async execute(customerId: string): Promise<CustomerContact[]> {
    return await this.contactRepository.findByCustomerId(customerId);
  }
}

