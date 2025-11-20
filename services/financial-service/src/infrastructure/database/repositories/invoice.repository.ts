import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Invoice as InvoiceEntity, InvoiceStatusEnum, InvoiceTypeEnum } from '../entities/invoice.entity';
import { InvoiceRepository } from '../../../domain/repositories/invoice.repository.interface';
import { Invoice as InvoiceDomain, InvoiceStatus as DomainInvoiceStatus, InvoiceType as DomainInvoiceType } from '../../../domain/entities/invoice.entity';

@Injectable()
export class TypeOrmInvoiceRepository implements InvoiceRepository {
  constructor(
    @InjectRepository(InvoiceEntity)
    private readonly repository: Repository<InvoiceEntity>,
  ) {}

  async findAll(): Promise<InvoiceDomain[]> {
    const entities = await this.repository.find({ relations: ['items'] });
    return entities.map(this.toDomain);
  }

  async findById(id: string): Promise<InvoiceDomain | null> {
    const entity = await this.repository.findOne({ 
      where: { id },
      relations: ['items']
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByInvoiceNumber(invoiceNumber: string): Promise<InvoiceDomain | null> {
    const entity = await this.repository.findOne({ 
      where: { invoice_number: invoiceNumber },
      relations: ['items']
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByCustomerId(customerId: string): Promise<InvoiceDomain[]> {
    const entities = await this.repository.find({ 
      where: { customer_id: customerId },
      relations: ['items']
    });
    return entities.map(this.toDomain);
  }

  async findByStatus(status: DomainInvoiceStatus): Promise<InvoiceDomain[]> {
    const entities = await this.repository.find({ 
      where: { status_id: this.statusToNumber(status) },
      relations: ['items']
    });
    return entities.map(this.toDomain);
  }

  async findByType(type: DomainInvoiceType): Promise<InvoiceDomain[]> {
    const entities = await this.repository.find({ 
      where: { type_id: this.typeToNumber(type) },
      relations: ['items']
    });
    return entities.map(this.toDomain);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<InvoiceDomain[]> {
    const entities = await this.repository.find({
      where: {
        invoice_date: Between(startDate, endDate),
      },
      relations: ['items'],
    });
    return entities.map(this.toDomain);
  }

  async save(invoice: InvoiceDomain): Promise<InvoiceDomain> {
    const entity = this.toEntity(invoice);
    const savedEntity = await this.repository.save(entity);
    return this.toDomain(savedEntity);
  }

  async update(id: string, invoice: InvoiceDomain): Promise<InvoiceDomain> {
    const entity = this.toEntity(invoice);
    entity.id = id;
    const updatedEntity = await this.repository.save(entity);
    return this.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async getSalesOverview(startDate: Date, endDate: Date, currency: string): Promise<any[]> {
    const entities = await this.repository.find({
      where: {
        invoice_date: Between(startDate, endDate),
        currency,
        type_id: 1, // SALES type ID
      },
      relations: ['items'],
    });
    return entities.map(entity => ({
      id: entity.id,
      invoiceDate: entity.invoice_date,
      totalAmount: entity.total_amount,
      items: entity.items?.map(item => ({
        productId: item.product_id,
        productName: item.product_name,
        quantity: item.quantity,
        totalAmount: item.total_amount,
      })) || [],
    }));
  }

  async getInvoiceSummary(startDate: Date, endDate: Date, status?: string, customerId?: string): Promise<any> {
    const queryBuilder = this.repository.createQueryBuilder('invoice')
      .where('invoice.invoice_date BETWEEN :startDate AND :endDate', { startDate, endDate });

    if (status) {
      queryBuilder.andWhere('invoice.status = :status', { status });
    }

    if (customerId) {
      queryBuilder.andWhere('invoice.customer_id = :customerId', { customerId });
    }

    const invoices = await queryBuilder.getMany();

    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.total_amount, 0);
    const paidAmount = invoices.reduce((sum, invoice) => sum + invoice.paid_amount, 0);
    const outstandingAmount = totalAmount - paidAmount;
    const overdueAmount = invoices
      .filter(invoice => invoice.status_id === 4) // OVERDUE status ID
      .reduce((sum, invoice) => sum + invoice.balance_amount, 0);

    const invoicesByStatus = invoices.reduce((acc, invoice) => {
      acc[invoice.status_id] = (acc[invoice.status_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate average payment time (mock implementation)
    const averagePaymentTime = 15; // days

    return {
      totalInvoices,
      totalAmount,
      paidAmount,
      outstandingAmount,
      overdueAmount,
      averagePaymentTime,
      invoicesByStatus,
    };
  }

  private toDomain(entity: InvoiceEntity): InvoiceDomain {
    return new InvoiceDomain(
      entity.id,
      entity.invoice_number,
      this.numberToType(entity.type_id),
      this.numberToStatus(entity.status_id),
      entity.customer_id,
      entity.customer_name,
      entity.customer_email,
      entity.customer_address,
      entity.customer_tax_code,
      entity.order_id,
      entity.order_number,
      entity.invoice_date,
      entity.due_date,
      entity.subtotal,
      entity.tax_amount,
      entity.discount_amount,
      entity.total_amount,
      entity.paid_amount,
      entity.balance_amount,
      entity.currency,
      entity.exchange_rate,
      entity.notes,
      entity.terms_conditions,
      entity.created_by,
      entity.sent_by,
      entity.sent_at,
      entity.paid_by,
      entity.paid_at,
      entity.created_at,
      entity.updated_at,
    );
  }

  private toEntity(invoice: InvoiceDomain): InvoiceEntity {
    const entity = new InvoiceEntity();
    entity.id = invoice.id;
    entity.invoice_number = invoice.invoiceNumber;
    entity.type_id = this.typeToNumber(invoice.type);
    entity.status_id = this.statusToNumber(invoice.status);
    entity.customer_id = invoice.customerId;
    entity.customer_name = invoice.customerName;
    entity.customer_email = invoice.customerEmail;
    entity.customer_address = invoice.customerAddress;
    entity.customer_tax_code = invoice.customerTaxCode;
    entity.order_id = invoice.orderId;
    entity.order_number = invoice.orderNumber;
    entity.invoice_date = invoice.invoiceDate;
    entity.due_date = invoice.dueDate;
    entity.subtotal = invoice.subtotal;
    entity.tax_amount = invoice.taxAmount;
    entity.discount_amount = invoice.discountAmount;
    entity.total_amount = invoice.totalAmount;
    entity.paid_amount = invoice.paidAmount;
    entity.balance_amount = invoice.balanceAmount;
    entity.currency = invoice.currency;
    entity.exchange_rate = invoice.exchangeRate;
    entity.notes = invoice.notes;
    entity.terms_conditions = invoice.termsConditions;
    entity.created_by = invoice.createdBy;
    entity.sent_by = invoice.sentBy;
    entity.sent_at = invoice.sentAt;
    entity.paid_by = invoice.paidBy;
    entity.paid_at = invoice.paidAt;
    return entity;
  }

  private numberToStatus(statusId: number): DomainInvoiceStatus {
    const statusMap: Record<number, DomainInvoiceStatus> = {
      1: DomainInvoiceStatus.DRAFT,
      2: DomainInvoiceStatus.SENT,
      3: DomainInvoiceStatus.PAID,
      4: DomainInvoiceStatus.OVERDUE,
      5: DomainInvoiceStatus.CANCELLED,
    };
    return statusMap[statusId] || DomainInvoiceStatus.DRAFT;
  }

  private statusToNumber(status: DomainInvoiceStatus): number {
    const statusMap: Record<DomainInvoiceStatus, number> = {
      [DomainInvoiceStatus.DRAFT]: 1,
      [DomainInvoiceStatus.SENT]: 2,
      [DomainInvoiceStatus.PAID]: 3,
      [DomainInvoiceStatus.OVERDUE]: 4,
      [DomainInvoiceStatus.CANCELLED]: 5,
    };
    return statusMap[status] || 1;
  }

  private numberToType(typeId: number): DomainInvoiceType {
    const typeMap: Record<number, DomainInvoiceType> = {
      1: DomainInvoiceType.SALES,
      2: DomainInvoiceType.PURCHASE,
      3: DomainInvoiceType.CREDIT_NOTE,
      4: DomainInvoiceType.DEBIT_NOTE,
    };
    return typeMap[typeId] || DomainInvoiceType.SALES;
  }

  private typeToNumber(type: DomainInvoiceType): number {
    const typeMap: Record<DomainInvoiceType, number> = {
      [DomainInvoiceType.SALES]: 1,
      [DomainInvoiceType.PURCHASE]: 2,
      [DomainInvoiceType.CREDIT_NOTE]: 3,
      [DomainInvoiceType.DEBIT_NOTE]: 4,
    };
    return typeMap[type] || 1;
  }
}
