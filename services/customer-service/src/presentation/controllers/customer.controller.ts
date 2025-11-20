import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCustomerUseCase } from '../../application/use-cases/customer/create-customer.use-case';
import { GetCustomerUseCase } from '../../application/use-cases/customer/get-customer.use-case';
import { GetAllCustomersUseCase } from '../../application/use-cases/customer/get-all-customers.use-case';
import { SearchCustomersUseCase } from '../../application/use-cases/customer/search-customers.use-case';
import { UpdateCustomerUseCase } from '../../application/use-cases/customer/update-customer.use-case';
import { DeleteCustomerUseCase } from '../../application/use-cases/customer/delete-customer.use-case';
import { GetCustomerStatisticsUseCase } from '../../application/use-cases/customer/get-customer-statistics.use-case';
import { GetAllCustomerGroupsUseCase } from '../../application/use-cases/customer-group/get-all-customer-groups.use-case';
import { CustomerGroupResponseDto } from '../../application/dtos/customer-group.dto';
import { CreateCustomerDto, UpdateCustomerDto, CustomerResponseDto } from '../../application/dtos/customer.dto';
import { Customer as CustomerEntity } from '../../infrastructure/database/entities/customer.entity';

@ApiTags('Customers')
@Controller('customers')
export class CustomerController {
  constructor(
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly getCustomerUseCase: GetCustomerUseCase,
    private readonly getAllCustomersUseCase: GetAllCustomersUseCase,
    private readonly searchCustomersUseCase: SearchCustomersUseCase,
    private readonly updateCustomerUseCase: UpdateCustomerUseCase,
    private readonly deleteCustomerUseCase: DeleteCustomerUseCase,
    private readonly getCustomerStatisticsUseCase: GetCustomerStatisticsUseCase,
    private readonly getAllCustomerGroupsUseCase: GetAllCustomerGroupsUseCase,
    @InjectRepository(CustomerEntity)
    private readonly customerEntityRepository: Repository<CustomerEntity>,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createCustomerDto: CreateCustomerDto): Promise<CustomerResponseDto> {
    const customer = await this.createCustomerUseCase.execute(createCustomerDto);
    
    // Ensure we have the generated ID and code - fetch from database
    if (customer.id) {
      const savedEntity = await this.customerEntityRepository
        .createQueryBuilder('customer')
        .leftJoinAndSelect('customer.customerGroup', 'customerGroup')
        .where('customer.id = :id', { id: customer.id })
        .getOne();
      
      if (savedEntity) {
        return this.toResponseDto(savedEntity);
      }
    }
    
    // Fallback: use the customer from use case (should have id from repository.save)
    return this.toResponseDto(customer);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get customer statistics' })
  @ApiResponse({ status: 200, description: 'Customer statistics' })
  async getStatistics() {
    return await this.getCustomerStatisticsUseCase.execute();
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers' })
  @ApiQuery({ name: 'search', required: false, description: 'Search query' })
  @ApiResponse({ status: 200, description: 'List of customers' })
  async findAll(@Query('search') search?: string): Promise<CustomerResponseDto[]> {
    // Get entities directly from repository to include relations
    const entities = await this.customerEntityRepository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.customerGroup', 'customerGroup')
      .orderBy('customer.name', 'ASC')
      .getMany();
    
    return entities.map(entity => this.toResponseDto(entity));
  }

  @Get('groups')
  @ApiOperation({ summary: 'Get all customer groups' })
  @ApiResponse({ status: 200, description: 'List of customer groups' })
  async getCustomerGroups(): Promise<CustomerGroupResponseDto[]> {
    // Use GetAllCustomerGroupsUseCase to get customer groups
    const customerGroups = await this.getAllCustomerGroupsUseCase.execute();
    return customerGroups.map(group => ({
      id: group.id,
      name: group.name,
      description: group.description,
      isActive: group.isActive,
      isCompany: group.isCompany,
      color: group.color,
      sortOrder: group.sortOrder,
      createdAt: group.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: group.updatedAt?.toISOString() || new Date().toISOString(),
    }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 200, description: 'Customer found' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async findOne(@Param('id') id: string): Promise<CustomerResponseDto> {
    // Get entity directly from repository to include relations
    const entity = await this.customerEntityRepository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.customerGroup', 'customerGroup')
      .where('customer.id = :id', { id })
      .getOne();
    
    if (!entity) {
      throw new Error('Customer not found');
    }
    
    return this.toResponseDto(entity);
  }

  @Get(':id/summary')
  @ApiOperation({ summary: 'Get customer summary with financial and order information' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 200, description: 'Customer summary' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async getCustomerSummary(@Param('id') id: string): Promise<any> {
    // Get customer with relations
    const entity = await this.customerEntityRepository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.customerGroup', 'customerGroup')
      .where('customer.id = :id', { id })
      .getOne();
    
    if (!entity) {
      throw new Error('Customer not found');
    }

    // TODO: Integrate with sales-service and financial-service to get real data
    // For now, return mock data structure
    const customer = this.toResponseDto(entity);
    
    return {
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        contactPerson: customer.contactPerson,
        salesRep: customer.salesRep,
        creditLimit: customer.creditLimit,
        customerGroup: customer.customerGroup,
      },
      financial: {
        creditLimit: customer.creditLimit || 0,
        currentDebt: 0, // TODO: Get from financial-service
        availableCredit: customer.creditLimit || 0,
        unpaidInvoices: [], // TODO: Get from financial-service
      },
      orders: {
        recentOrders: [], // TODO: Get from sales-service
        totalOrders: 0, // TODO: Get from sales-service
        totalValue: 0, // TODO: Get from sales-service
        lastOrderDate: undefined, // TODO: Get from sales-service
      },
      summary: {
        totalOrders: 0,
        totalValue: 0,
        currentDebt: 0,
        creditUtilization: 0,
      },
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update customer' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 200, description: 'Customer updated successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerResponseDto> {
    const customer = await this.updateCustomerUseCase.execute(id, updateCustomerDto);
    return this.toResponseDto(customer);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete customer' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 204, description: 'Customer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteCustomerUseCase.execute(id);
  }

  private toResponseDto(customer: any): CustomerResponseDto {
    return {
      id: customer.id,
      code: customer.code || undefined,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      taxCode: customer.taxCode,
      contactPerson: customer.contactPerson,
      paymentTerms: customer.paymentTerms,
      creditLimit: customer.creditLimit,
      isActive: customer.isActive,
      notes: customer.notes,
      salesRep: customer.salesRep,
      salesRepresentativeId: customer.salesRepresentativeId || undefined,
      customerGroupId: customer.customerGroupId,
      customerGroup: customer.customerGroup ? {
        id: customer.customerGroup.id,
        name: customer.customerGroup.name,
        isCompany: customer.customerGroup.isCompany || customer.customerGroup.is_company || false,
        color: customer.customerGroup.color,
        isActive: customer.customerGroup.isActive !== undefined ? customer.customerGroup.isActive : (customer.customerGroup.is_active !== undefined ? customer.customerGroup.is_active : true),
      } : undefined,
      salesRepresentative: customer.salesRepresentative ? {
        id: customer.salesRepresentative.id,
        firstName: customer.salesRepresentative.firstName || customer.salesRepresentative.first_name,
        lastName: customer.salesRepresentative.lastName || customer.salesRepresentative.last_name,
        username: customer.salesRepresentative.username,
      } : undefined,
      createdAt: customer.createdAt?.toISOString() || customer.created_at?.toISOString() || new Date().toISOString(),
      updatedAt: customer.updatedAt?.toISOString() || customer.updated_at?.toISOString() || new Date().toISOString(),
    };
  }
}
