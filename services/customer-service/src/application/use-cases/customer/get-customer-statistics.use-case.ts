import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer as CustomerEntity } from '../../../infrastructure/database/entities/customer.entity';
import { CustomerGroup as CustomerGroupEntity } from '../../../infrastructure/database/entities/customer-group.entity';

export interface CustomerStatisticsResult {
  totalCustomers: number;
  activeCustomers: number;
  companyCustomers: number;
  companyCustomersActive: number;
  individualCustomers: number;
  individualCustomersActive: number;
  totalGroups: number;
}

@Injectable()
export class GetCustomerStatisticsUseCase {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
    @InjectRepository(CustomerGroupEntity)
    private readonly customerGroupRepository: Repository<CustomerGroupEntity>,
  ) {}

  async execute(): Promise<CustomerStatisticsResult> {
    // Total customers
    const totalCustomers = await this.customerRepository.count();
    
    // Active customers
    const activeCustomers = await this.customerRepository.count({
      where: { isActive: true },
    });

    // Company customers (total)
    const companyCustomersTotal = await this.customerRepository
      .createQueryBuilder('customer')
      .leftJoin('customer.customerGroup', 'group')
      .where('group.isCompany = :isCompany', { isCompany: true })
      .getCount();

    // Company customers (active)
    const companyCustomersActive = await this.customerRepository
      .createQueryBuilder('customer')
      .leftJoin('customer.customerGroup', 'group')
      .where('group.isCompany = :isCompany', { isCompany: true })
      .andWhere('customer.isActive = :isActive', { isActive: true })
      .getCount();

    // Individual customers (total) - customers with isCompany=false or no group
    const individualCustomersTotal = await this.customerRepository
      .createQueryBuilder('customer')
      .leftJoin('customer.customerGroup', 'group')
      .where('(group.isCompany = :isCompany OR customer.customerGroupId IS NULL)', { isCompany: false })
      .getCount();

    // Individual customers (active) - active customers with isCompany=false or no group
    const individualCustomersActive = await this.customerRepository
      .createQueryBuilder('customer')
      .leftJoin('customer.customerGroup', 'group')
      .where('customer.isActive = :isActive', { isActive: true })
      .andWhere('(group.isCompany = :isCompany OR customer.customerGroupId IS NULL)', { isCompany: false })
      .getCount();

    // Total customer groups
    const totalGroups = await this.customerGroupRepository.count({
      where: { is_active: true },
    });

    return {
      totalCustomers,
      activeCustomers,
      companyCustomers: companyCustomersTotal,
      companyCustomersActive,
      individualCustomers: individualCustomersTotal,
      individualCustomersActive,
      totalGroups,
    };
  }
}

