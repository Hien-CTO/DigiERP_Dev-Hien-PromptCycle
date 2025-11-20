import { Injectable } from '@nestjs/common';
import { TypeOrmInvoiceRepository } from '../../../infrastructure/database/repositories/invoice.repository';

@Injectable()
export class DeleteInvoiceUseCase {
  constructor(private readonly invoiceRepository: TypeOrmInvoiceRepository) {}

  async execute(id: string): Promise<void> {
    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    await this.invoiceRepository.delete(id);
  }
}
