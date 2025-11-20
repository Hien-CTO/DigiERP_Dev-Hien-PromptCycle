import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Customer as CustomerEntity } from '../entities/customer.entity';
import { CustomerRepository } from '../../../domain/repositories/customer.repository.interface';
import { Customer } from '../../../domain/entities/customer.entity';

@Injectable()
export class TypeOrmCustomerRepository implements CustomerRepository {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly repository: Repository<CustomerEntity>,
  ) {}

  async findAll(): Promise<Customer[]> {
    const entities = await this.repository.find({
      relations: ['customerGroup'],
      order: { name: 'ASC' }
    });
    return entities.map(this.toDomain);
  }

  async findById(id: string): Promise<Customer | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['customerGroup']
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByName(name: string): Promise<Customer | null> {
    const entity = await this.repository.findOne({
      where: { name },
      relations: ['customerGroup']
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const entity = await this.repository.findOne({
      where: { email },
      relations: ['customerGroup']
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByPhone(phone: string): Promise<Customer | null> {
    const entity = await this.repository.findOne({
      where: { phone },
      relations: ['customerGroup']
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByTaxCode(taxCode: string): Promise<Customer | null> {
    const entity = await this.repository.findOne({
      where: { taxCode },
      relations: ['customerGroup']
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByCustomerGroup(customerGroupId: string): Promise<Customer[]> {
    const entities = await this.repository.find({
      where: { customerGroupId },
      relations: ['customerGroup'],
      order: { name: 'ASC' }
    });
    return entities.map(this.toDomain);
  }

  async findActiveCustomers(): Promise<Customer[]> {
    const entities = await this.repository.find({
      where: { isActive: true },
      relations: ['customerGroup'],
      order: { name: 'ASC' }
    });
    return entities.map(this.toDomain);
  }

  async findCompanyCustomers(): Promise<Customer[]> {
    const entities = await this.repository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.customerGroup', 'group')
      .where('group.isCompany = :isCompany', { isCompany: true })
      .andWhere('customer.isActive = :isActive', { isActive: true })
      .orderBy('customer.name', 'ASC')
      .getMany();
    return entities.map(this.toDomain);
  }

  async findRetailCustomers(): Promise<Customer[]> {
    const entities = await this.repository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.customerGroup', 'group')
      .where('group.isCompany = :isCompany', { isCompany: false })
      .andWhere('customer.isActive = :isActive', { isActive: true })
      .orderBy('customer.name', 'ASC')
      .getMany();
    return entities.map(this.toDomain);
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    const entities = await this.repository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.customerGroup', 'group')
      .where('customer.name LIKE :query', { query: `%${query}%` })
      .orWhere('customer.phone LIKE :query', { query: `%${query}%` })
      .orWhere('customer.email LIKE :query', { query: `%${query}%` })
      .orWhere('customer.taxCode LIKE :query', { query: `%${query}%` })
      .orderBy('customer.name', 'ASC')
      .getMany();
    return entities.map(this.toDomain);
  }

  async count(): Promise<number> {
    return await this.repository.count();
  }

  async getMaxCodeNumber(): Promise<number> {
    // Get all customers with code starting with CUST
    const customers = await this.repository
      .createQueryBuilder('customer')
      .select('customer.code', 'code')
      .where('customer.code IS NOT NULL')
      .andWhere('customer.code LIKE :pattern', { pattern: 'CUST%' })
      .getRawMany();
    
    // Extract numbers from codes (CUST0000001 -> 1, CUST0000123 -> 123)
    const codeNumbers = customers
      .map(c => {
        const code = c.code;
        if (code && code.startsWith('CUST') && code.length > 4) {
          const numberPart = code.substring(4);
          const num = parseInt(numberPart, 10);
          return isNaN(num) ? 0 : num;
        }
        return 0;
      })
      .filter(n => n > 0);
    
    return codeNumbers.length > 0 ? Math.max(...codeNumbers) : 0;
  }

  async save(customer: Customer): Promise<Customer> {
    const entity = this.toEntity(customer);
    
    // Auto-generate code if not provided
    if (!entity.code) {
      const maxCodeNumber = await this.getMaxCodeNumber();
      const nextCodeNumber = maxCodeNumber + 1;
      entity.code = `CUST${String(nextCodeNumber).padStart(7, '0')}`;
    }
    
    const savedEntity = await this.repository.save(entity);
    return this.toDomain(savedEntity);
  }

  async update(id: string, customer: Customer): Promise<Customer> {
    const entity = this.toEntity(customer);
    entity.id = id;
    const updatedEntity = await this.repository.save(entity);
    return this.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  private toDomain(entity: CustomerEntity): Customer {
    return new Customer(
      entity.id,
      entity.name,
      entity.phone,
      entity.email,
      entity.address,
      entity.taxCode,
      entity.contactPerson,
      entity.paymentTerms,
      entity.creditLimit,
      entity.isActive,
      entity.notes,
      entity.salesRep,
      entity.customerGroupId,
      entity.code,
      entity.created_at,
      entity.updated_at,
    );
  }

  private toEntity(customer: Customer): CustomerEntity {
    const entity = new CustomerEntity();
    // Only set id if it's a valid UUID (not empty string), otherwise let TypeORM generate it
    if (customer.id && customer.id.trim() !== '') {
      entity.id = customer.id;
    }
    entity.code = (customer as any).code; // Access code property if exists
    entity.name = customer.name;
    entity.phone = customer.phone;
    entity.email = customer.email;
    entity.address = customer.address;
    entity.taxCode = customer.taxCode;
    entity.contactPerson = customer.contactPerson;
    entity.paymentTerms = customer.paymentTerms;
    entity.creditLimit = customer.creditLimit;
    entity.isActive = customer.isActive;
    entity.notes = customer.notes;
    entity.salesRep = customer.salesRep;
    entity.customerGroupId = customer.customerGroupId;
    return entity;
  }
}
