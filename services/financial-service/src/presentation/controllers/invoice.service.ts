import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateInvoiceUseCase } from '../../application/use-cases/invoice/create-invoice.use-case';
import { GetInvoiceUseCase } from '../../application/use-cases/invoice/get-invoice.use-case';
import { UpdateInvoiceUseCase } from '../../application/use-cases/invoice/update-invoice.use-case';
import { DeleteInvoiceUseCase } from '../../application/use-cases/invoice/delete-invoice.use-case';
import { GetAllInvoicesUseCase } from '../../application/use-cases/invoice/get-all-invoices.use-case';
import { GetPendingInvoicesUseCase } from '../../application/use-cases/invoice/get-pending-invoices.use-case';
import { GetOverdueInvoicesUseCase } from '../../application/use-cases/invoice/get-overdue-invoices.use-case';
import { SendInvoiceUseCase } from '../../application/use-cases/invoice/send-invoice.use-case';
import { RecordPaymentUseCase } from '../../application/use-cases/invoice/record-payment.use-case';
import { CreateInvoiceDto, UpdateInvoiceDto, InvoiceResponseDto } from '../../application/dtos/invoice.dto';

@Injectable()
export class InvoiceService {
  constructor(
    private readonly createInvoiceUseCase: CreateInvoiceUseCase,
    private readonly getInvoiceUseCase: GetInvoiceUseCase,
    private readonly updateInvoiceUseCase: UpdateInvoiceUseCase,
    private readonly deleteInvoiceUseCase: DeleteInvoiceUseCase,
    private readonly getAllInvoicesUseCase: GetAllInvoicesUseCase,
    private readonly getPendingInvoicesUseCase: GetPendingInvoicesUseCase,
    private readonly getOverdueInvoicesUseCase: GetOverdueInvoicesUseCase,
    private readonly sendInvoiceUseCase: SendInvoiceUseCase,
    private readonly recordPaymentUseCase: RecordPaymentUseCase,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto, userId: string): Promise<InvoiceResponseDto> {
    try {
      const invoice = await this.createInvoiceUseCase.execute(createInvoiceDto);
      return this.toResponseDto(invoice);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(): Promise<InvoiceResponseDto[]> {
    const invoices = await this.getAllInvoicesUseCase.execute();
    return invoices.map(invoice => this.toResponseDto(invoice));
  }

  async findPendingInvoices(): Promise<InvoiceResponseDto[]> {
    const invoices = await this.getPendingInvoicesUseCase.execute();
    return invoices.map(invoice => this.toResponseDto(invoice));
  }

  async findOverdueInvoices(): Promise<InvoiceResponseDto[]> {
    const invoices = await this.getOverdueInvoicesUseCase.execute();
    return invoices.map(invoice => this.toResponseDto(invoice));
  }

  async findOne(id: string): Promise<InvoiceResponseDto> {
    try {
      const invoice = await this.getInvoiceUseCase.execute(id);
      if (!invoice) {
        throw new NotFoundException('Invoice not found');
      }
      return this.toResponseDto(invoice);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto, userId: string): Promise<InvoiceResponseDto> {
    try {
      const invoice = await this.updateInvoiceUseCase.execute(id, updateInvoiceDto);
      return this.toResponseDto(invoice);
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  async send(id: string, userId: string): Promise<InvoiceResponseDto> {
    try {
      const invoice = await this.sendInvoiceUseCase.execute(id);
      return this.toResponseDto(invoice);
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  async recordPayment(id: string, amount: number, userId: string): Promise<InvoiceResponseDto> {
    try {
      const invoice = await this.recordPaymentUseCase.execute(id, amount);
      return this.toResponseDto(invoice);
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.deleteInvoiceUseCase.execute(id);
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  private toResponseDto(invoice: any): InvoiceResponseDto {
    return {
      id: invoice.id,
      invoice_number: invoice.invoiceNumber,
      type: invoice.type,
      status: invoice.status,
      customer_id: invoice.customerId,
      customer_name: invoice.customerName,
      customer_email: invoice.customerEmail,
      customer_address: invoice.customerAddress,
      customer_tax_code: invoice.customerTaxCode,
      order_id: invoice.orderId,
      order_number: invoice.orderNumber,
      invoice_date: invoice.invoiceDate,
      due_date: invoice.dueDate,
      subtotal: invoice.subtotal,
      tax_amount: invoice.taxAmount,
      discount_amount: invoice.discountAmount,
      total_amount: invoice.totalAmount,
      paid_amount: invoice.paidAmount,
      balance_amount: invoice.balanceAmount,
      currency: invoice.currency,
      exchange_rate: invoice.exchangeRate,
      notes: invoice.notes,
      terms_conditions: invoice.termsConditions,
      created_by: invoice.createdBy,
      sent_by: invoice.sentBy,
      sent_at: invoice.sentAt,
      paid_by: invoice.paidBy,
      paid_at: invoice.paidAt,
      created_at: invoice.createdAt,
      updated_at: invoice.updatedAt,
      items: invoice.items || [],
    };
  }
}
