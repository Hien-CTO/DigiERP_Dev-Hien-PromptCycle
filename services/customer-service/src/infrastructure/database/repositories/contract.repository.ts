import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Contract as ContractEntity } from '../entities/contract.entity';
import { ContractRepository } from '../../../domain/repositories/contract.repository.interface';
import { Contract } from '../../../domain/entities/contract.entity';

@Injectable()
export class TypeOrmContractRepository implements ContractRepository {
  constructor(
    @InjectRepository(ContractEntity)
    private readonly repository: Repository<ContractEntity>,
  ) {}

  async findAll(): Promise<Contract[]> {
    const entities = await this.repository.find({
      relations: ['customer'],
      order: { created_at: 'DESC' }
    });
    return entities.map(this.toDomain);
  }

  async findById(id: string): Promise<Contract | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['customer']
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByContractNumber(contractNumber: string): Promise<Contract | null> {
    const entity = await this.repository.findOne({
      where: { contract_number: contractNumber },
      relations: ['customer']
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByCustomer(customerId: string): Promise<Contract[]> {
    const entities = await this.repository.find({
      where: { customerId },
      relations: ['customer'],
      order: { created_at: 'DESC' }
    });
    return entities.map(this.toDomain);
  }

  async findActiveContracts(): Promise<Contract[]> {
    const now = new Date();
    const entities = await this.repository.find({
      where: {
        status: 'ACTIVE',
        start_date: LessThanOrEqual(now),
        end_date: MoreThanOrEqual(now)
      },
      relations: ['customer'],
      order: { end_date: 'ASC' }
    });
    return entities.map(this.toDomain);
  }

  async findExpiredContracts(): Promise<Contract[]> {
    const now = new Date();
    const entities = await this.repository.find({
      where: {
        end_date: LessThanOrEqual(now)
      },
      relations: ['customer'],
      order: { end_date: 'DESC' }
    });
    return entities.map(this.toDomain);
  }

  async findContractsByStatus(status: string): Promise<Contract[]> {
    const entities = await this.repository.find({
      where: { status },
      relations: ['customer'],
      order: { created_at: 'DESC' }
    });
    return entities.map(this.toDomain);
  }

  async findContractsExpiringInDays(days: number): Promise<Contract[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
    
    const entities = await this.repository
      .createQueryBuilder('contract')
      .leftJoinAndSelect('contract.customer', 'customer')
      .where('contract.status = :status', { status: 'ACTIVE' })
      .andWhere('contract.end_date <= :futureDate', { futureDate })
      .andWhere('contract.end_date >= :now', { now })
      .orderBy('contract.end_date', 'ASC')
      .getMany();
    return entities.map(this.toDomain);
  }

  async save(contract: Contract): Promise<Contract> {
    const entity = this.toEntity(contract);
    const savedEntity = await this.repository.save(entity);
    return this.toDomain(savedEntity);
  }

  async update(id: string, contract: Contract): Promise<Contract> {
    const entity = this.toEntity(contract);
    entity.id = id;
    const updatedEntity = await this.repository.save(entity);
    return this.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  private toDomain(entity: ContractEntity): Contract {
    return new Contract(
      entity.id,
      entity.contract_number,
      entity.title,
      entity.description,
      entity.start_date,
      entity.end_date,
      entity.contract_value,
      entity.status,
      entity.terms_conditions,
      entity.signed_by,
      entity.signed_date,
      entity.customerId,
      entity.created_at,
      entity.updated_at,
    );
  }

  private toEntity(contract: Contract): ContractEntity {
    const entity = new ContractEntity();
    entity.id = contract.id;
    entity.contract_number = contract.contractNumber;
    entity.title = contract.title;
    entity.description = contract.description;
    entity.start_date = contract.startDate;
    entity.end_date = contract.endDate;
    entity.contract_value = contract.contractValue;
    entity.status = contract.status;
    entity.terms_conditions = contract.termsConditions;
    entity.signed_by = contract.signedBy;
    entity.signed_date = contract.signedDate;
    entity.customerId = contract.customerId;
    return entity;
  }
}
