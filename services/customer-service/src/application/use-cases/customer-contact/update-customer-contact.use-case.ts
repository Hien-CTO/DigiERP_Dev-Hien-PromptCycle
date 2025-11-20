import { Injectable, NotFoundException } from '@nestjs/common';
import { TypeOrmCustomerContactRepository } from '../../../infrastructure/database/repositories/customer-contact.repository';
import { CustomerContact } from '../../../domain/entities/customer-contact.entity';
import { UpdateCustomerContactDto } from '../../dtos/customer-contact.dto';

@Injectable()
export class UpdateCustomerContactUseCase {
  constructor(
    private readonly contactRepository: TypeOrmCustomerContactRepository,
  ) {}

  async execute(id: number, dto: UpdateCustomerContactDto, userId?: number): Promise<CustomerContact> {
    const existing = await this.contactRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`CustomerContact with id ${id} not found`);
    }

    // If setting as primary, unset other primary contacts
    if (dto.isPrimary === true && !existing.isPrimary) {
      const existingPrimary = await this.contactRepository.findPrimaryByCustomerId(existing.customerId);
      if (existingPrimary && existingPrimary.id !== id) {
        const updated = existingPrimary.update(undefined, undefined, undefined, undefined, undefined, undefined, undefined, false);
        await this.contactRepository.update(existingPrimary.id, updated);
      }
    }

    const updated = existing.update(
      dto.title,
      dto.contactPerson,
      dto.phone,
      dto.email,
      dto.department,
      dto.position,
      dto.notes,
      dto.isPrimary,
      dto.isActive,
    );

    return await this.contactRepository.update(id, updated);
  }
}

