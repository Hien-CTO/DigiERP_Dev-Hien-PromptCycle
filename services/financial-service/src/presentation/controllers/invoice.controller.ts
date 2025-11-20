import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto, UpdateInvoiceDto, InvoiceResponseDto } from '../../application/dtos/invoice.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RbacGuard } from '../guards/rbac.guard';
import { Permissions } from '../decorators/permissions.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';

@ApiTags('Invoices')
// @ApiBearerAuth()
@Controller('invoices')
// @UseGuards(JwtAuthGuard, RbacGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully', type: InvoiceResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Permissions('invoice:create')
  async create(
    @Body() createInvoiceDto: CreateInvoiceDto,
    @CurrentUser() user: any,
  ): Promise<InvoiceResponseDto> {
    return await this.invoiceService.create(createInvoiceDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all invoices' })
  @ApiResponse({ status: 200, description: 'Invoices retrieved successfully', type: [InvoiceResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  // @Permissions('invoice:read')
  async findAll(): Promise<InvoiceResponseDto[]> {
    return await this.invoiceService.findAll();
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get all pending invoices' })
  @ApiResponse({ status: 200, description: 'Pending invoices retrieved successfully', type: [InvoiceResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Permissions('invoice:read')
  async findPendingInvoices(): Promise<InvoiceResponseDto[]> {
    return await this.invoiceService.findPendingInvoices();
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get all overdue invoices' })
  @ApiResponse({ status: 200, description: 'Overdue invoices retrieved successfully', type: [InvoiceResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Permissions('invoice:read')
  async findOverdueInvoices(): Promise<InvoiceResponseDto[]> {
    return await this.invoiceService.findOverdueInvoices();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiResponse({ status: 200, description: 'Invoice retrieved successfully', type: InvoiceResponseDto })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Permissions('invoice:read')
  async findOne(@Param('id') id: string): Promise<InvoiceResponseDto> {
    return await this.invoiceService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update invoice' })
  @ApiResponse({ status: 200, description: 'Invoice updated successfully', type: InvoiceResponseDto })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Permissions('invoice:update')
  async update(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
    @CurrentUser() user: any,
  ): Promise<InvoiceResponseDto> {
    return await this.invoiceService.update(id, updateInvoiceDto, user.id);
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Send invoice' })
  @ApiResponse({ status: 200, description: 'Invoice sent successfully', type: InvoiceResponseDto })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Permissions('invoice:send')
  async send(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<InvoiceResponseDto> {
    return await this.invoiceService.send(id, user.id);
  }

  @Post(':id/pay')
  @ApiOperation({ summary: 'Record payment for invoice' })
  @ApiResponse({ status: 200, description: 'Payment recorded successfully', type: InvoiceResponseDto })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Permissions('invoice:pay')
  async pay(
    @Param('id') id: string,
    @Body() paymentData: { amount: number },
    @CurrentUser() user: any,
  ): Promise<InvoiceResponseDto> {
    return await this.invoiceService.recordPayment(id, paymentData.amount, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete invoice' })
  @ApiResponse({ status: 204, description: 'Invoice deleted successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Permissions('invoice:delete')
  async remove(@Param('id') id: string): Promise<void> {
    return await this.invoiceService.remove(id);
  }
}
