import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { TypeOrmPricingPolicyRepository } from '../../../infrastructure/database/repositories/pricing-policy.repository';
import { TypeOrmPricingPolicyDetailRepository } from '../../../infrastructure/database/repositories/pricing-policy-detail.repository';
import { PricingPolicy, PricingPolicyStatus } from '../../../domain/entities/pricing-policy.entity';
import { PricingPolicyDetail } from '../../../domain/entities/pricing-policy-detail.entity';
import { UpdatePricingPolicyDto } from '../../dtos/pricing-policy.dto';
import { ProductPriceService } from '../../services/product-price.service';

@Injectable()
export class UpdatePricingPolicyUseCase {
  constructor(
    private readonly policyRepository: TypeOrmPricingPolicyRepository,
    private readonly detailRepository: TypeOrmPricingPolicyDetailRepository,
    private readonly productPriceService: ProductPriceService,
  ) {}

  async execute(
    id: number,
    updateDto: UpdatePricingPolicyDto,
    userId: number,
  ): Promise<PricingPolicy> {
    const existingPolicy = await this.policyRepository.findById(id);
    if (!existingPolicy) {
      throw new NotFoundException(`Pricing policy with ID ${id} not found`);
    }

    // Check if code is being changed and if new code already exists
    if (updateDto.code && updateDto.code !== existingPolicy.code) {
      const policyWithCode = await this.policyRepository.findByCode(updateDto.code);
      if (policyWithCode) {
        throw new ConflictException('Pricing policy with this code already exists');
      }
    }

    // Create updated policy with merged values
    const updatedPolicy = new PricingPolicy(
      existingPolicy.id,
      updateDto.code !== undefined ? updateDto.code : existingPolicy.code,
      existingPolicy.customerId,
      updateDto.validFrom !== undefined ? new Date(updateDto.validFrom) : existingPolicy.validFrom,
      updateDto.validTo !== undefined
        ? updateDto.validTo
          ? new Date(updateDto.validTo)
          : null
        : existingPolicy.validTo,
      updateDto.status !== undefined ? updateDto.status : existingPolicy.status,
      existingPolicy.createdAt,
      new Date(), // updatedAt
      existingPolicy.createdBy,
      userId, // updatedBy
    );

    const savedPolicy = await this.policyRepository.save(updatedPolicy);

    // Update details if provided
    if (updateDto.details && updateDto.details.length > 0) {
      // Delete existing details
      await this.detailRepository.deleteByPolicyId(id);

      // Get product prices from product service
      const productIds = updateDto.details.map((d) => d.productId);
      const priceMap = await this.productPriceService.getProductPrices(productIds);

      // Create new details
      const details = await Promise.all(
        updateDto.details.map(async (detailDto) => {
          // Use provided basePrice or fetch from product service
          let basePrice = detailDto.basePrice;
          if (basePrice === undefined || basePrice === null || basePrice === 0) {
            basePrice = priceMap.get(detailDto.productId);
            if (!basePrice || basePrice === 0) {
              throw new NotFoundException(
                `Product price not found for product ID ${detailDto.productId}`,
              );
            }
          }

          const discountAmount = (basePrice * detailDto.discountPercentage) / 100;
          const discountedPrice = basePrice - discountAmount;

          return new PricingPolicyDetail(
            null as any,
            id,
            detailDto.productId,
            basePrice,
            detailDto.discountPercentage,
            discountedPrice,
            new Date(),
            new Date(),
            userId,
            userId,
          );
        }),
      );

      await this.detailRepository.saveMany(details);
    }

    return savedPolicy;
  }
}

