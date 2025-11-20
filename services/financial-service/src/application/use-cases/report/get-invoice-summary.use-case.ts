import { Injectable } from '@nestjs/common';
import { TypeOrmInvoiceRepository } from '../../../infrastructure/database/repositories/invoice.repository';
import { InvoiceStatus } from '../../../domain/entities/invoice.entity';

@Injectable()
export class GetInvoiceSummaryUseCase {
  constructor(private readonly invoiceRepository: TypeOrmInvoiceRepository) {}

  async execute(): Promise<any> {
    const invoices = await this.invoiceRepository.findAll();
    
    const summary = {
      total: invoices.length,
      pending: invoices.filter(inv => inv.status === InvoiceStatus.DRAFT).length,
      sent: invoices.filter(inv => inv.status === InvoiceStatus.SENT).length,
      paid: invoices.filter(inv => inv.status === InvoiceStatus.PAID).length,
      overdue: invoices.filter(inv => inv.status === InvoiceStatus.OVERDUE).length,
      totalAmount: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
      paidAmount: invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0),
    };

    return summary;
  }
}
