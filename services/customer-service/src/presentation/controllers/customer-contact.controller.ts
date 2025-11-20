import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateCustomerContactUseCase } from '../../application/use-cases/customer-contact/create-customer-contact.use-case';
import { UpdateCustomerContactUseCase } from '../../application/use-cases/customer-contact/update-customer-contact.use-case';
import { GetCustomerContactUseCase } from '../../application/use-cases/customer-contact/get-customer-contact.use-case';
import { GetCustomerContactsUseCase } from '../../application/use-cases/customer-contact/get-customer-contacts.use-case';
import { DeleteCustomerContactUseCase } from '../../application/use-cases/customer-contact/delete-customer-contact.use-case';
import {
  CreateCustomerContactDto,
  UpdateCustomerContactDto,
  CustomerContactResponseDto,
} from '../../application/dtos/customer-contact.dto';
import { CustomerContact } from '../../domain/entities/customer-contact.entity';

@ApiTags('Customer Contacts')
@Controller('api/v1/customers/:customerId/contacts')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class CustomerContactController {
  constructor(
    private readonly createContactUseCase: CreateCustomerContactUseCase,
    private readonly updateContactUseCase: UpdateCustomerContactUseCase,
    private readonly getContactUseCase: GetCustomerContactUseCase,
    private readonly getContactsUseCase: GetCustomerContactsUseCase,
    private readonly deleteContactUseCase: DeleteCustomerContactUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer contact' })
  @ApiResponse({ status: 201, description: 'Contact created successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async create(
    @Param('customerId') customerId: string,
    @Body() dto: CreateCustomerContactDto,
  ): Promise<CustomerContactResponseDto> {
    dto.customerId = customerId;
    const contact = await this.createContactUseCase.execute(dto);
    return this.toResponseDto(contact);
  }

  @Get()
  @ApiOperation({ summary: 'Get all contacts for a customer' })
  @ApiResponse({ status: 200, description: 'List of contacts', type: [CustomerContactResponseDto] })
  async findAll(@Param('customerId') customerId: string): Promise<CustomerContactResponseDto[]> {
    const contacts = await this.getContactsUseCase.execute(customerId);
    return contacts.map(this.toResponseDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a contact by ID' })
  @ApiResponse({ status: 200, description: 'Contact found', type: CustomerContactResponseDto })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async findOne(
    @Param('customerId') customerId: string,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CustomerContactResponseDto> {
    const contact = await this.getContactUseCase.execute(id);
    return this.toResponseDto(contact);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a contact' })
  @ApiResponse({ status: 200, description: 'Contact updated successfully', type: CustomerContactResponseDto })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async update(
    @Param('customerId') customerId: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCustomerContactDto,
  ): Promise<CustomerContactResponseDto> {
    const contact = await this.updateContactUseCase.execute(id, dto);
    return this.toResponseDto(contact);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a contact' })
  @ApiResponse({ status: 204, description: 'Contact deleted successfully' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async delete(
    @Param('customerId') customerId: string,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.deleteContactUseCase.execute(id);
  }

  private toResponseDto(contact: CustomerContact): CustomerContactResponseDto {
    return {
      id: contact.id,
      customerId: contact.customerId,
      title: contact.title,
      contactPerson: contact.contactPerson,
      phone: contact.phone,
      email: contact.email,
      department: contact.department,
      position: contact.position,
      notes: contact.notes,
      isPrimary: contact.isPrimary,
      isActive: contact.isActive,
      createdAt: contact.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: contact.updatedAt?.toISOString() || new Date().toISOString(),
      zaloUrl: contact.getZaloUrl(),
    };
  }
}

