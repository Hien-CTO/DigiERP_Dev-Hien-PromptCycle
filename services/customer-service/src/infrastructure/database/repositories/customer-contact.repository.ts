import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerContact as CustomerContactEntity } from '../entities/customer-contact.entity';
import { CustomerContactRepository } from '../../../domain/repositories/customer-contact.repository.interface';
import { CustomerContact } from '../../../domain/entities/customer-contact.entity';

@Injectable()
export class TypeOrmCustomerContactRepository implements CustomerContactRepository {
  constructor(
    @InjectRepository(CustomerContactEntity)
    private readonly repository: Repository<CustomerContactEntity>,
  ) {}

  async findAll(): Promise<CustomerContact[]> {
    const entities = await this.repository.find({
      order: { isPrimary: 'DESC', createdAt: 'ASC' },
    });
    return entities.map(this.toDomain);
  }

  async findById(id: number): Promise<CustomerContact | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByCustomerId(customerId: string): Promise<CustomerContact[]> {
    const entities = await this.repository.find({
      where: { customerId },
      order: { isPrimary: 'DESC', createdAt: 'ASC' },
    });
    return entities.map(this.toDomain);
  }

  async findPrimaryByCustomerId(customerId: string): Promise<CustomerContact | null> {
    const entity = await this.repository.findOne({
      where: { customerId, isPrimary: true },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async save(contact: CustomerContact): Promise<CustomerContact> {
    const entity = this.toEntity(contact);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async update(id: number, contact: CustomerContact): Promise<CustomerContact> {
    const entity = this.toEntity(contact);
    await this.repository.update(id, entity);
    const updated = await this.repository.findOne({ where: { id } });
    if (!updated) {
      throw new Error(`CustomerContact with id ${id} not found`);
    }
    return this.toDomain(updated);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteByCustomerId(customerId: string): Promise<void> {
    await this.repository.delete({ customerId });
  }

  private toDomain(entity: CustomerContactEntity): CustomerContact {
    return new CustomerContact(
      entity.id,
      entity.customerId,
      entity.title,
      entity.contactPerson,
      entity.phone,
      entity.email,
      entity.department,
      entity.position,
      entity.notes,
      entity.isPrimary,
      entity.isActive,
      entity.createdAt,
      entity.updatedAt,
      entity.createdBy,
      entity.updatedBy,
    );
  }

  private toEntity(domain: CustomerContact): CustomerContactEntity {
    const entity = new CustomerContactEntity();
    if (domain.id > 0) {
      entity.id = domain.id;
    }
    entity.customerId = domain.customerId;
    entity.title = domain.title;
    entity.contactPerson = domain.contactPerson;
    entity.phone = domain.phone;
    entity.email = domain.email;
    entity.department = domain.department;
    entity.position = domain.position;
    entity.notes = domain.notes;
    entity.isPrimary = domain.isPrimary;
    entity.isActive = domain.isActive;
    entity.createdBy = domain.createdBy;
    entity.updatedBy = domain.updatedBy;
    return entity;
  }
}

