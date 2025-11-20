import { Injectable } from '@nestjs/common';
import { TypeOrmInvoiceRepository } from '../../../infrastructure/database/repositories/invoice.repository';
import { Invoice } from '../../../domain/entities/invoice.entity';
import { UpdateInvoiceDto } from '../../dtos/invoice.dto';

@Injectable()
export class UpdateInvoiceUseCase {
  constructor(private readonly invoiceRepository: TypeOrmInvoiceRepository) {}

  async execute(id: string, updateData: UpdateInvoiceDto): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    Object.assign(invoice, updateData);
    return this.invoiceRepository.save(invoice);
  }
}
