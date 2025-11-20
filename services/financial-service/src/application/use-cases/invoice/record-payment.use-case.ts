import { Injectable } from '@nestjs/common';
import { TypeOrmInvoiceRepository } from '../../../infrastructure/database/repositories/invoice.repository';
import { Invoice, InvoiceStatus } from '../../../domain/entities/invoice.entity';

@Injectable()
export class RecordPaymentUseCase {
  constructor(private readonly invoiceRepository: TypeOrmInvoiceRepository) {}

  async execute(id: string, paymentAmount: number): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Create new invoice with updated payment
    const updatedInvoice = invoice.recordPayment(paymentAmount);
    
    return this.invoiceRepository.save(updatedInvoice);
  }
}
