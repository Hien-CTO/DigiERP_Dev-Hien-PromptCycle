import { Injectable, NotFoundException } from '@nestjs/common';
import { TypeOrmCustomerContactRepository } from '../../../infrastructure/database/repositories/customer-contact.repository';
import { CustomerContact } from '../../../domain/entities/customer-contact.entity';

@Injectable()
export class GetCustomerContactUseCase {
  constructor(
    private readonly contactRepository: TypeOrmCustomerContactRepository,
  ) {}

  async execute(id: number): Promise<CustomerContact> {
    const contact = await this.contactRepository.findById(id);
    if (!contact) {
      throw new NotFoundException(`CustomerContact with id ${id} not found`);
    }
    return contact;
  }
}

