import { Injectable } from '@nestjs/common';
import { TypeOrmCustomerGroupRepository } from '../../../infrastructure/database/repositories/customer-group.repository';
import { CustomerGroup } from '../../../domain/entities/customer-group.entity';
import { UpdateCustomerGroupDto } from '../../dtos/customer-group.dto';

@Injectable()
export class UpdateCustomerGroupUseCase {
  constructor(
    private readonly customerGroupRepository: TypeOrmCustomerGroupRepository
  ) {}

  async execute(id: string, updateData: UpdateCustomerGroupDto): Promise<CustomerGroup> {
    const customerGroup = await this.customerGroupRepository.findById(id);
    if (!customerGroup) {
      throw new Error('Customer group not found');
    }

    // Check if name is being changed and if new name already exists
    if (updateData.name && updateData.name !== customerGroup.name) {
      const existingGroup = await this.customerGroupRepository.findByName(updateData.name);
      if (existingGroup) {
        throw new Error('Customer group with this name already exists');
      }
    }

    const updatedCustomerGroup = customerGroup.update(
      updateData.name,
      updateData.description,
      updateData.isActive,
      updateData.isCompany,
      updateData.color,
      updateData.sortOrder,
    );

    return await this.customerGroupRepository.update(id, updatedCustomerGroup);
  }
}
