import { Injectable, NotFoundException } from '@nestjs/common';
import { TypeOrmCustomerContactRepository } from '../../../infrastructure/database/repositories/customer-contact.repository';

@Injectable()
export class DeleteCustomerContactUseCase {
  constructor(
    private readonly contactRepository: TypeOrmCustomerContactRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const contact = await this.contactRepository.findById(id);
    if (!contact) {
      throw new NotFoundException(`CustomerContact with id ${id} not found`);
    }
    await this.contactRepository.delete(id);
  }
}

