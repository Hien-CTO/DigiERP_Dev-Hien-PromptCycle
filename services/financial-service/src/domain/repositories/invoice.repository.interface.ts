import { Invoice, InvoiceStatus, InvoiceType } from '../entities/invoice.entity';

export interface InvoiceRepository {
  findAll(): Promise<Invoice[]>;
  findById(id: string): Promise<Invoice | null>;
  findByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null>;
  findByCustomerId(customerId: string): Promise<Invoice[]>;
  findByStatus(status: InvoiceStatus): Promise<Invoice[]>;
  findByType(type: InvoiceType): Promise<Invoice[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Invoice[]>;
  save(invoice: Invoice): Promise<Invoice>;
  update(id: string, invoice: Invoice): Promise<Invoice>;
  delete(id: string): Promise<void>;
  getSalesOverview(startDate: Date, endDate: Date, currency: string): Promise<any[]>;
  getInvoiceSummary(startDate: Date, endDate: Date, status?: string, customerId?: string): Promise<any>;
}
