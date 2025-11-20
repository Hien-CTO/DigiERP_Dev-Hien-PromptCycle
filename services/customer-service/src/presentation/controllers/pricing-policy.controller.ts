import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreatePricingPolicyUseCase } from '../../application/use-cases/pricing-policy/create-pricing-policy.use-case';
import { GetPricingPolicyUseCase } from '../../application/use-cases/pricing-policy/get-pricing-policy.use-case';
import { GetPricingPoliciesUseCase } from '../../application/use-cases/pricing-policy/get-pricing-policies.use-case';
import { UpdatePricingPolicyUseCase } from '../../application/use-cases/pricing-policy/update-pricing-policy.use-case';
import { DeletePricingPolicyUseCase } from '../../application/use-cases/pricing-policy/delete-pricing-policy.use-case';
import { TypeOrmPricingPolicyDetailRepository } from '../../infrastructure/database/repositories/pricing-policy-detail.repository';
import {
  CreatePricingPolicyDto,
  UpdatePricingPolicyDto,
  PricingPolicyResponseDto,
  PricingPolicyListResponseDto,
  PricingPolicyDetailResponseDto,
} from '../../application/dtos/pricing-policy.dto';

@ApiTags('Pricing Policies')
@Controller('pricing-policies')
export class PricingPolicyController {
  constructor(
    private readonly createPricingPolicyUseCase: CreatePricingPolicyUseCase,
    private readonly getPricingPolicyUseCase: GetPricingPolicyUseCase,
    private readonly getPricingPoliciesUseCase: GetPricingPoliciesUseCase,
    private readonly updatePricingPolicyUseCase: UpdatePricingPolicyUseCase,
    private readonly deletePricingPolicyUseCase: DeletePricingPolicyUseCase,
    private readonly detailRepository: TypeOrmPricingPolicyDetailRepository,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new pricing policy' })
  @ApiResponse({ status: 201, description: 'Pricing policy created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Conflict - code already exists' })
  async create(
    @Body() createDto: CreatePricingPolicyDto,
  ): Promise<PricingPolicyResponseDto> {
    const userId = 1; // TODO: Get from auth context
    const policy = await this.createPricingPolicyUseCase.execute(createDto, userId);
    return await this.toResponseDto(policy);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pricing policies' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'customerId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Pricing policies retrieved successfully' })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('customerId') customerId?: string,
  ): Promise<PricingPolicyListResponseDto> {
    const result = await this.getPricingPoliciesUseCase.execute(page, limit, customerId);
    const policies = await Promise.all(
      result.policies.map((policy) => this.toResponseDto(policy)),
    );
    return {
      policies,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pricing policy by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Pricing policy retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Pricing policy not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PricingPolicyResponseDto> {
    const policy = await this.getPricingPolicyUseCase.execute(id);
    return await this.toResponseDto(policy);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get pricing policies by customer ID' })
  @ApiParam({ name: 'customerId', type: String })
  @ApiResponse({ status: 200, description: 'Pricing policies retrieved successfully' })
  async findByCustomerId(
    @Param('customerId') customerId: string,
  ): Promise<PricingPolicyResponseDto[]> {
    const policies = await this.getPricingPoliciesUseCase.execute(1, 1000, customerId);
    return await Promise.all(
      policies.policies.map((policy) => this.toResponseDto(policy)),
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update pricing policy' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Pricing policy updated successfully' })
  @ApiResponse({ status: 404, description: 'Pricing policy not found' })
  @ApiResponse({ status: 409, description: 'Conflict - code already exists' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePricingPolicyDto,
  ): Promise<PricingPolicyResponseDto> {
    const userId = 1; // TODO: Get from auth context
    const policy = await this.updatePricingPolicyUseCase.execute(id, updateDto, userId);
    return await this.toResponseDto(policy);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete pricing policy' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Pricing policy deleted successfully' })
  @ApiResponse({ status: 404, description: 'Pricing policy not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.deletePricingPolicyUseCase.execute(id);
  }

  private async toResponseDto(
    policy: any,
  ): Promise<PricingPolicyResponseDto> {
    const details = await this.detailRepository.findByPolicyId(policy.id);
    return {
      id: policy.id,
      code: policy.code,
      customerId: policy.customerId,
      validFrom: policy.validFrom,
      validTo: policy.validTo,
      status: policy.status,
      details: details.map((detail) => ({
        id: detail.id,
        pricingPolicyId: detail.pricingPolicyId,
        productId: detail.productId,
        basePrice: detail.basePrice,
        discountPercentage: detail.discountPercentage,
        discountedPrice: detail.discountedPrice,
        createdAt: detail.createdAt,
        updatedAt: detail.updatedAt,
        createdBy: detail.createdBy,
        updatedBy: detail.updatedBy,
      })),
      createdAt: policy.createdAt,
      updatedAt: policy.updatedAt,
      createdBy: policy.createdBy,
      updatedBy: policy.updatedBy,
    };
  }
}


