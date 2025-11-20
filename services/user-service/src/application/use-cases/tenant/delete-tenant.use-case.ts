import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { ITenantRepository } from '@/domain/repositories/tenant.repository.interface';

@Injectable()
export class DeleteTenantUseCase {
  constructor(@Inject('ITenantRepository') private readonly tenantRepository: ITenantRepository) {}

  async execute(tenantId: number): Promise<{ message: string }> {
    // Check if tenant exists
    const tenant = await this.tenantRepository.findById(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Check if tenant can be deleted (business logic)
    if (tenant.status !== 'INACTIVE') {
      throw new BadRequestException(
        'Tenant cannot be deleted. Only INACTIVE tenants can be deleted.'
      );
    }

    // Delete tenant
    const deleted = await this.tenantRepository.delete(tenantId);
    if (!deleted) {
      throw new NotFoundException('Failed to delete tenant');
    }

    return {
      message: 'Tenant deleted successfully',
    };
  }
}

