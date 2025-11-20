import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateCustomerGroupUseCase } from '../../application/use-cases/customer-group/create-customer-group.use-case';
import { GetCustomerGroupUseCase } from '../../application/use-cases/customer-group/get-customer-group.use-case';
import { GetAllCustomerGroupsUseCase } from '../../application/use-cases/customer-group/get-all-customer-groups.use-case';
import { UpdateCustomerGroupUseCase } from '../../application/use-cases/customer-group/update-customer-group.use-case';
import { DeleteCustomerGroupUseCase } from '../../application/use-cases/customer-group/delete-customer-group.use-case';
import { CreateCustomerGroupDto, UpdateCustomerGroupDto, CustomerGroupResponseDto } from '../../application/dtos/customer-group.dto';

@ApiTags('Customer Groups')
@Controller('customer-groups')
export class CustomerGroupController {
  constructor(
    private readonly createCustomerGroupUseCase: CreateCustomerGroupUseCase,
    private readonly getCustomerGroupUseCase: GetCustomerGroupUseCase,
    private readonly getAllCustomerGroupsUseCase: GetAllCustomerGroupsUseCase,
    private readonly updateCustomerGroupUseCase: UpdateCustomerGroupUseCase,
    private readonly deleteCustomerGroupUseCase: DeleteCustomerGroupUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer group' })
  @ApiResponse({ status: 201, description: 'Customer group created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createCustomerGroupDto: CreateCustomerGroupDto): Promise<CustomerGroupResponseDto> {
    const customerGroup = await this.createCustomerGroupUseCase.execute(createCustomerGroupDto);
    return this.toResponseDto(customerGroup);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customer groups' })
  @ApiResponse({ status: 200, description: 'List of customer groups' })
  async findAll(): Promise<CustomerGroupResponseDto[]> {
    const customerGroups = await this.getAllCustomerGroupsUseCase.execute();
    return customerGroups.map(group => this.toResponseDto(group));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer group by ID' })
  @ApiParam({ name: 'id', description: 'Customer group ID' })
  @ApiResponse({ status: 200, description: 'Customer group found' })
  @ApiResponse({ status: 404, description: 'Customer group not found' })
  async findOne(@Param('id') id: string): Promise<CustomerGroupResponseDto> {
    const customerGroup = await this.getCustomerGroupUseCase.execute(id);
    if (!customerGroup) {
      throw new Error('Customer group not found');
    }
    return this.toResponseDto(customerGroup);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update customer group' })
  @ApiParam({ name: 'id', description: 'Customer group ID' })
  @ApiResponse({ status: 200, description: 'Customer group updated successfully' })
  @ApiResponse({ status: 404, description: 'Customer group not found' })
  async update(
    @Param('id') id: string,
    @Body() updateCustomerGroupDto: UpdateCustomerGroupDto,
  ): Promise<CustomerGroupResponseDto> {
    const customerGroup = await this.updateCustomerGroupUseCase.execute(id, updateCustomerGroupDto);
    return this.toResponseDto(customerGroup);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete customer group' })
  @ApiParam({ name: 'id', description: 'Customer group ID' })
  @ApiResponse({ status: 204, description: 'Customer group deleted successfully' })
  @ApiResponse({ status: 404, description: 'Customer group not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteCustomerGroupUseCase.execute(id);
  }

  private toResponseDto(customerGroup: any): CustomerGroupResponseDto {
    return {
      id: customerGroup.id,
      name: customerGroup.name,
      description: customerGroup.description,
      isActive: customerGroup.isActive,
      isCompany: customerGroup.isCompany,
      color: customerGroup.color,
      sortOrder: customerGroup.sortOrder,
      createdAt: customerGroup.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: customerGroup.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }
}
