import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Inventory as InventoryEntity } from '../../../infrastructure/database/entities/inventory.entity';
import { Warehouse } from '../../../infrastructure/database/entities/warehouse.entity';
import { GetInventorySummaryQueryDto, InventorySummaryResponseDto, InventorySummaryItemDto, InventorySummaryStatisticsDto } from '../../dtos/inventory-summary.dto';

@Injectable()
export class GetInventorySummaryUseCase {
  constructor(
    @InjectRepository(InventoryEntity)
    private readonly inventoryRepo: Repository<InventoryEntity>,
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
    private readonly dataSource: DataSource,
  ) {}

  async execute(query: GetInventorySummaryQueryDto): Promise<InventorySummaryResponseDto> {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const offset = (page - 1) * limit;

    // Build base query using raw SQL for better performance with joins
    let baseQuery = `
      SELECT 
        p.id as productId,
        p.sku as productSku,
        p.name as productName,
        COALESCE(p.unit, '') as unit,
        cat.id as categoryId,
        cat.name as categoryName,
        w.id as warehouseId,
        w.code as warehouseCode,
        w.name as warehouseName,
        inv.quantity_on_hand as quantityOnHand,
        COALESCE(inv.quantity_virtual, 0) as quantityVirtual,
        COALESCE(inv.quantity_on_loan_out, 0) as quantityOnLoanOut,
        COALESCE(inv.quantity_on_loan_in, 0) as quantityOnLoanIn
      FROM inventory inv
      INNER JOIN products p ON p.id = inv.product_id
      LEFT JOIN cat_product_categories cat ON cat.id = p.category_id
      LEFT JOIN warehouses w ON w.id = inv.warehouse_id
      WHERE 1=1
    `;

    const params: any[] = [];

    // Apply filters
    if (query.search) {
      baseQuery += ` AND (p.sku LIKE ? OR p.name LIKE ?)`;
      const searchPattern = `%${query.search}%`;
      params.push(searchPattern, searchPattern);
    }

    if (query.categoryId) {
      baseQuery += ` AND cat.id = ?`;
      params.push(query.categoryId);
    }

    if (query.warehouseId) {
      baseQuery += ` AND w.id = ?`;
      params.push(query.warehouseId);
    }

    // Ensure we only get inventory records that have warehouse (not null)
    baseQuery += ` AND w.id IS NOT NULL`;

    // Get total count - count distinct products
    // Build count query with same filters but count distinct products
    let countQuery = `
      SELECT COUNT(DISTINCT p.id) as total 
      FROM inventory inv
      INNER JOIN products p ON p.id = inv.product_id
      LEFT JOIN cat_product_categories cat ON cat.id = p.category_id
      LEFT JOIN warehouses w ON w.id = inv.warehouse_id
      WHERE 1=1
    `;
    
    const countParams: any[] = [];
    
    // Apply same filters for count query
    if (query.search) {
      countQuery += ` AND (p.sku LIKE ? OR p.name LIKE ?)`;
      const searchPattern = `%${query.search}%`;
      countParams.push(searchPattern, searchPattern);
    }
    
    if (query.categoryId) {
      countQuery += ` AND cat.id = ?`;
      countParams.push(query.categoryId);
    }
    
    if (query.warehouseId) {
      countQuery += ` AND w.id = ?`;
      countParams.push(query.warehouseId);
    }
    
    // Ensure we only count inventory records that have warehouse (not null)
    countQuery += ` AND w.id IS NOT NULL`;
    
    const countResult = await this.dataSource.query(countQuery, countParams);
    const total = parseInt(countResult[0]?.total || '0');

    // Get all results to group by product
    const rawResults = await this.dataSource.query(baseQuery, params);

    // Group by product and aggregate warehouse data
    const productMap = new Map<number, InventorySummaryItemDto>();
    const productWarehouseMap = new Map<number, number>(); // Track warehouseId for each product

    for (const row of rawResults) {
      const productId = row.productId;
      
      if (!productMap.has(productId)) {
        // Store warehouseId for this product (use filtered warehouseId if available, otherwise first one)
        const warehouseId = query.warehouseId || row.warehouseId;
        if (warehouseId && !productWarehouseMap.has(productId)) {
          productWarehouseMap.set(productId, warehouseId);
        }
        
        productMap.set(productId, {
          productId: row.productId,
          productSku: row.productSku,
          productName: row.productName,
          unit: row.unit || '',
          categoryId: row.categoryId,
          categoryName: row.categoryName,
          quantityOnHand: 0,
          virtualWarehouse: 0,
          onLoanOut: 0,
          onLoanIn: 0,
          totalOwned: 0,
        });
      } else {
        // Store warehouseId if not set yet
        const warehouseId = query.warehouseId || row.warehouseId;
        if (warehouseId && !productWarehouseMap.has(productId)) {
          productWarehouseMap.set(productId, warehouseId);
        }
      }

      const item = productMap.get(productId)!;
      const quantityOnHand = parseFloat(row.quantityOnHand) || 0;
      const quantityVirtual = parseFloat(row.quantityVirtual) || 0;
      const quantityOnLoanOut = parseFloat(row.quantityOnLoanOut) || 0;
      const quantityOnLoanIn = parseFloat(row.quantityOnLoanIn) || 0;

      // Tổng hợp tồn kho thực tế (cộng dồn từ tất cả warehouse của cùng product)
      item.quantityOnHand += quantityOnHand;
      
      // Tổng hợp các loại tồn kho khác (cộng dồn từ tất cả warehouse của cùng product)
      item.virtualWarehouse += quantityVirtual;
      item.onLoanOut += quantityOnLoanOut;
      item.onLoanIn += quantityOnLoanIn;
    }

    // Calculate total owned for each product
    for (const item of productMap.values()) {
      item.totalOwned = item.quantityOnHand + item.virtualWarehouse - item.onLoanOut + item.onLoanIn;
    }

    // Convert map to array and assign warehouseId
    let items = Array.from(productMap.values());
    
    // Assign warehouseId to each item
    for (const item of items) {
      item.warehouseId = productWarehouseMap.get(item.productId);
    }
    
    // Apply pagination after grouping
    const startIndex = offset;
    const endIndex = offset + limit;
    items = items.slice(startIndex, endIndex);

    // Get statistics
    const statistics = await this.getStatistics();

    return {
      statistics,
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private async getStatistics(): Promise<InventorySummaryStatisticsDto> {
    // Total products with inventory
    const totalProductsResult = await this.dataSource.query(`
      SELECT COUNT(DISTINCT inv.product_id) as total
      FROM inventory inv
      WHERE inv.quantity_on_hand > 0
        OR COALESCE(inv.quantity_virtual, 0) > 0
        OR COALESCE(inv.quantity_on_loan_out, 0) > 0
        OR COALESCE(inv.quantity_on_loan_in, 0) > 0
    `);
    const totalProducts = parseInt(totalProductsResult[0]?.total || '0');

    // Pending orders (from sales_orders where status = 'PENDING')
    const pendingOrdersResult = await this.dataSource.query(`
      SELECT COUNT(*) as total
      FROM sales_orders
      WHERE status = 'PENDING'
    `).catch(() => [{ total: '0' }]);
    const pendingOrders = parseInt(pendingOrdersResult[0]?.total || '0');

    // Low stock products (quantity_available <= reorder_point)
    const lowStockResult = await this.dataSource.query(`
      SELECT COUNT(DISTINCT inv.product_id) as total
      FROM inventory inv
      WHERE inv.quantity_available <= inv.reorder_point
        AND inv.reorder_point > 0
    `);
    const lowStockProducts = parseInt(lowStockResult[0]?.total || '0');

    // Expiring products (from inventory_batches if exists, otherwise 0)
    const expiringProductsResult = await this.dataSource.query(`
      SELECT COUNT(DISTINCT ib.product_id) as total
      FROM inventory_batches ib
      WHERE ib.expiry_date IS NOT NULL
        AND ib.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        AND ib.expiry_date > CURDATE()
        AND ib.quantity > 0
    `).catch(() => [{ total: '0' }]);
    const expiringProducts = parseInt(expiringProductsResult[0]?.total || '0');

    return {
      totalProducts,
      pendingOrders,
      lowStockProducts,
      expiringProducts,
    };
  }
}
