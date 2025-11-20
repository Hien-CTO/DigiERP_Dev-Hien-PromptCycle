import { Injectable, NotFoundException } from '@nestjs/common';
import { TypeOrmCustomerContactRepository } from '../../../infrastructure/database/repositories/customer-contact.repository';
import { TypeOrmCustomerRepository } from '../../../infrastructure/database/repositories/customer.repository';
import { CustomerContact } from '../../../domain/entities/customer-contact.entity';
import { CreateCustomerContactDto } from '../../dtos/customer-contact.dto';

@Injectable()
export class CreateCustomerContactUseCase {
  constructor(
    private readonly contactRepository: TypeOrmCustomerContactRepository,
    private readonly customerRepository: TypeOrmCustomerRepository,
  ) {}

  async execute(dto: CreateCustomerContactDto, userId?: number): Promise<CustomerContact> {
    // Verify customer exists
    const customer = await this.customerRepository.findById(dto.customerId);
    if (!customer) {
      throw new NotFoundException(`Customer with id ${dto.customerId} not found`);
    }

    // If this is set as primary, unset other primary contacts
    if (dto.isPrimary) {
      const existingPrimary = await this.contactRepository.findPrimaryByCustomerId(dto.customerId);
      if (existingPrimary) {
        const updated = existingPrimary.update(undefined, undefined, undefined, undefined, undefined, undefined, undefined, false);
        await this.contactRepository.update(existingPrimary.id, updated);
      }
    }

    const contact = CustomerContact.create(
      dto.customerId,
      dto.title,
      dto.contactPerson,
      dto.phone,
      dto.email,
      dto.department,
      dto.position,
      dto.notes,
      dto.isPrimary || false,
    );

    const saved = await this.contactRepository.save(contact);
    return saved;
  }
}

