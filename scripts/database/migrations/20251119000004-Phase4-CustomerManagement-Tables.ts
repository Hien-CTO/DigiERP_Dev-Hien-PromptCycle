import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

/**
 * Phase 4: Customer Management Tables
 * 
 * Migration: Create rfm_scores, customer_support_tickets tables
 * and alter customers table
 * 
 * Epic: EPIC-003 - Customer Management
 * Priority: Medium
 * 
 * Steps:
 * 1. Create rfm_scores table
 * 2. Create customer_support_tickets table
 * 3. Alter customers - add fields
 */

export class Phase4CustomerManagementTables20251119000004 implements MigrationInterface {
    name = 'Phase4CustomerManagementTables20251119000004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Step 1: Create rfm_scores table
        await queryRunner.createTable(
            new Table({
                name: 'rfm_scores',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                    },
                    {
                        name: 'customer_id',
                        type: 'varchar',
                        length: '36',
                        isNullable: false,
                        collation: 'utf8mb4_unicode_ci',
                    },
                    {
                        name: 'analysis_date',
                        type: 'date',
                        isNullable: false,
                    },
                    {
                        name: 'recency_score',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'frequency_score',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'monetary_score',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'rfm_segment',
                        type: 'varchar',
                        length: '50',
                        isNullable: true,
                    },
                    {
                        name: 'last_purchase_date',
                        type: 'date',
                        isNullable: true,
                    },
                    {
                        name: 'purchase_frequency',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'total_spent',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
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

        // Add foreign keys for rfm_scores
        await queryRunner.createForeignKey(
            'rfm_scores',
            new TableForeignKey({
                columnNames: ['customer_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'customers',
                onDelete: 'CASCADE',
            })
        );

        // Add indexes for rfm_scores
        await queryRunner.createIndex(
            'rfm_scores',
            new TableIndex({
                name: 'idx_rfm_customer',
                columnNames: ['customer_id'],
            })
        );

        await queryRunner.createIndex(
            'rfm_scores',
            new TableIndex({
                name: 'idx_rfm_analysis_date',
                columnNames: ['analysis_date'],
            })
        );

        await queryRunner.createIndex(
            'rfm_scores',
            new TableIndex({
                name: 'idx_rfm_segment',
                columnNames: ['rfm_segment'],
            })
        );

        // Step 2: Create customer_support_tickets table
        await queryRunner.createTable(
            new Table({
                name: 'customer_support_tickets',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                    },
                    {
                        name: 'ticket_number',
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
                        name: 'subject',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: false,
                    },
                    {
                        name: 'priority',
                        type: 'enum',
                        enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
                        default: "'MEDIUM'",
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'CANCELLED'],
                        default: "'OPEN'",
                    },
                    {
                        name: 'category',
                        type: 'varchar',
                        length: '100',
                        isNullable: true,
                    },
                    {
                        name: 'assigned_to',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'created_by',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'resolved_at',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'resolved_by',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'resolution_notes',
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

        // Add foreign keys for customer_support_tickets
        await queryRunner.createForeignKey(
            'customer_support_tickets',
            new TableForeignKey({
                columnNames: ['customer_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'customers',
                onDelete: 'RESTRICT',
            })
        );

        await queryRunner.createForeignKey(
            'customer_support_tickets',
            new TableForeignKey({
                columnNames: ['assigned_to'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'SET NULL',
            })
        );

        await queryRunner.createForeignKey(
            'customer_support_tickets',
            new TableForeignKey({
                columnNames: ['created_by'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'SET NULL',
            })
        );

        await queryRunner.createForeignKey(
            'customer_support_tickets',
            new TableForeignKey({
                columnNames: ['resolved_by'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'SET NULL',
            })
        );

        // Add indexes for customer_support_tickets
        await queryRunner.createIndex(
            'customer_support_tickets',
            new TableIndex({
                name: 'idx_tickets_customer',
                columnNames: ['customer_id'],
            })
        );

        await queryRunner.createIndex(
            'customer_support_tickets',
            new TableIndex({
                name: 'idx_tickets_status',
                columnNames: ['status'],
            })
        );

        await queryRunner.createIndex(
            'customer_support_tickets',
            new TableIndex({
                name: 'idx_tickets_priority',
                columnNames: ['priority'],
            })
        );

        await queryRunner.createIndex(
            'customer_support_tickets',
            new TableIndex({
                name: 'idx_tickets_assigned',
                columnNames: ['assigned_to'],
            })
        );

        // Step 3: Alter customers table - add fields
        await queryRunner.query(`
            ALTER TABLE customers
            ADD COLUMN status_id INT NULL AFTER is_active,
            ADD COLUMN customer_type ENUM('COMPANY', 'INDIVIDUAL') NULL AFTER status_id,
            ADD COLUMN rating DECIMAL(3,2) NULL DEFAULT 0.00,
            ADD COLUMN total_orders INT NULL DEFAULT 0,
            ADD COLUMN total_spent DECIMAL(15,2) NULL DEFAULT 0.00,
            ADD COLUMN last_order_date DATE NULL
        `);

        // Add foreign key for status_id
        await queryRunner.createForeignKey(
            'customers',
            new TableForeignKey({
                columnNames: ['status_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'cat_customer_status',
                onDelete: 'SET NULL',
            })
        );

        // Add indexes for customers
        await queryRunner.createIndex(
            'customers',
            new TableIndex({
                name: 'idx_customers_status',
                columnNames: ['status_id'],
            })
        );

        await queryRunner.createIndex(
            'customers',
            new TableIndex({
                name: 'idx_customers_type',
                columnNames: ['customer_type'],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop in reverse order
        await queryRunner.dropIndex('customers', 'idx_customers_type');
        await queryRunner.dropIndex('customers', 'idx_customers_status');
        
        const customersTable = await queryRunner.getTable('customers');
        const statusIdForeignKey = customersTable?.foreignKeys.find(
            fk => fk.columnNames.indexOf('status_id') !== -1
        );
        if (statusIdForeignKey) {
            await queryRunner.dropForeignKey('customers', statusIdForeignKey);
        }

        await queryRunner.query(`
            ALTER TABLE customers
            DROP COLUMN last_order_date,
            DROP COLUMN total_spent,
            DROP COLUMN total_orders,
            DROP COLUMN rating,
            DROP COLUMN customer_type,
            DROP COLUMN status_id
        `);

        await queryRunner.dropTable('customer_support_tickets');
        await queryRunner.dropTable('rfm_scores');
    }
}

