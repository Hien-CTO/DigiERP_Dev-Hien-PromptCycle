import { Injectable } from '@nestjs/common';
import { TypeOrmCustomerGroupRepository } from '../../../infrastructure/database/repositories/customer-group.repository';
import { CustomerGroup } from '../../../domain/entities/customer-group.entity';
import { CreateCustomerGroupDto } from '../../dtos/customer-group.dto';

@Injectable()
export class CreateCustomerGroupUseCase {
  constructor(
    private readonly customerGroupRepository: TypeOrmCustomerGroupRepository
  ) {}

  async execute(createCustomerGroupDto: CreateCustomerGroupDto): Promise<CustomerGroup> {
    // Check if customer group with same name already exists
    const existingGroup = await this.customerGroupRepository.findByName(createCustomerGroupDto.name);
    if (existingGroup) {
      throw new Error('Customer group with this name already exists');
    }

    const customerGroup = CustomerGroup.create(
      createCustomerGroupDto.name,
      createCustomerGroupDto.description,
      createCustomerGroupDto.isCompany || false,
      createCustomerGroupDto.color,
      createCustomerGroupDto.sortOrder || 0,
    );

    return await this.customerGroupRepository.save(customerGroup);
  }
}
