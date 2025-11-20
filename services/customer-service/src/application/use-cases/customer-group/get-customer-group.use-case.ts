import { Injectable } from '@nestjs/common';
import { TypeOrmCustomerGroupRepository } from '../../../infrastructure/database/repositories/customer-group.repository';
import { CustomerGroup } from '../../../domain/entities/customer-group.entity';

@Injectable()
export class GetCustomerGroupUseCase {
  constructor(
    private readonly customerGroupRepository: TypeOrmCustomerGroupRepository
  ) {}

  async execute(id: string): Promise<CustomerGroup | null> {
    return this.customerGroupRepository.findById(id);
  }
}
