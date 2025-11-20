import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

/**
 * Phase 3: Financial Management Tables
 * 
 * Migration: Create payments, payment_items, accounts_receivable, accounts_payable,
 * cash_flow, credit_notes, debit_notes, taxes, tax_rates, currencies, exchange_rates tables
 * 
 * Epic: EPIC-006 - Financial Management
 * Priority: Critical
 * 
 * Steps:
 * 1. Create payments table
 * 2. Create payment_items table
 * 3. Create accounts_receivable table
 * 4. Create accounts_payable table
 * 5. Create cash_flow table
 * 6. Create credit_notes table
 * 7. Create debit_notes table
 * 8. Create taxes table
 * 9. Create tax_rates table
 * 10. Create currencies table
 * 11. Create exchange_rates table
 */

export class Phase3FinancialManagementTables20251119000003 implements MigrationInterface {
    name = 'Phase3FinancialManagementTables20251119000003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Step 1: Create payments table
        await queryRunner.createTable(
            new Table({
                name: 'payments',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                    },
                    {
                        name: 'payment_number',
                        type: 'varchar',
                        length: '50',
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: 'payment_type',
                        type: 'enum',
                        enum: ['CUSTOMER_PAYMENT', 'SUPPLIER_PAYMENT', 'EXPENSE', 'REFUND'],
                        isNullable: false,
                    },
                    {
                        name: 'customer_id',
                        type: 'varchar',
                        length: '36',
                        collation: 'utf8mb4_unicode_ci',
                        isNullable: true,
                    },
                    {
                        name: 'supplier_id',
                        type: 'varchar',
                        length: '36',
                        collation: 'utf8mb4_unicode_ci',
                        isNullable: true,
                    },
                    {
                        name: 'payment_date',
                        type: 'date',
                        isNullable: false,
                    },
                    {
                        name: 'payment_method_id',
                        type: 'bigint',
                        isNullable: true,
                    },
                    {
                        name: 'amount',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
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
                        name: 'exchange_rate',
                        type: 'decimal',
                        precision: 10,
                        scale: 4,
                        default: 1.0000,
                    },
                    {
                        name: 'reference_number',
                        type: 'varchar',
                        length: '100',
                        isNullable: true,
                    },
                    {
                        name: 'bank_account',
                        type: 'varchar',
                        length: '100',
                        isNullable: true,
                    },
                    {
                        name: 'notes',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: ['DRAFT', 'PENDING', 'APPROVED', 'PROCESSED', 'CANCELLED'],
                        default: "'DRAFT'",
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
                        name: 'processed_at',
                        type: 'timestamp',
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

        // Add foreign keys for payments
        await queryRunner.createForeignKey(
            'payments',
            new TableForeignKey({
                columnNames: ['customer_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'customers',
                onDelete: 'SET NULL',
            })
        );

        await queryRunner.createForeignKey(
            'payments',
            new TableForeignKey({
                columnNames: ['supplier_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'cat_suppliers',
                onDelete: 'SET NULL',
            })
        );

        await queryRunner.createForeignKey(
            'payments',
            new TableForeignKey({
                columnNames: ['payment_method_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'cat_payment_methods',
                onDelete: 'SET NULL',
            })
        );

        // Add indexes for payments
        await queryRunner.createIndex(
            'payments',
            new TableIndex({
                name: 'idx_payments_customer',
                columnNames: ['customer_id'],
            })
        );

        await queryRunner.createIndex(
            'payments',
            new TableIndex({
                name: 'idx_payments_supplier',
                columnNames: ['supplier_id'],
            })
        );

        await queryRunner.createIndex(
            'payments',
            new TableIndex({
                name: 'idx_payments_date',
                columnNames: ['payment_date'],
            })
        );

        await queryRunner.createIndex(
            'payments',
            new TableIndex({
                name: 'idx_payments_status',
                columnNames: ['status'],
            })
        );

        // Step 2: Create payment_items table
        await queryRunner.createTable(
            new Table({
                name: 'payment_items',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                    },
                    {
                        name: 'payment_id',
                        type: 'varchar',
                        length: '36',
                        collation: 'utf8mb4_unicode_ci',
                        isNullable: false,
                    },
                    {
                        name: 'invoice_id',
                        type: 'varchar',
                        length: '36',
                        collation: 'utf8mb4_unicode_ci',
                        isNullable: false,
                    },
                    {
                        name: 'amount',
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

        // Add foreign keys for payment_items
        await queryRunner.createForeignKey(
            'payment_items',
            new TableForeignKey({
                columnNames: ['payment_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'payments',
                onDelete: 'CASCADE',
            })
        );

        await queryRunner.createForeignKey(
            'payment_items',
            new TableForeignKey({
                columnNames: ['invoice_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'invoices',
                onDelete: 'RESTRICT',
            })
        );

        // Add indexes for payment_items
        await queryRunner.createIndex(
            'payment_items',
            new TableIndex({
                name: 'idx_payment_items_payment',
                columnNames: ['payment_id'],
            })
        );

        await queryRunner.createIndex(
            'payment_items',
            new TableIndex({
                name: 'idx_payment_items_invoice',
                columnNames: ['invoice_id'],
            })
        );

        // Step 3: Create accounts_receivable table
        await queryRunner.createTable(
            new Table({
                name: 'accounts_receivable',
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
                        collation: 'utf8mb4_unicode_ci',
                        isNullable: false,
                    },
                    {
                        name: 'invoice_id',
                        type: 'varchar',
                        length: '36',
                        collation: 'utf8mb4_unicode_ci',
                        isNullable: false,
                    },
                    {
                        name: 'invoice_number',
                        type: 'varchar',
                        length: '50',
                        isNullable: false,
                    },
                    {
                        name: 'invoice_date',
                        type: 'date',
                        isNullable: false,
                    },
                    {
                        name: 'due_date',
                        type: 'date',
                        isNullable: false,
                    },
                    {
                        name: 'original_amount',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
                        isNullable: false,
                    },
                    {
                        name: 'paid_amount',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
                        default: 0.00,
                        isNullable: false,
                    },
                    {
                        name: 'balance_amount',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
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
                        name: 'aging_category',
                        type: 'enum',
                        enum: ['CURRENT', '30_DAYS', '60_DAYS', '90_DAYS', 'OVER_90_DAYS'],
                        isNullable: true,
                    },
                    {
                        name: 'days_overdue',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: ['CURRENT', 'OVERDUE', 'PAID', 'WRITTEN_OFF'],
                        default: "'CURRENT'",
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

        // Add foreign keys for accounts_receivable
        await queryRunner.createForeignKey(
            'accounts_receivable',
            new TableForeignKey({
                columnNames: ['customer_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'customers',
                onDelete: 'RESTRICT',
            })
        );

        await queryRunner.createForeignKey(
            'accounts_receivable',
            new TableForeignKey({
                columnNames: ['invoice_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'invoices',
                onDelete: 'RESTRICT',
            })
        );

        // Add indexes for accounts_receivable
        await queryRunner.createIndex(
            'accounts_receivable',
            new TableIndex({
                name: 'idx_ar_customer',
                columnNames: ['customer_id'],
            })
        );

        await queryRunner.createIndex(
            'accounts_receivable',
            new TableIndex({
                name: 'idx_ar_invoice',
                columnNames: ['invoice_id'],
            })
        );

        await queryRunner.createIndex(
            'accounts_receivable',
            new TableIndex({
                name: 'idx_ar_status',
                columnNames: ['status'],
            })
        );

        await queryRunner.createIndex(
            'accounts_receivable',
            new TableIndex({
                name: 'idx_ar_due_date',
                columnNames: ['due_date'],
            })
        );

        // Step 4: Create accounts_payable table
        await queryRunner.createTable(
            new Table({
                name: 'accounts_payable',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                    },
                    {
                        name: 'supplier_id',
                        type: 'varchar',
                        length: '36',
                        collation: 'utf8mb4_unicode_ci',
                        isNullable: false,
                    },
                    {
                        name: 'invoice_id',
                        type: 'varchar',
                        length: '36',
                        collation: 'utf8mb4_unicode_ci',
                        isNullable: false,
                    },
                    {
                        name: 'invoice_number',
                        type: 'varchar',
                        length: '50',
                        isNullable: false,
                    },
                    {
                        name: 'invoice_date',
                        type: 'date',
                        isNullable: false,
                    },
                    {
                        name: 'due_date',
                        type: 'date',
                        isNullable: false,
                    },
                    {
                        name: 'original_amount',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
                        isNullable: false,
                    },
                    {
                        name: 'paid_amount',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
                        default: 0.00,
                        isNullable: false,
                    },
                    {
                        name: 'balance_amount',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
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
                        name: 'aging_category',
                        type: 'enum',
                        enum: ['CURRENT', '30_DAYS', '60_DAYS', '90_DAYS', 'OVER_90_DAYS'],
                        isNullable: true,
                    },
                    {
                        name: 'days_until_due',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: ['CURRENT', 'DUE', 'PAID', 'OVERDUE'],
                        default: "'CURRENT'",
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

        // Add foreign keys for accounts_payable
        await queryRunner.createForeignKey(
            'accounts_payable',
            new TableForeignKey({
                columnNames: ['supplier_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'cat_suppliers',
                onDelete: 'RESTRICT',
            })
        );

        await queryRunner.createForeignKey(
            'accounts_payable',
            new TableForeignKey({
                columnNames: ['invoice_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'invoices',
                onDelete: 'RESTRICT',
            })
        );

        // Add indexes for accounts_payable
        await queryRunner.createIndex(
            'accounts_payable',
            new TableIndex({
                name: 'idx_ap_supplier',
                columnNames: ['supplier_id'],
            })
        );

        await queryRunner.createIndex(
            'accounts_payable',
            new TableIndex({
                name: 'idx_ap_invoice',
                columnNames: ['invoice_id'],
            })
        );

        await queryRunner.createIndex(
            'accounts_payable',
            new TableIndex({
                name: 'idx_ap_status',
                columnNames: ['status'],
            })
        );

        await queryRunner.createIndex(
            'accounts_payable',
            new TableIndex({
                name: 'idx_ap_due_date',
                columnNames: ['due_date'],
            })
        );

        // Step 5: Create cash_flow table
        await queryRunner.createTable(
            new Table({
                name: 'cash_flow',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                    },
                    {
                        name: 'flow_date',
                        type: 'date',
                        isNullable: false,
                    },
                    {
                        name: 'flow_type',
                        type: 'enum',
                        enum: ['INFLOW', 'OUTFLOW'],
                        isNullable: false,
                    },
                    {
                        name: 'category',
                        type: 'varchar',
                        length: '100',
                        isNullable: false,
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'amount',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
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
                        name: 'reference_type',
                        type: 'varchar',
                        length: '50',
                        isNullable: true,
                    },
                    {
                        name: 'reference_id',
                        type: 'varchar',
                        length: '36',
                        isNullable: true,
                    },
                    {
                        name: 'bank_account',
                        type: 'varchar',
                        length: '100',
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

        // Add indexes for cash_flow
        await queryRunner.createIndex(
            'cash_flow',
            new TableIndex({
                name: 'idx_cash_flow_date',
                columnNames: ['flow_date'],
            })
        );

        await queryRunner.createIndex(
            'cash_flow',
            new TableIndex({
                name: 'idx_cash_flow_type',
                columnNames: ['flow_type'],
            })
        );

        await queryRunner.createIndex(
            'cash_flow',
            new TableIndex({
                name: 'idx_cash_flow_category',
                columnNames: ['category'],
            })
        );

        // Step 6: Create credit_notes table
        await queryRunner.createTable(
            new Table({
                name: 'credit_notes',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                    },
                    {
                        name: 'credit_note_number',
                        type: 'varchar',
                        length: '50',
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: 'invoice_id',
                        type: 'varchar',
                        length: '36',
                        collation: 'utf8mb4_unicode_ci',
                        isNullable: false,
                    },
                    {
                        name: 'customer_id',
                        type: 'varchar',
                        length: '36',
                        collation: 'utf8mb4_unicode_ci',
                        isNullable: false,
                    },
                    {
                        name: 'credit_note_date',
                        type: 'date',
                        isNullable: false,
                    },
                    {
                        name: 'reason',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
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
                        name: 'status',
                        type: 'enum',
                        enum: ['DRAFT', 'ISSUED', 'APPLIED', 'CANCELLED'],
                        default: "'DRAFT'",
                    },
                    {
                        name: 'applied_to_invoice_id',
                        type: 'varchar',
                        length: '36',
                        collation: 'utf8mb4_unicode_ci',
                        isNullable: true,
                    },
                    {
                        name: 'applied_at',
                        type: 'timestamp',
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

        // Add foreign keys for credit_notes
        await queryRunner.createForeignKey(
            'credit_notes',
            new TableForeignKey({
                columnNames: ['invoice_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'invoices',
                onDelete: 'RESTRICT',
            })
        );

        await queryRunner.createForeignKey(
            'credit_notes',
            new TableForeignKey({
                columnNames: ['customer_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'customers',
                onDelete: 'RESTRICT',
            })
        );

        await queryRunner.createForeignKey(
            'credit_notes',
            new TableForeignKey({
                columnNames: ['applied_to_invoice_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'invoices',
                onDelete: 'SET NULL',
            })
        );

        // Add indexes for credit_notes
        await queryRunner.createIndex(
            'credit_notes',
            new TableIndex({
                name: 'idx_credit_notes_invoice',
                columnNames: ['invoice_id'],
            })
        );

        await queryRunner.createIndex(
            'credit_notes',
            new TableIndex({
                name: 'idx_credit_notes_customer',
                columnNames: ['customer_id'],
            })
        );

        await queryRunner.createIndex(
            'credit_notes',
            new TableIndex({
                name: 'idx_credit_notes_status',
                columnNames: ['status'],
            })
        );

        // Step 7: Create debit_notes table
        await queryRunner.createTable(
            new Table({
                name: 'debit_notes',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                    },
                    {
                        name: 'debit_note_number',
                        type: 'varchar',
                        length: '50',
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: 'invoice_id',
                        type: 'varchar',
                        length: '36',
                        collation: 'utf8mb4_unicode_ci',
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
                        name: 'debit_note_date',
                        type: 'date',
                        isNullable: false,
                    },
                    {
                        name: 'reason',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
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
                        name: 'status',
                        type: 'enum',
                        enum: ['DRAFT', 'ISSUED', 'APPLIED', 'CANCELLED'],
                        default: "'DRAFT'",
                    },
                    {
                        name: 'applied_to_invoice_id',
                        type: 'varchar',
                        length: '36',
                        collation: 'utf8mb4_unicode_ci',
                        isNullable: true,
                    },
                    {
                        name: 'applied_at',
                        type: 'timestamp',
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

        // Add foreign keys for debit_notes
        await queryRunner.createForeignKey(
            'debit_notes',
            new TableForeignKey({
                columnNames: ['invoice_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'invoices',
                onDelete: 'RESTRICT',
            })
        );

        await queryRunner.createForeignKey(
            'debit_notes',
            new TableForeignKey({
                columnNames: ['supplier_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'cat_suppliers',
                onDelete: 'RESTRICT',
            })
        );

        await queryRunner.createForeignKey(
            'debit_notes',
            new TableForeignKey({
                columnNames: ['applied_to_invoice_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'invoices',
                onDelete: 'SET NULL',
            })
        );

        // Add indexes for debit_notes
        await queryRunner.createIndex(
            'debit_notes',
            new TableIndex({
                name: 'idx_debit_notes_invoice',
                columnNames: ['invoice_id'],
            })
        );

        await queryRunner.createIndex(
            'debit_notes',
            new TableIndex({
                name: 'idx_debit_notes_supplier',
                columnNames: ['supplier_id'],
            })
        );

        await queryRunner.createIndex(
            'debit_notes',
            new TableIndex({
                name: 'idx_debit_notes_status',
                columnNames: ['status'],
            })
        );

        // Step 8: Create taxes table
        await queryRunner.createTable(
            new Table({
                name: 'taxes',
                columns: [
                    {
                        name: 'id',
                        type: 'bigint',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'code',
                        type: 'varchar',
                        length: '20',
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '100',
                        isNullable: false,
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'tax_type',
                        type: 'enum',
                        enum: ['PERCENTAGE', 'FIXED'],
                        default: "'PERCENTAGE'",
                        isNullable: false,
                    },
                    {
                        name: 'is_active',
                        type: 'boolean',
                        default: true,
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
                    {
                        name: 'created_by',
                        type: 'bigint',
                        isNullable: true,
                    },
                    {
                        name: 'updated_by',
                        type: 'bigint',
                        isNullable: true,
                    },
                ],
            }),
            true
        );

        // Add indexes for taxes
        await queryRunner.createIndex(
            'taxes',
            new TableIndex({
                name: 'idx_taxes_code',
                columnNames: ['code'],
            })
        );

        await queryRunner.createIndex(
            'taxes',
            new TableIndex({
                name: 'idx_taxes_active',
                columnNames: ['is_active'],
            })
        );

        // Step 9: Create tax_rates table
        await queryRunner.createTable(
            new Table({
                name: 'tax_rates',
                columns: [
                    {
                        name: 'id',
                        type: 'bigint',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'tax_id',
                        type: 'bigint',
                        isNullable: false,
                    },
                    {
                        name: 'rate',
                        type: 'decimal',
                        precision: 5,
                        scale: 2,
                        isNullable: false,
                    },
                    {
                        name: 'effective_from',
                        type: 'date',
                        isNullable: false,
                    },
                    {
                        name: 'effective_to',
                        type: 'date',
                        isNullable: true,
                    },
                    {
                        name: 'is_active',
                        type: 'boolean',
                        default: true,
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

        // Add foreign keys for tax_rates
        await queryRunner.createForeignKey(
            'tax_rates',
            new TableForeignKey({
                columnNames: ['tax_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'taxes',
                onDelete: 'CASCADE',
            })
        );

        // Add indexes for tax_rates
        await queryRunner.createIndex(
            'tax_rates',
            new TableIndex({
                name: 'idx_tax_rates_tax',
                columnNames: ['tax_id'],
            })
        );

        await queryRunner.createIndex(
            'tax_rates',
            new TableIndex({
                name: 'idx_tax_rates_dates',
                columnNames: ['effective_from', 'effective_to'],
            })
        );

        // Step 10: Create currencies table
        await queryRunner.createTable(
            new Table({
                name: 'currencies',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'code',
                        type: 'varchar',
                        length: '3',
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '100',
                        isNullable: false,
                    },
                    {
                        name: 'symbol',
                        type: 'varchar',
                        length: '10',
                        isNullable: false,
                    },
                    {
                        name: 'is_base_currency',
                        type: 'boolean',
                        default: false,
                    },
                    {
                        name: 'is_active',
                        type: 'boolean',
                        default: true,
                    },
                    {
                        name: 'decimal_places',
                        type: 'int',
                        default: 2,
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

        // Add indexes for currencies
        await queryRunner.createIndex(
            'currencies',
            new TableIndex({
                name: 'idx_currencies_code',
                columnNames: ['code'],
            })
        );

        // Step 11: Create exchange_rates table
        await queryRunner.createTable(
            new Table({
                name: 'exchange_rates',
                columns: [
                    {
                        name: 'id',
                        type: 'bigint',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'from_currency_id',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'to_currency_id',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'rate',
                        type: 'decimal',
                        precision: 10,
                        scale: 4,
                        isNullable: false,
                    },
                    {
                        name: 'effective_date',
                        type: 'date',
                        isNullable: false,
                    },
                    {
                        name: 'is_active',
                        type: 'boolean',
                        default: true,
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

        // Add foreign keys for exchange_rates
        await queryRunner.createForeignKey(
            'exchange_rates',
            new TableForeignKey({
                columnNames: ['from_currency_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'currencies',
                onDelete: 'RESTRICT',
            })
        );

        await queryRunner.createForeignKey(
            'exchange_rates',
            new TableForeignKey({
                columnNames: ['to_currency_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'currencies',
                onDelete: 'RESTRICT',
            })
        );

        // Add indexes for exchange_rates
        await queryRunner.createIndex(
            'exchange_rates',
            new TableIndex({
                name: 'idx_exchange_rates_currencies',
                columnNames: ['from_currency_id', 'to_currency_id'],
            })
        );

        await queryRunner.createIndex(
            'exchange_rates',
            new TableIndex({
                name: 'idx_exchange_rates_date',
                columnNames: ['effective_date'],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop in reverse order
        await queryRunner.dropTable('exchange_rates');
        await queryRunner.dropTable('currencies');
        await queryRunner.dropTable('tax_rates');
        await queryRunner.dropTable('taxes');
        await queryRunner.dropTable('debit_notes');
        await queryRunner.dropTable('credit_notes');
        await queryRunner.dropTable('cash_flow');
        await queryRunner.dropTable('accounts_payable');
        await queryRunner.dropTable('accounts_receivable');
        await queryRunner.dropTable('payment_items');
        await queryRunner.dropTable('payments');
    }
}

