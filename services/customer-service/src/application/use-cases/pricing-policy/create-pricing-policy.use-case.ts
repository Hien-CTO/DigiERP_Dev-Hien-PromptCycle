import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { TypeOrmPricingPolicyRepository } from '../../../infrastructure/database/repositories/pricing-policy.repository';
import { TypeOrmPricingPolicyDetailRepository } from '../../../infrastructure/database/repositories/pricing-policy-detail.repository';
import { PricingPolicy, PricingPolicyStatus } from '../../../domain/entities/pricing-policy.entity';
import { PricingPolicyDetail } from '../../../domain/entities/pricing-policy-detail.entity';
import { CreatePricingPolicyDto } from '../../dtos/pricing-policy.dto';
import { ProductPriceService } from '../../services/product-price.service';

@Injectable()
export class CreatePricingPolicyUseCase {
  constructor(
    private readonly policyRepository: TypeOrmPricingPolicyRepository,
    private readonly detailRepository: TypeOrmPricingPolicyDetailRepository,
    private readonly productPriceService: ProductPriceService,
  ) {}

  async execute(
    createDto: CreatePricingPolicyDto,
    userId: number,
  ): Promise<PricingPolicy> {
    // Check if code already exists
    const existingPolicy = await this.policyRepository.findByCode(createDto.code);
    if (existingPolicy) {
      throw new ConflictException('Pricing policy with this code already exists');
    }

    // Create pricing policy
    const policy = new PricingPolicy(
      null as any, // Will be set by database
      createDto.code,
      createDto.customerId,
      new Date(createDto.validFrom),
      createDto.validTo ? new Date(createDto.validTo) : null,
      createDto.status || PricingPolicyStatus.ACTIVE,
      new Date(),
      new Date(),
      userId,
      userId,
    );

    const savedPolicy = await this.policyRepository.save(policy);

    // Create policy details
    if (createDto.details && createDto.details.length > 0) {
      // Get product prices from product service
      const productIds = createDto.details.map((d) => d.productId);
      const priceMap = await this.productPriceService.getProductPrices(productIds);

      const details = await Promise.all(
        createDto.details.map(async (detailDto) => {
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
            null as any, // Will be set by database
            savedPolicy.id,
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

