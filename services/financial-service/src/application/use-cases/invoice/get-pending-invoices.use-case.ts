import { Injectable } from '@nestjs/common';
import { TypeOrmInvoiceRepository } from '../../../infrastructure/database/repositories/invoice.repository';
import { Invoice, InvoiceStatus } from '../../../domain/entities/invoice.entity';

@Injectable()
export class GetPendingInvoicesUseCase {
  constructor(private readonly invoiceRepository: TypeOrmInvoiceRepository) {}

  async execute(): Promise<Invoice[]> {
    return this.invoiceRepository.findByStatus(InvoiceStatus.DRAFT);
  }
}
