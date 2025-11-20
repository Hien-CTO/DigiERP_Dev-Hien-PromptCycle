import { Injectable } from '@nestjs/common';
import { TypeOrmCustomerGroupRepository } from '../../../infrastructure/database/repositories/customer-group.repository';

@Injectable()
export class DeleteCustomerGroupUseCase {
  constructor(
    private readonly customerGroupRepository: TypeOrmCustomerGroupRepository
  ) {}

  async execute(id: string): Promise<void> {
    const customerGroup = await this.customerGroupRepository.findById(id);
    if (!customerGroup) {
      throw new Error('Customer group not found');
    }

    await this.customerGroupRepository.delete(id);
  }
}
