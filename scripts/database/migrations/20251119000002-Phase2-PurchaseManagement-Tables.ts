import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

/**
 * Phase 2: Purchase Management Tables
 * 
 * Migration: Create purchase_requisitions, purchase_requisition_items, rfqs, rfq_items,
 * quality_inspections, supplier_contracts tables
 * 
 * Epic: EPIC-005 - Purchase Management
 * Priority: High
 * 
 * Steps:
 * 1. Create purchase_requisitions table
 * 2. Create purchase_requisition_items table
 * 3. Create rfqs table
 * 4. Create rfq_items table
 * 5. Create quality_inspections table
 * 6. Create supplier_contracts table
 */

export class Phase2PurchaseManagementTables20251119000002 implements MigrationInterface {
    name = 'Phase2PurchaseManagementTables20251119000002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Step 1: Create purchase_requisitions table
        await queryRunner.createTable(
            new Table({
                name: 'purchase_requisitions',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                    },
                    {
                        name: 'requisition_number',
                        type: 'varchar',
                        length: '50',
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: 'department',
                        type: 'varchar',
                        length: '100',
                        isNullable: true,
                    },
                    {
                        name: 'requested_by',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'request_date',
                        type: 'date',
                        isNullable: false,
                    },
                    {
                        name: 'required_date',
                        type: 'date',
                        isNullable: true,
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'CONVERTED'],
                        default: "'DRAFT'",
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
                        name: 'notes',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'approved_by',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'approved_at',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'converted_to_po_id',
                        type: 'varchar',
                        length: '36',
                        isNullable: true,
                        collation: 'utf8mb4_unicode_ci',
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

        // Add foreign keys for purchase_requisitions
        await queryRunner.createForeignKey(
            'purchase_requisitions',
            new TableForeignKey({
                columnNames: ['requested_by'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'RESTRICT',
            })
        );

        await queryRunner.createForeignKey(
            'purchase_requisitions',
            new TableForeignKey({
                columnNames: ['approved_by'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'SET NULL',
            })
        );

        await queryRunner.createForeignKey(
            'purchase_requisitions',
            new TableForeignKey({
                columnNames: ['converted_to_po_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'purchase_orders',
                onDelete: 'SET NULL',
            })
        );

        // Add indexes for purchase_requisitions
        await queryRunner.createIndex(
            'purchase_requisitions',
            new TableIndex({
                name: 'idx_requisitions_status',
                columnNames: ['status'],
            })
        );

        await queryRunner.createIndex(
            'purchase_requisitions',
            new TableIndex({
                name: 'idx_requisitions_date',
                columnNames: ['request_date'],
            })
        );

        // Step 2: Create purchase_requisition_items table
        await queryRunner.createTable(
            new Table({
                name: 'purchase_requisition_items',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                    },
                    {
                        name: 'requisition_id',
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
                        type: 'decimal',
                        precision: 10,
                        scale: 3,
                        isNullable: false,
                    },
                    {
                        name: 'unit',
                        type: 'varchar',
                        length: '20',
                        isNullable: true,
                    },
                    {
                        name: 'estimated_unit_cost',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
                        isNullable: true,
                    },
                    {
                        name: 'estimated_total',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
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

        // Add foreign keys for purchase_requisition_items
        await queryRunner.createForeignKey(
            'purchase_requisition_items',
            new TableForeignKey({
                columnNames: ['requisition_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'purchase_requisitions',
                onDelete: 'CASCADE',
            })
        );

        await queryRunner.createForeignKey(
            'purchase_requisition_items',
            new TableForeignKey({
                columnNames: ['product_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'products',
                onDelete: 'RESTRICT',
            })
        );

        // Add indexes for purchase_requisition_items
        await queryRunner.createIndex(
            'purchase_requisition_items',
            new TableIndex({
                name: 'idx_requisition_items_requisition',
                columnNames: ['requisition_id'],
            })
        );

        // Step 3: Create rfqs table
        await queryRunner.createTable(
            new Table({
                name: 'rfqs',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                    },
                    {
                        name: 'rfq_number',
                        type: 'varchar',
                        length: '50',
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: 'title',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'rfq_date',
                        type: 'date',
                        isNullable: false,
                    },
                    {
                        name: 'closing_date',
                        type: 'date',
                        isNullable: false,
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: ['DRAFT', 'SENT', 'OPEN', 'CLOSED', 'CANCELLED'],
                        default: "'DRAFT'",
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

        // Add indexes for rfqs
        await queryRunner.createIndex(
            'rfqs',
            new TableIndex({
                name: 'idx_rfqs_status',
                columnNames: ['status'],
            })
        );

        await queryRunner.createIndex(
            'rfqs',
            new TableIndex({
                name: 'idx_rfqs_date',
                columnNames: ['rfq_date'],
            })
        );

        // Step 4: Create rfq_items table
        await queryRunner.createTable(
            new Table({
                name: 'rfq_items',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                    },
                    {
                        name: 'rfq_id',
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
                        type: 'decimal',
                        precision: 10,
                        scale: 3,
                        isNullable: false,
                    },
                    {
                        name: 'unit',
                        type: 'varchar',
                        length: '20',
                        isNullable: true,
                    },
                    {
                        name: 'specifications',
                        type: 'text',
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

        // Add foreign keys for rfq_items
        await queryRunner.createForeignKey(
            'rfq_items',
            new TableForeignKey({
                columnNames: ['rfq_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'rfqs',
                onDelete: 'CASCADE',
            })
        );

        await queryRunner.createForeignKey(
            'rfq_items',
            new TableForeignKey({
                columnNames: ['product_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'products',
                onDelete: 'RESTRICT',
            })
        );

        // Add indexes for rfq_items
        await queryRunner.createIndex(
            'rfq_items',
            new TableIndex({
                name: 'idx_rfq_items_rfq',
                columnNames: ['rfq_id'],
            })
        );

        // Step 5: Create quality_inspections table
        await queryRunner.createTable(
            new Table({
                name: 'quality_inspections',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                    },
                    {
                        name: 'inspection_number',
                        type: 'varchar',
                        length: '50',
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: 'goods_receipt_id',
                        type: 'varchar',
                        length: '36',
                        isNullable: false,
                        collation: 'utf8mb4_unicode_ci',
                    },
                    {
                        name: 'inspection_date',
                        type: 'date',
                        isNullable: false,
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: ['PENDING', 'IN_PROGRESS', 'PASSED', 'FAILED', 'CONDITIONAL'],
                        default: "'PENDING'",
                    },
                    {
                        name: 'inspector_name',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                    },
                    {
                        name: 'inspector_id',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'passed_quantity',
                        type: 'decimal',
                        precision: 10,
                        scale: 3,
                        isNullable: true,
                    },
                    {
                        name: 'failed_quantity',
                        type: 'decimal',
                        precision: 10,
                        scale: 3,
                        isNullable: true,
                    },
                    {
                        name: 'conditional_quantity',
                        type: 'decimal',
                        precision: 10,
                        scale: 3,
                        isNullable: true,
                    },
                    {
                        name: 'inspection_notes',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'test_results',
                        type: 'json',
                        isNullable: true,
                    },
                    {
                        name: 'completed_at',
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

        // Add foreign keys for quality_inspections
        await queryRunner.createForeignKey(
            'quality_inspections',
            new TableForeignKey({
                columnNames: ['goods_receipt_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'goods_receipts',
                onDelete: 'RESTRICT',
            })
        );

        await queryRunner.createForeignKey(
            'quality_inspections',
            new TableForeignKey({
                columnNames: ['inspector_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'SET NULL',
            })
        );

        // Add indexes for quality_inspections
        await queryRunner.createIndex(
            'quality_inspections',
            new TableIndex({
                name: 'idx_inspections_receipt',
                columnNames: ['goods_receipt_id'],
            })
        );

        await queryRunner.createIndex(
            'quality_inspections',
            new TableIndex({
                name: 'idx_inspections_status',
                columnNames: ['status'],
            })
        );

        // Step 6: Create supplier_contracts table
        await queryRunner.createTable(
            new Table({
                name: 'supplier_contracts',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                    },
                    {
                        name: 'contract_number',
                        type: 'varchar',
                        length: '100',
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: 'supplier_id',
                        type: 'varchar',
                        length: '36',
                        collation: 'utf8mb4_unicode_ci',
                        isNullable: false,
                    },
                    {
                        name: 'title',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'start_date',
                        type: 'date',
                        isNullable: false,
                    },
                    {
                        name: 'end_date',
                        type: 'date',
                        isNullable: false,
                    },
                    {
                        name: 'contract_value',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
                        isNullable: true,
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: ['DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED', 'RENEWED'],
                        default: "'DRAFT'",
                    },
                    {
                        name: 'terms_conditions',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'signed_by',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                    },
                    {
                        name: 'signed_date',
                        type: 'date',
                        isNullable: true,
                    },
                    {
                        name: 'auto_renewal',
                        type: 'boolean',
                        default: false,
                    },
                    {
                        name: 'renewal_period_months',
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

        // Add foreign keys for supplier_contracts
        await queryRunner.createForeignKey(
            'supplier_contracts',
            new TableForeignKey({
                columnNames: ['supplier_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'cat_suppliers',
                onDelete: 'RESTRICT',
            })
        );

        // Add indexes for supplier_contracts
        await queryRunner.createIndex(
            'supplier_contracts',
            new TableIndex({
                name: 'idx_supplier_contracts_supplier',
                columnNames: ['supplier_id'],
            })
        );

        await queryRunner.createIndex(
            'supplier_contracts',
            new TableIndex({
                name: 'idx_supplier_contracts_status',
                columnNames: ['status'],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop in reverse order
        await queryRunner.dropTable('supplier_contracts');
        await queryRunner.dropTable('quality_inspections');
        await queryRunner.dropTable('rfq_items');
        await queryRunner.dropTable('rfqs');
        await queryRunner.dropTable('purchase_requisition_items');
        await queryRunner.dropTable('purchase_requisitions');
    }
}

