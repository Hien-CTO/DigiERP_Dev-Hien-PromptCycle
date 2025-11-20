import { Injectable } from '@nestjs/common';
import { TypeOrmInvoiceRepository } from '../../../infrastructure/database/repositories/invoice.repository';
import { Invoice, InvoiceType } from '../../../domain/entities/invoice.entity';
import { CreateInvoiceDto } from '../../dtos/invoice.dto';

@Injectable()
export class CreateInvoiceUseCase {
  constructor(private readonly invoiceRepository: TypeOrmInvoiceRepository) {}

  async execute(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    // Check if invoice with same number already exists
    const existingInvoice = await this.invoiceRepository.findByInvoiceNumber(createInvoiceDto.invoice_number);
    if (existingInvoice) {
      throw new Error('Invoice with this number already exists');
    }

    // Calculate amounts if not provided
    let subtotal = createInvoiceDto.subtotal || 0;
    let taxAmount = createInvoiceDto.tax_amount || 0;
    let discountAmount = createInvoiceDto.discount_amount || 0;
    let totalAmount = createInvoiceDto.total_amount || 0;

    if (!createInvoiceDto.subtotal || !createInvoiceDto.total_amount) {
      // Calculate from items
      subtotal = createInvoiceDto.items.reduce((sum, item) => {
        const itemTotal = item.quantity * item.unit_price;
        const itemDiscount = itemTotal * ((item.discount_percentage || 0) / 100);
        return sum + itemTotal - itemDiscount;
      }, 0);

      taxAmount = createInvoiceDto.items.reduce((sum, item) => {
        const itemTotal = item.quantity * item.unit_price;
        const itemDiscount = itemTotal * ((item.discount_percentage || 0) / 100);
        const itemSubtotal = itemTotal - itemDiscount;
        return sum + itemSubtotal * ((item.tax_percentage || 0) / 100);
      }, 0);

      discountAmount = createInvoiceDto.items.reduce((sum, item) => {
        const itemTotal = item.quantity * item.unit_price;
        return sum + itemTotal * ((item.discount_percentage || 0) / 100);
      }, 0);

      totalAmount = subtotal + taxAmount;
    }

    const invoice = Invoice.create(
      createInvoiceDto.invoice_number,
      createInvoiceDto.type as InvoiceType,
      createInvoiceDto.customer_id,
      createInvoiceDto.customer_name,
      new Date(createInvoiceDto.invoice_date),
      new Date(createInvoiceDto.due_date),
      createInvoiceDto.customer_email,
      createInvoiceDto.customer_address,
      createInvoiceDto.customer_tax_code,
      createInvoiceDto.order_id,
      createInvoiceDto.order_number,
      createInvoiceDto.notes,
      createInvoiceDto.terms_conditions,
    );

    const invoiceWithAmounts = invoice.updateAmounts(subtotal, taxAmount, discountAmount, totalAmount);

    return await this.invoiceRepository.save(invoiceWithAmounts);
  }
}
