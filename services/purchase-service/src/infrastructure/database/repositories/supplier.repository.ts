import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { Supplier as SupplierEntity } from '../entities/supplier.entity';
import { SupplierRepository, SupplierSearchParams } from '../../../domain/repositories/supplier.repository.interface';
import { Supplier } from '../../../domain/entities/supplier.entity';

@Injectable()
export class TypeOrmSupplierRepository implements SupplierRepository {
  constructor(
    @InjectRepository(SupplierEntity)
    private readonly repository: Repository<SupplierEntity>,
  ) {}

  async findAll(): Promise<Supplier[]> {
    const entities = await this.repository.find();
    return entities.map(this.toDomain);
  }

  async findById(id: string): Promise<Supplier | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByName(name: string): Promise<Supplier | null> {
    const entity = await this.repository.findOne({ where: { name } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByTaxCode(taxCode: string): Promise<Supplier | null> {
    const entity = await this.repository.findOne({ where: { tax_code: taxCode } });
    return entity ? this.toDomain(entity) : null;
  }

  async search(params: SupplierSearchParams): Promise<{ data: Supplier[]; total: number }> {
    const { page, limit, search, isActive } = params;

    const where: FindOptionsWhere<SupplierEntity>[] = [];

    if (search) {
      const like = ILike(`%${search}%`);
      where.push({ name: like });
      where.push({ contact_person: like });
      where.push({ email: like });
      where.push({ phone: like });
      where.push({ tax_code: like });
    }

    let baseWhere: FindOptionsWhere<SupplierEntity> | FindOptionsWhere<SupplierEntity>[] | undefined;

    if (where.length > 0) {
      baseWhere = where.map(condition => ({
        ...condition,
        ...(typeof isActive === 'boolean' ? { is_active: isActive } : {}),
      }));
    } else if (typeof isActive === 'boolean') {
      baseWhere = { is_active: isActive };
    }

    const [entities, total] = await this.repository.findAndCount({
      where: baseWhere,
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: entities.map(this.toDomain),
      total,
    };
  }

  async save(supplier: Supplier): Promise<Supplier> {
    const entity = this.toEntity(supplier);
    const savedEntity = await this.repository.save(entity);
    return this.toDomain(savedEntity);
  }

  async update(id: string, supplier: Supplier): Promise<Supplier> {
    const entity = this.toEntity(supplier);
    entity.id = id;
    const updatedEntity = await this.repository.save(entity);
    return this.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findActiveSuppliers(): Promise<Supplier[]> {
    const entities = await this.repository.find({ where: { is_active: true } });
    return entities.map(this.toDomain);
  }

  private toDomain(entity: SupplierEntity): Supplier {
    return new Supplier(
      entity.id,
      entity.name,
      entity.contact_person,
      entity.phone,
      entity.email,
      entity.address,
      entity.tax_code,
      entity.payment_terms,
      entity.bank_name,
      entity.bank_account_name,
      entity.bank_account_number,
      Number(entity.credit_limit),
      Boolean(entity.is_active),
      entity.notes,
      entity.created_at,
      entity.updated_at,
    );
  }

  private toEntity(supplier: Supplier): SupplierEntity {
    const entity = new SupplierEntity();
    if (supplier.id) {
      entity.id = supplier.id;
    }
    entity.name = supplier.name;
    entity.contact_person = supplier.contactPerson;
    entity.phone = supplier.phone;
    entity.email = supplier.email;
    entity.address = supplier.address;
    entity.tax_code = supplier.taxCode;
    entity.payment_terms = supplier.paymentTerms;
    entity.bank_name = supplier.bankName;
    entity.bank_account_name = supplier.bankAccountName;
    entity.bank_account_number = supplier.bankAccountNumber;
    entity.credit_limit = supplier.creditLimit;
    entity.is_active = supplier.isActive;
    entity.notes = supplier.notes;
    return entity;
  }
}
