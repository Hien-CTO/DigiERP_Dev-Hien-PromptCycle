import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder as PurchaseOrderEntity, PurchaseOrderStatusEnum } from '../entities/purchase-order.entity';
import { PurchaseOrderItem } from '../entities/purchase-order-item.entity';
import { PurchaseOrderImporter } from '../entities/purchase-order-importer.entity';
import { PurchaseOrderRepository } from '../../../domain/repositories/purchase-order.repository.interface';
import { PurchaseOrder as PurchaseOrderDomain, PurchaseOrderStatus as DomainPurchaseOrderStatus } from '../../../domain/entities/purchase-order.entity';

@Injectable()
export class TypeOrmPurchaseOrderRepository implements PurchaseOrderRepository {
  constructor(
    @InjectRepository(PurchaseOrderEntity)
    private readonly repository: Repository<PurchaseOrderEntity>,
  ) {}

  async findAll(page: number = 1, limit: number = 10, search?: string): Promise<PurchaseOrderDomain[]> {
    const queryBuilder = this.repository.createQueryBuilder('po')
      .leftJoinAndSelect('po.items', 'items')
      .leftJoinAndSelect('po.supplier', 'supplier')
      .leftJoinAndSelect('po.importer', 'importer')
      .orderBy('po.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      queryBuilder.where(
        'po.order_number LIKE :search OR po.notes LIKE :search OR supplier.name LIKE :search',
        { search: `%${search}%` }
      );
    }

