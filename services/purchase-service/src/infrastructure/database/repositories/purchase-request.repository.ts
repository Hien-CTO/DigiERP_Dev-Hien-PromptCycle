import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PurchaseRequest as PurchaseRequestEntity,
  PurchaseRequestStatusEnum,
} from '../entities/purchase-request.entity';
import { PurchaseRequestItem } from '../entities/purchase-request-item.entity';
import { PurchaseRequestRepository } from '../../../domain/repositories/purchase-request.repository.interface';
import {
  PurchaseRequest as PurchaseRequestDomain,
  PurchaseRequestStatus as DomainPurchaseRequestStatus,
} from '../../../domain/entities/purchase-request.entity';

@Injectable()
export class TypeOrmPurchaseRequestRepository implements PurchaseRequestRepository {
  constructor(
    @InjectRepository(PurchaseRequestEntity)
    private readonly repository: Repository<PurchaseRequestEntity>,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
    warehouseId?: string,
  ): Promise<{ data: PurchaseRequestDomain[]; total: number }> {
    const queryBuilder = this.repository
      .createQueryBuilder('pr')
      .leftJoinAndSelect('pr.items', 'items')
      .orderBy('pr.created_at', 'DESC');

    if (search) {
      queryBuilder.where(
        'pr.request_number LIKE :search OR pr.reason LIKE :search OR pr.notes LIKE :search',
        { search: `%${search}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('pr.status = :status', { status });
    }

    if (warehouseId) {
      queryBuilder.andWhere('pr.warehouse_id = :warehouseId', { warehouseId });
    }

    const total = await queryBuilder.getCount();

    const entities = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: entities.map((entity) => this.toDomain(entity)),
      total,
    };
  }

  async findById(id: string): Promise<PurchaseRequestDomain | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['items'],
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByRequestNumber(requestNumber: string): Promise<PurchaseRequestDomain | null> {
    const entity = await this.repository.findOne({
      where: { request_number: requestNumber },
      relations: ['items'],
    });
    return entity ? this.toDomain(entity) : null;
  }

  async create(purchaseRequest: PurchaseRequestDomain): Promise<PurchaseRequestDomain> {
    const entity = this.toEntity(purchaseRequest);

    // Tạo items entities nếu có
    if (purchaseRequest.items && purchaseRequest.items.length > 0) {
      entity.items = purchaseRequest.items.map((item) => {
        const itemEntity = new PurchaseRequestItem();
        itemEntity.product_id = item.productId;
        itemEntity.product_name = item.productName;
        itemEntity.product_sku = item.productSku;
        itemEntity.quantity = item.quantity;
        itemEntity.unit = item.unit;
        itemEntity.estimated_unit_cost = item.estimatedUnitCost;
        itemEntity.notes = item.notes;
        return itemEntity;
      });
    }

    const savedEntity = await this.repository.save(entity);

    // Load lại với relations để có items
    const entityWithRelations = await this.repository.findOne({
      where: { id: savedEntity.id },
      relations: ['items'],
    });

    return entityWithRelations ? this.toDomain(entityWithRelations) : this.toDomain(savedEntity);
  }

  async update(purchaseRequest: PurchaseRequestDomain): Promise<PurchaseRequestDomain> {
    const entity = this.toEntity(purchaseRequest);

    // Update items
    if (purchaseRequest.items && purchaseRequest.items.length > 0) {
      // Delete existing items
      await this.repository.manager.delete(PurchaseRequestItem, {
        purchase_request_id: purchaseRequest.id,
      });

      // Create new items
      entity.items = purchaseRequest.items.map((item) => {
        const itemEntity = new PurchaseRequestItem();
        itemEntity.id = item.id || undefined;
        itemEntity.purchase_request_id = purchaseRequest.id;
        itemEntity.product_id = item.productId;
        itemEntity.product_name = item.productName;
        itemEntity.product_sku = item.productSku;
        itemEntity.quantity = item.quantity;
        itemEntity.unit = item.unit;
        itemEntity.estimated_unit_cost = item.estimatedUnitCost;
        itemEntity.notes = item.notes;
        return itemEntity;
      });
    }

    const savedEntity = await this.repository.save(entity);

    // Load lại với relations
    const entityWithRelations = await this.repository.findOne({
      where: { id: savedEntity.id },
      relations: ['items'],
    });

    return entityWithRelations ? this.toDomain(entityWithRelations) : this.toDomain(savedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async generateRequestNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');

    // Find the last request number for this month
    const lastRequest = await this.repository
      .createQueryBuilder('pr')
      .where('pr.request_number LIKE :pattern', { pattern: `PR-${year}${month}-%` })
      .orderBy('pr.request_number', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastRequest) {
      const lastSequence = parseInt(lastRequest.request_number.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `PR-${year}${month}-${String(sequence).padStart(3, '0')}`;
  }

  private toDomain(entity: PurchaseRequestEntity): PurchaseRequestDomain {
    return new PurchaseRequestDomain(
      entity.id,
      entity.request_number,
      entity.warehouse_id,
      this.enumToDomainStatus(entity.status),
      entity.request_date,
      entity.reason,
      entity.requested_by,
      entity.required_date,
      entity.notes,
      entity.approved_by,
      entity.rejected_by,
      entity.approved_at,
      entity.rejected_at,
      entity.rejection_reason,
      entity.items?.map((item) => ({
        id: item.id,
        purchaseRequestId: item.purchase_request_id,
        productId: Number(item.product_id),
        productName: item.product_name,
        productSku: item.product_sku,
        quantity: Number(item.quantity),
        unit: item.unit,
        estimatedUnitCost: item.estimated_unit_cost ? Number(item.estimated_unit_cost) : undefined,
        notes: item.notes,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      })) || [],
      entity.created_at,
      entity.updated_at,
    );
  }

  private toEntity(purchaseRequest: PurchaseRequestDomain): PurchaseRequestEntity {
    const entity = new PurchaseRequestEntity();
    // Only set id if it's a valid UUID (not empty string) - let TypeORM generate UUID for new entities
    if (purchaseRequest.id && purchaseRequest.id.trim() !== '') {
      entity.id = purchaseRequest.id;
    }
    entity.request_number = purchaseRequest.requestNumber;
    entity.warehouse_id = purchaseRequest.warehouseId;
    entity.status = this.domainStatusToEnum(purchaseRequest.status);
    entity.request_date = purchaseRequest.requestDate;
    entity.required_date = purchaseRequest.requiredDate;
    entity.reason = purchaseRequest.reason;
    entity.notes = purchaseRequest.notes;
    entity.requested_by = purchaseRequest.requestedBy;
    entity.approved_by = purchaseRequest.approvedBy;
    entity.rejected_by = purchaseRequest.rejectedBy;
    entity.approved_at = purchaseRequest.approvedAt;
    entity.rejected_at = purchaseRequest.rejectedAt;
    entity.rejection_reason = purchaseRequest.rejectionReason;
    return entity;
  }

  private enumToDomainStatus(status: PurchaseRequestStatusEnum): DomainPurchaseRequestStatus {
    const statusMap: Record<PurchaseRequestStatusEnum, DomainPurchaseRequestStatus> = {
      [PurchaseRequestStatusEnum.DRAFT]: DomainPurchaseRequestStatus.DRAFT,
      [PurchaseRequestStatusEnum.PENDING_APPROVAL]: DomainPurchaseRequestStatus.PENDING_APPROVAL,
      [PurchaseRequestStatusEnum.APPROVED]: DomainPurchaseRequestStatus.APPROVED,
      [PurchaseRequestStatusEnum.REJECTED]: DomainPurchaseRequestStatus.REJECTED,
      [PurchaseRequestStatusEnum.CANCELLED]: DomainPurchaseRequestStatus.CANCELLED,
    };
    return statusMap[status] || DomainPurchaseRequestStatus.DRAFT;
  }

  private domainStatusToEnum(status: DomainPurchaseRequestStatus): PurchaseRequestStatusEnum {
    const statusMap: Record<DomainPurchaseRequestStatus, PurchaseRequestStatusEnum> = {
      [DomainPurchaseRequestStatus.DRAFT]: PurchaseRequestStatusEnum.DRAFT,
      [DomainPurchaseRequestStatus.PENDING_APPROVAL]: PurchaseRequestStatusEnum.PENDING_APPROVAL,
      [DomainPurchaseRequestStatus.APPROVED]: PurchaseRequestStatusEnum.APPROVED,
      [DomainPurchaseRequestStatus.REJECTED]: PurchaseRequestStatusEnum.REJECTED,
      [DomainPurchaseRequestStatus.CANCELLED]: PurchaseRequestStatusEnum.CANCELLED,
    };
    return statusMap[status] || PurchaseRequestStatusEnum.DRAFT;
  }
}

