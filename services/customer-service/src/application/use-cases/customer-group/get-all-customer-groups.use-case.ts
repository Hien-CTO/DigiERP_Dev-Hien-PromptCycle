import { Injectable } from '@nestjs/common';
import { TypeOrmCustomerGroupRepository } from '../../../infrastructure/database/repositories/customer-group.repository';
import { CustomerGroup } from '../../../domain/entities/customer-group.entity';

@Injectable()
export class GetAllCustomerGroupsUseCase {
  constructor(
    private readonly customerGroupRepository: TypeOrmCustomerGroupRepository
  ) {}

  async execute(): Promise<CustomerGroup[]> {
    return this.customerGroupRepository.findAll();
  }
}
