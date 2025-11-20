import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

/**
 * Phase 1: Sales Management Tables
 * 
 * Migration: Create quotes, quote_items, deliveries, delivery_items tables
 * and add order_type to sales_orders
 * 
 * Epic: EPIC-004 - Sales Management
 * Priority: High
 * 
 * Steps:
 * 1. Create quotes table
 * 2. Create quote_items table
 * 3. Create deliveries table
 * 4. Create delivery_items table
 * 5. Alter sales_orders - add order_type
 */

export class Phase1SalesManagementTables20251119000001 implements MigrationInterface {
    name = 'Phase1SalesManagementTables20251119000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Step 1: Create quotes table
        await queryRunner.createTable(
            new Table({
                name: 'quotes',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                    },
                    {
                        name: 'quote_number',
                        type: 'varchar',
                        length: '50',
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: 'customer_id',
                        type: 'varchar',
                        length: '36',
                        isNullable: false,
                        collation: 'utf8mb4_unicode_ci',
                    },
                    {
                        name: 'quote_date',
                        type: 'date',
                        isNullable: false,
                    },
                    {
                        name: 'valid_until',
                        type: 'date',
                        isNullable: false,
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CONVERTED'],
                        default: "'DRAFT'",
                    },
                    {
                        name: 'subtotal',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
                        default: 0.00,
                        isNullable: false,
                    },
                    {
                        name: 'tax_amount',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
                        default: 0.00,
                        isNullable: false,
                    },
                    {
                        name: 'discount_amount',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
                        default: 0.00,
                        isNullable: false,
                    },
                    {
                        name: 'total_amount',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
                        default: 0.00,
                        isNullable: false,
                    },
                    {
                        name: 'currency',
                        type: 'varchar',
                        length: '3',
                        default: "'VND'",
                        isNullable: false,
                    },
                    {
                        name: 'notes',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'terms_conditions',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'converted_to_order_id',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'created_by',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'sent_by',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'sent_at',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true
        );

        // Add foreign keys for quotes
        await queryRunner.createForeignKey(
            'quotes',
            new TableForeignKey({
                columnNames: ['customer_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'customers',
                onDelete: 'RESTRICT',
            })
        );

        await queryRunner.createForeignKey(
            'quotes',
            new TableForeignKey({
                columnNames: ['converted_to_order_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'sales_orders',
                onDelete: 'SET NULL',
            })
        );

        // Add indexes for quotes
        await queryRunner.createIndex(
            'quotes',
            new TableIndex({
                name: 'idx_quotes_customer',
                columnNames: ['customer_id'],
            })
        );

        await queryRunner.createIndex(
            'quotes',
            new TableIndex({
                name: 'idx_quotes_status',
                columnNames: ['status'],
            })
        );

        await queryRunner.createIndex(
            'quotes',
            new TableIndex({
                name: 'idx_quotes_date',
                columnNames: ['quote_date'],
            })
        );

        // Step 2: Create quote_items table
        await queryRunner.createTable(
            new Table({
                name: 'quote_items',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                    },
                    {
                        name: 'quote_id',
                        type: 'varchar',
                        length: '36',
                        collation: 'utf8mb4_unicode_ci',
                        isNullable: false,
                    },
                    {
                        name: 'product_id',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'product_sku',
                        type: 'varchar',
                        length: '100',
                        isNullable: false,
                    },
                    {
                        name: 'product_name',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'quantity',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'unit',
                        type: 'varchar',
                        length: '20',
                        isNullable: true,
                    },
                    {
                        name: 'unit_price',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
                        isNullable: false,
                    },
                    {
                        name: 'discount_percentage',
                        type: 'decimal',
                        precision: 5,
                        scale: 2,
                        default: 0.00,
                    },
                    {
                        name: 'discount_amount',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
                        default: 0.00,
                    },
                    {
                        name: 'line_total',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
                        isNullable: false,
                    },
                    {
                        name: 'notes',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true
        );

        // Add foreign keys for quote_items
        await queryRunner.createForeignKey(
            'quote_items',
            new TableForeignKey({
                columnNames: ['quote_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'quotes',
                onDelete: 'CASCADE',
            })
        );

        await queryRunner.createForeignKey(
            'quote_items',
            new TableForeignKey({
                columnNames: ['product_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'products',
                onDelete: 'RESTRICT',
            })
        );

        // Add indexes for quote_items
        await queryRunner.createIndex(
            'quote_items',
            new TableIndex({
                name: 'idx_quote_items_quote',
                columnNames: ['quote_id'],
            })
        );

        await queryRunner.createIndex(
            'quote_items',
            new TableIndex({
                name: 'idx_quote_items_product',
                columnNames: ['product_id'],
            })
        );

        // Step 3: Create deliveries table
        await queryRunner.createTable(
            new Table({
                name: 'deliveries',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                    },
                    {
                        name: 'delivery_number',
                        type: 'varchar',
                        length: '50',
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: 'sales_order_id',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'warehouse_id',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'delivery_date',
                        type: 'date',
                        isNullable: false,
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: ['DRAFT', 'SCHEDULED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'],
                        default: "'DRAFT'",
                    },
                    {
                        name: 'delivery_method',
                        type: 'varchar',
                        length: '50',
                        isNullable: true,
                    },
                    {
                        name: 'vehicle_number',
                        type: 'varchar',
                        length: '50',
                        isNullable: true,
                    },
                    {
                        name: 'driver_name',
                        type: 'varchar',
                        length: '100',
                        isNullable: true,
                    },
                    {
                        name: 'driver_phone',
                        type: 'varchar',
                        length: '20',
                        isNullable: true,
                    },
                    {
                        name: 'tracking_number',
                        type: 'varchar',
                        length: '200',
                        isNullable: true,
                    },
                    {
                        name: 'delivered_at',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'delivered_by',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                    },
                    {
                        name: 'customer_signature',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'notes',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'created_by',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true
        );

        // Add foreign keys for deliveries
        await queryRunner.createForeignKey(
            'deliveries',
            new TableForeignKey({
                columnNames: ['sales_order_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'sales_orders',
                onDelete: 'RESTRICT',
            })
        );

        await queryRunner.createForeignKey(
            'deliveries',
            new TableForeignKey({
                columnNames: ['warehouse_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'warehouses',
                onDelete: 'RESTRICT',
            })
        );

        // Add indexes for deliveries
        await queryRunner.createIndex(
            'deliveries',
            new TableIndex({
                name: 'idx_deliveries_order',
                columnNames: ['sales_order_id'],
            })
        );

        await queryRunner.createIndex(
            'deliveries',
            new TableIndex({
                name: 'idx_deliveries_status',
                columnNames: ['status'],
            })
        );

        await queryRunner.createIndex(
            'deliveries',
            new TableIndex({
                name: 'idx_deliveries_date',
                columnNames: ['delivery_date'],
            })
        );

        // Step 4: Create delivery_items table
        await queryRunner.createTable(
            new Table({
                name: 'delivery_items',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                    },
                    {
                        name: 'delivery_id',
                        type: 'varchar',
                        length: '36',
                        collation: 'utf8mb4_unicode_ci',
                        isNullable: false,
                    },
                    {
                        name: 'product_id',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'product_sku',
                        type: 'varchar',
                        length: '100',
                        isNullable: false,
                    },
                    {
                        name: 'product_name',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'quantity',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'unit',
                        type: 'varchar',
                        length: '20',
                        isNullable: true,
                    },
                    {
                        name: 'notes',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true
        );

        // Add foreign keys for delivery_items
        await queryRunner.createForeignKey(
            'delivery_items',
            new TableForeignKey({
                columnNames: ['delivery_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'deliveries',
                onDelete: 'CASCADE',
            })
        );

        await queryRunner.createForeignKey(
            'delivery_items',
            new TableForeignKey({
                columnNames: ['product_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'products',
                onDelete: 'RESTRICT',
            })
        );

        // Add indexes for delivery_items
        await queryRunner.createIndex(
            'delivery_items',
            new TableIndex({
                name: 'idx_delivery_items_delivery',
                columnNames: ['delivery_id'],
            })
        );

        // Step 5: Alter sales_orders - add order_type
        await queryRunner.query(`
            ALTER TABLE sales_orders 
            ADD COLUMN order_type ENUM('RETAIL', 'WHOLESALE', 'FOC', 'GIFT', 'DEMO', 'CONSIGNMENT', 'SAMPLE', 'RETURN') 
            NOT NULL DEFAULT 'RETAIL' AFTER status
        `);

        await queryRunner.createIndex(
            'sales_orders',
            new TableIndex({
                name: 'idx_sales_orders_type',
                columnNames: ['order_type'],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop in reverse order
        await queryRunner.dropIndex('sales_orders', 'idx_sales_orders_type');
        await queryRunner.query(`ALTER TABLE sales_orders DROP COLUMN order_type`);

        await queryRunner.dropTable('delivery_items');
        await queryRunner.dropTable('deliveries');
        await queryRunner.dropTable('quote_items');
        await queryRunner.dropTable('quotes');
    }
}

