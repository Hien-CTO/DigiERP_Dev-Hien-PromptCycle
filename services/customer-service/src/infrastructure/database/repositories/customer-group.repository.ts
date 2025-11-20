import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerGroup as CustomerGroupEntity } from '../entities/customer-group.entity';
import { CustomerGroupRepository } from '../../../domain/repositories/customer-group.repository.interface';
import { CustomerGroup } from '../../../domain/entities/customer-group.entity';

@Injectable()
export class TypeOrmCustomerGroupRepository implements CustomerGroupRepository {
  constructor(
    @InjectRepository(CustomerGroupEntity)
    private readonly repository: Repository<CustomerGroupEntity>,
  ) {}

  async findAll(): Promise<CustomerGroup[]> {
    const entities = await this.repository.find({
      order: { sort_order: 'ASC', name: 'ASC' }
    });
    return entities.map(this.toDomain);
  }

  async findById(id: string): Promise<CustomerGroup | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByName(name: string): Promise<CustomerGroup | null> {
    const entity = await this.repository.findOne({ where: { name } });
    return entity ? this.toDomain(entity) : null;
  }

  async findActiveGroups(): Promise<CustomerGroup[]> {
    const entities = await this.repository.find({
      where: { is_active: true },
      order: { sort_order: 'ASC', name: 'ASC' }
    });
    return entities.map(this.toDomain);
  }

  async findCompanyGroups(): Promise<CustomerGroup[]> {
    const entities = await this.repository.find({
      where: { isCompany: true, is_active: true },
      order: { sort_order: 'ASC', name: 'ASC' }
    });
    return entities.map(this.toDomain);
  }

  async findRetailGroups(): Promise<CustomerGroup[]> {
    const entities = await this.repository.find({
      where: { isCompany: false, is_active: true },
      order: { sort_order: 'ASC', name: 'ASC' }
    });
    return entities.map(this.toDomain);
  }

  async save(customerGroup: CustomerGroup): Promise<CustomerGroup> {
    const entity = this.toEntity(customerGroup);
    const savedEntity = await this.repository.save(entity);
    return this.toDomain(savedEntity);
  }

  async update(id: string, customerGroup: CustomerGroup): Promise<CustomerGroup> {
    const entity = this.toEntity(customerGroup);
    entity.id = id;
    const updatedEntity = await this.repository.save(entity);
    return this.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  private toDomain(entity: CustomerGroupEntity): CustomerGroup {
    return new CustomerGroup(
      entity.id,
      entity.name,
      entity.description,
      entity.is_active,
      entity.isCompany,
      entity.color,
      entity.sort_order,
      entity.created_at,
      entity.updated_at,
    );
  }

  private toEntity(customerGroup: CustomerGroup): CustomerGroupEntity {
    const entity = new CustomerGroupEntity();
    entity.id = customerGroup.id;
    entity.name = customerGroup.name;
    entity.description = customerGroup.description;
    entity.is_active = customerGroup.isActive;
    entity.isCompany = customerGroup.isCompany;
    entity.color = customerGroup.color;
    entity.sort_order = customerGroup.sortOrder;
    return entity;
  }
}
