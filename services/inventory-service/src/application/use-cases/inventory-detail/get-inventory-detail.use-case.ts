import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { InventoryBatch } from '../../../infrastructure/database/entities/inventory-batch.entity';
import { GetInventoryDetailQueryDto, InventoryDetailResponseDto, InventoryBatchItemDto, InventoryDetailStatisticsDto } from '../../dtos/inventory-detail.dto';

@Injectable()
export class GetInventoryDetailUseCase {
  constructor(
    @InjectRepository(InventoryBatch)
    private readonly batchRepo: Repository<InventoryBatch>,
    private readonly dataSource: DataSource,
  ) {}

  async execute(query: GetInventoryDetailQueryDto): Promise<InventoryDetailResponseDto> {
    // Get product and warehouse info
    const productInfo = await this.dataSource.query(`
      SELECT p.id, p.sku, p.name, COALESCE(p.unit, '') as unit
      FROM products p
      WHERE p.id = ?
    `, [query.productId]).catch(() => []);

    if (!productInfo || productInfo.length === 0) {
      throw new Error('Product not found');
    }

    const product = productInfo[0];

    const warehouseInfo = await this.dataSource.query(`
      SELECT w.id, w.name, w.code
      FROM warehouses w
      WHERE w.id = ? OR w.code = ?
    `, [query.warehouseId, query.warehouseId.toString()]).catch(() => []);

    if (!warehouseInfo || warehouseInfo.length === 0) {
      throw new Error('Warehouse not found');
    }

    const warehouse = warehouseInfo[0];

    // Get warehouse ID or code for querying batches
    // Use warehouse.id (number) for inventory_batches since it uses int
    const warehouseIdForBatches = warehouse.id;
    
    // Build query for batches
    let batchQuery = `
      SELECT 
        ib.id,
        ib.batch_number as batchNumber,
        ib.expiry_date as expiryDate,
        ib.receipt_date as receiptDate,
        ib.quantity,
        ib.location_code as locationCode,
        ib.location_description as locationDescription,
        ib.area_id as areaId,
        a.name as areaName
      FROM inventory_batches ib
      LEFT JOIN areas a ON a.id = ib.area_id
      WHERE ib.product_id = ?
        AND ib.warehouse_id = ?
        AND ib.is_active = 1
    `;

    const params: any[] = [query.productId, warehouseIdForBatches];

    // Apply filters
    if (query.search) {
      batchQuery += ` AND ib.batch_number LIKE ?`;
      params.push(`%${query.search}%`);
    }

    if (query.expiryDateFrom) {
      batchQuery += ` AND (ib.expiry_date IS NULL OR ib.expiry_date >= ?)`;
      params.push(query.expiryDateFrom);
    }

    if (query.expiryDateTo) {
      batchQuery += ` AND (ib.expiry_date IS NULL OR ib.expiry_date <= ?)`;
      params.push(query.expiryDateTo);
    }

    batchQuery += ` ORDER BY ib.receipt_date DESC, ib.expiry_date ASC`;

    const rawBatches = await this.dataSource.query(batchQuery, params);

    const batches: InventoryBatchItemDto[] = rawBatches.map((row: any) => ({
      id: row.id,
      batchNumber: row.batchNumber,
      expiryDate: row.expiryDate ? new Date(row.expiryDate) : undefined,
      receiptDate: new Date(row.receiptDate),
      quantity: parseFloat(row.quantity) || 0,
      locationCode: row.locationCode,
      locationDescription: row.locationDescription,
      areaId: row.areaId,
      areaName: row.areaName,
    }));

    // Calculate statistics
    const totalQuantity = batches.reduce((sum, batch) => sum + batch.quantity, 0);
    const totalBatches = batches.length;

    // Expiring batches (trong vòng 2 tháng)
    const twoMonthsFromNow = new Date();
    twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);
    const expiringBatches = batches.filter(batch => 
      batch.expiryDate && 
      batch.expiryDate <= twoMonthsFromNow && 
      batch.expiryDate > new Date()
    ).length;

    // Pending orders related to this product
    const pendingOrdersResult = await this.dataSource.query(`
      SELECT COUNT(DISTINCT so.id) as total
      FROM sales_orders so
      INNER JOIN sales_order_items soi ON soi.order_id = so.id
      WHERE so.status = 'PENDING'
        AND soi.product_id = ?
    `, [query.productId]).catch(() => [{ total: '0' }]);
    const pendingOrders = parseInt(pendingOrdersResult[0]?.total || '0');

    const statistics: InventoryDetailStatisticsDto = {
      totalQuantity,
      totalBatches,
      expiringBatches,
      pendingOrders,
    };

    return {
      productId: product.id,
      productSku: product.sku,
      productName: product.name,
      unit: product.unit,
      warehouseId: warehouse.id,
      warehouseName: warehouse.name,
      statistics,
      batches,
      totalQuantity,
    };
  }
}

