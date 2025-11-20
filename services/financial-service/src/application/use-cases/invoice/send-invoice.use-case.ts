import { Injectable } from '@nestjs/common';
import { TypeOrmInvoiceRepository } from '../../../infrastructure/database/repositories/invoice.repository';
import { Invoice, InvoiceStatus } from '../../../domain/entities/invoice.entity';

@Injectable()
export class SendInvoiceUseCase {
  constructor(private readonly invoiceRepository: TypeOrmInvoiceRepository) {}

  async execute(id: string, sentBy?: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Create new invoice with updated status
    const updatedInvoice = invoice.markAsSent(sentBy || 'system');
    
    return this.invoiceRepository.save(updatedInvoice);
  }
}
