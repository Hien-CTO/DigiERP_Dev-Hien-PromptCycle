import { Injectable } from '@nestjs/common';
import { TypeOrmInvoiceRepository } from '../../../infrastructure/database/repositories/invoice.repository';
import { Invoice } from '../../../domain/entities/invoice.entity';

@Injectable()
export class GetInvoiceUseCase {
  constructor(private readonly invoiceRepository: TypeOrmInvoiceRepository) {}

  async execute(id: string): Promise<Invoice | null> {
    return this.invoiceRepository.findById(id);
  }
}