    const entities = await queryBuilder.getMany();
    return entities.map(entity => this.toDomain(entity));
  }

  async findById(id: string): Promise<PurchaseOrderDomain | null> {
    const entity = await this.repository.findOne({ 
      where: { id },
      relations: ['items', 'supplier', 'importer']
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByOrderNumber(orderNumber: string): Promise<PurchaseOrderDomain | null> {
    const entity = await this.repository.findOne({ 
      where: { order_number: orderNumber },
      relations: ['items', 'importer']
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findBySupplierId(supplierId: number): Promise<PurchaseOrderDomain[]> {
    const entities = await this.repository.find({ 
      where: { supplier_id: supplierId },
      relations: ['items', 'importer']
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findByStatus(status: DomainPurchaseOrderStatus): Promise<PurchaseOrderDomain[]> {
    const entities = await this.repository.find({ 
      where: { status: this.domainStatusToEnum(status) },
      relations: ['items', 'importer']
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async create(purchaseOrder: PurchaseOrderDomain, purchaseRequestId?: string): Promise<PurchaseOrderDomain> {
    const entity = this.toEntity(purchaseOrder);
    
    // Set purchase_request_id if provided
    if (purchaseRequestId) {
      entity.purchase_request_id = purchaseRequestId;
    }
    
    // Save entity first to get ID
    const savedEntity = await this.repository.save(entity);
    
    // Tạo items entities nếu có - phải set purchase_order_id sau khi có ID
    if (purchaseOrder.items && purchaseOrder.items.length > 0) {
      const itemEntities = purchaseOrder.items.map(item => {
        const itemEntity = new PurchaseOrderItem();
        itemEntity.purchase_order_id = savedEntity.id; // Set purchase_order_id
        itemEntity.product_id = item.productId;
        itemEntity.product_name = item.productName;
        itemEntity.product_sku = item.productSku;
        itemEntity.quantity = item.quantity;
        itemEntity.unit = item.unit;
        itemEntity.unit_cost = item.unitCost;
        itemEntity.total_amount = item.totalAmount;
        itemEntity.discount_percentage = item.discountPercentage || 0;
        itemEntity.discount_amount = item.discountAmount || 0;
        itemEntity.tax_percentage = item.taxPercentage || 0;
        itemEntity.tax_amount = item.taxAmount || 0;
        itemEntity.notes = item.notes;
        return itemEntity;
      });
      
      // Save items
      const itemRepository = this.repository.manager.getRepository(PurchaseOrderItem);
      await itemRepository.save(itemEntities);
    }
    
    // Load lại với relations để có items
    const entityWithRelations = await this.repository.findOne({
      where: { id: savedEntity.id },
      relations: ['items', 'supplier', 'importer']
    });
    
    return entityWithRelations ? this.toDomain(entityWithRelations) : this.toDomain(savedEntity);
  }

  async save(purchaseOrder: PurchaseOrderDomain): Promise<PurchaseOrderDomain> {
    const entity = this.toEntity(purchaseOrder);
    const savedEntity = await this.repository.save(entity);
    return this.toDomain(savedEntity);
  }

  async update(id: string, updateData: Partial<PurchaseOrderDomain>): Promise<PurchaseOrderDomain> {
    // Convert domain object to entity format for update
    const entityData: any = {};
    if (updateData.supplierId) entityData.supplier_id = updateData.supplierId;
    if (updateData.warehouseId) entityData.warehouse_id = updateData.warehouseId;
    if (updateData.status) entityData.status = this.domainStatusToEnum(updateData.status);
    if (updateData.orderDate) entityData.order_date = updateData.orderDate;
    if (updateData.expectedDeliveryDate) entityData.expected_delivery_date = updateData.expectedDeliveryDate;
    if (updateData.predictedArrivalDate !== undefined) entityData.predicted_arrival_date = updateData.predictedArrivalDate;
    if (updateData.totalAmount !== undefined) entityData.total_amount = updateData.totalAmount;
    if (updateData.taxAmount !== undefined) entityData.tax_amount = updateData.taxAmount;
    if (updateData.discountAmount !== undefined) entityData.discount_amount = updateData.discountAmount;
    if (updateData.finalAmount !== undefined) entityData.final_amount = updateData.finalAmount;
    if (updateData.notes !== undefined) entityData.notes = updateData.notes;
    if (updateData.paymentTerm !== undefined) entityData.payment_term = updateData.paymentTerm;
    if (updateData.paymentMethod !== undefined) entityData.payment_method = updateData.paymentMethod;
    if (updateData.portName !== undefined) entityData.port_name = updateData.portName;
    // updated_by không tồn tại trong database, bỏ qua
    if (updateData.updatedAt) entityData.updated_at = updateData.updatedAt;

    await this.repository.update(id, entityData);
    if (updateData.importer) {
      const importerRepository = this.repository.manager.getRepository(PurchaseOrderImporter);
      let importerEntity = await importerRepository.findOne({ where: { purchase_order_id: id } });
      if (!importerEntity) {
        importerEntity = importerRepository.create({ purchase_order_id: id });
      }
      importerEntity.importer_name = updateData.importer.importerName ?? null;
      importerEntity.importer_phone = updateData.importer.importerPhone ?? null;
      importerEntity.importer_fax = updateData.importer.importerFax ?? null;
      importerEntity.importer_email = updateData.importer.importerEmail ?? null;
      await importerRepository.save(importerEntity);
    }

    const updatedEntity = await this.repository.findOne({ 
      where: { id },
      relations: ['items', 'supplier', 'importer']
    });
    return this.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findPendingOrders(): Promise<PurchaseOrderDomain[]> {
    const entities = await this.repository.find({ 
      where: { status: PurchaseOrderStatusEnum.PENDING },
      relations: ['items', 'importer']
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findApprovedOrders(): Promise<PurchaseOrderDomain[]> {
    const entities = await this.repository.find({ 
      where: { status: PurchaseOrderStatusEnum.APPROVED },
      relations: ['items', 'importer']
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    // Find the last order number for this month
    const lastOrder = await this.repository
      .createQueryBuilder('po')
      .where('po.order_number LIKE :pattern', { pattern: `PO-${year}${month}-%` })
      .orderBy('po.order_number', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.order_number.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `PO-${year}${month}-${String(sequence).padStart(3, '0')}`;
  }

  private toDomain(entity: PurchaseOrderEntity): PurchaseOrderDomain {
    return new PurchaseOrderDomain(
      entity.id,
      entity.order_number,
      Number(entity.supplier_id),
      Number(entity.warehouse_id),
      this.enumToDomainStatus(entity.status),
      entity.order_date,
      entity.expected_delivery_date,
      entity.predicted_arrival_date,
      Number(entity.total_amount),
      Number(entity.tax_amount),
      Number(entity.discount_amount),
      Number(entity.final_amount),
      entity.notes,
      entity.payment_term,
      entity.payment_method,
      entity.port_name,
      entity.importer
        ? {
            importerName: entity.importer.importer_name ?? undefined,
            importerPhone: entity.importer.importer_phone ?? undefined,
            importerFax: entity.importer.importer_fax ?? undefined,
            importerEmail: entity.importer.importer_email ?? undefined,
          }
        : undefined,
      entity.items?.map(item => ({
        id: parseInt(item.id),
        purchaseOrderId: parseInt(item.purchase_order_id),
        productId: Number(item.product_id),
        productName: item.product_name,
        productSku: item.product_sku,
        quantity: Number(item.quantity),
        unit: item.unit,
        unitCost: Number(item.unit_cost),
        totalAmount: Number(item.total_amount),
        discountPercentage: Number(item.discount_percentage),
        discountAmount: Number(item.discount_amount),
        taxPercentage: Number(item.tax_percentage),
        taxAmount: Number(item.tax_amount),
        notes: item.notes,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      })) || [],
      entity.created_by ? parseInt(entity.created_by) : undefined,
      undefined, // updated_by không tồn tại trong database
      entity.approved_by,
      entity.approved_at,
      entity.created_at,
      entity.updated_at,
      entity.purchase_request_id, // Map purchase_request_id
    );
  }

  private toEntity(purchaseOrder: PurchaseOrderDomain): PurchaseOrderEntity {
    const entity = new PurchaseOrderEntity();
    // Only set id if it's a valid UUID (not empty string) - let TypeORM generate UUID for new entities
    if (purchaseOrder.id && purchaseOrder.id.trim() !== '') {
      entity.id = purchaseOrder.id;
    }
    entity.order_number = purchaseOrder.orderNumber;
    entity.supplier_id = purchaseOrder.supplierId;
    entity.warehouse_id = purchaseOrder.warehouseId;
    entity.status = this.domainStatusToEnum(purchaseOrder.status);
    entity.order_date = purchaseOrder.orderDate;
    entity.expected_delivery_date = purchaseOrder.expectedDeliveryDate;
    entity.predicted_arrival_date = purchaseOrder.predictedArrivalDate;
    entity.total_amount = purchaseOrder.totalAmount;
    entity.tax_amount = purchaseOrder.taxAmount;
    entity.discount_amount = purchaseOrder.discountAmount;
    entity.final_amount = purchaseOrder.finalAmount;
    entity.notes = purchaseOrder.notes;
    entity.payment_term = purchaseOrder.paymentTerm;
    entity.payment_method = purchaseOrder.paymentMethod;
    entity.port_name = purchaseOrder.portName;
    entity.created_by = purchaseOrder.createdBy?.toString();
    // updated_by không tồn tại trong database, bỏ qua
    entity.approved_by = purchaseOrder.approvedBy;
    entity.approved_at = purchaseOrder.approvedAt;
    if (purchaseOrder.importer) {
      const importerEntity = new PurchaseOrderImporter();
      importerEntity.importer_name = purchaseOrder.importer.importerName ?? null;
      importerEntity.importer_phone = purchaseOrder.importer.importerPhone ?? null;
      importerEntity.importer_fax = purchaseOrder.importer.importerFax ?? null;
      importerEntity.importer_email = purchaseOrder.importer.importerEmail ?? null;
      entity.importer = importerEntity;
    }
    return entity;
  }

  private enumToDomainStatus(status: PurchaseOrderStatusEnum): DomainPurchaseOrderStatus {
    const statusMap: Record<PurchaseOrderStatusEnum, DomainPurchaseOrderStatus> = {
      [PurchaseOrderStatusEnum.DRAFT]: DomainPurchaseOrderStatus.DRAFT,
      [PurchaseOrderStatusEnum.PENDING]: DomainPurchaseOrderStatus.PENDING,
      [PurchaseOrderStatusEnum.APPROVED]: DomainPurchaseOrderStatus.APPROVED,
      [PurchaseOrderStatusEnum.RECEIVED]: DomainPurchaseOrderStatus.RECEIVED,
      [PurchaseOrderStatusEnum.CANCELLED]: DomainPurchaseOrderStatus.CANCELLED,
    };
    return statusMap[status] || DomainPurchaseOrderStatus.DRAFT;
  }

  private domainStatusToEnum(status: DomainPurchaseOrderStatus): PurchaseOrderStatusEnum {
    const statusMap: Record<DomainPurchaseOrderStatus, PurchaseOrderStatusEnum> = {
      [DomainPurchaseOrderStatus.DRAFT]: PurchaseOrderStatusEnum.DRAFT,
      [DomainPurchaseOrderStatus.PENDING]: PurchaseOrderStatusEnum.PENDING,
      [DomainPurchaseOrderStatus.APPROVED]: PurchaseOrderStatusEnum.APPROVED,
      [DomainPurchaseOrderStatus.RECEIVED]: PurchaseOrderStatusEnum.RECEIVED,
      [DomainPurchaseOrderStatus.CANCELLED]: PurchaseOrderStatusEnum.CANCELLED,
    };
    return statusMap[status] || PurchaseOrderStatusEnum.DRAFT;
  }
}
