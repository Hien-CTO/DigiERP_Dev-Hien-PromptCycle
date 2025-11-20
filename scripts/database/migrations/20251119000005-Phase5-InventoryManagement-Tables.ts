import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

/**
 * Phase 5: Inventory Management Tables
 * 
 * Migration: Create safety_stock_settings, reorder_points, abc_analysis, demand_forecasts tables
 * 
 * Epic: EPIC-002 - Inventory Management
 * Priority: Medium
 * 
 * Steps:
 * 1. Create safety_stock_settings table
 * 2. Create reorder_points table
 * 3. Create abc_analysis table
 * 4. Create demand_forecasts table
 */

export class Phase5InventoryManagementTables20251119000005 implements MigrationInterface {
    name = 'Phase5InventoryManagementTables20251119000005'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Step 1: Create safety_stock_settings table
        await queryRunner.createTable(
            new Table({
                name: 'safety_stock_settings',
                columns: [
                    {
                        name: 'id',
                        type: 'bigint',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'product_id',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'warehouse_id',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'safety_stock_quantity',
                        type: 'decimal',
                        precision: 10,
                        scale: 3,
                        isNullable: false,
                    },
                    {
                        name: 'calculation_method',
                        type: 'enum',
                        enum: ['MANUAL', 'AUTOMATIC'],
                        default: "'MANUAL'",
                    },
                    {
                        name: 'lead_time_days',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'average_daily_demand',
                        type: 'decimal',
                        precision: 10,
                        scale: 3,
                        isNullable: true,
                    },
                    {
                        name: 'demand_std_deviation',
                        type: 'decimal',
                        precision: 10,
                        scale: 3,
                        isNullable: true,
                    },
                    {
                        name: 'service_level_target',
                        type: 'decimal',
                        precision: 5,
                        scale: 2,
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
                    {
                        name: 'created_by',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'updated_by',
                        type: 'int',
                        isNullable: true,
                    },
                ],
            }),
            true
        );

        // Add foreign keys for safety_stock_settings
        await queryRunner.createForeignKey(
            'safety_stock_settings',
            new TableForeignKey({
                columnNames: ['product_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'products',
                onDelete: 'CASCADE',
            })
        );

        await queryRunner.createForeignKey(
            'safety_stock_settings',
            new TableForeignKey({
                columnNames: ['warehouse_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'warehouses',
                onDelete: 'CASCADE',
            })
        );

        // Add unique constraint and indexes for safety_stock_settings
        await queryRunner.createIndex(
            'safety_stock_settings',
            new TableIndex({
                name: 'uk_safety_stock_product_warehouse',
                columnNames: ['product_id', 'warehouse_id'],
                isUnique: true,
            })
        );

        await queryRunner.createIndex(
            'safety_stock_settings',
            new TableIndex({
                name: 'idx_safety_stock_product',
                columnNames: ['product_id'],
            })
        );

        await queryRunner.createIndex(
            'safety_stock_settings',
            new TableIndex({
                name: 'idx_safety_stock_warehouse',
                columnNames: ['warehouse_id'],
            })
        );

        // Step 2: Create reorder_points table
        await queryRunner.createTable(
            new Table({
                name: 'reorder_points',
                columns: [
                    {
                        name: 'id',
                        type: 'bigint',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'product_id',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'warehouse_id',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'reorder_point',
                        type: 'decimal',
                        precision: 10,
                        scale: 3,
                        isNullable: false,
                    },
                    {
                        name: 'reorder_quantity',
                        type: 'decimal',
                        precision: 10,
                        scale: 3,
                        isNullable: false,
                    },
                    {
                        name: 'calculation_method',
                        type: 'enum',
                        enum: ['MANUAL', 'AUTOMATIC'],
                        default: "'MANUAL'",
                    },
                    {
                        name: 'lead_time_days',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'average_daily_demand',
                        type: 'decimal',
                        precision: 10,
                        scale: 3,
                        isNullable: true,
                    },
                    {
                        name: 'safety_stock_id',
                        type: 'bigint',
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
                    {
                        name: 'created_by',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'updated_by',
                        type: 'int',
                        isNullable: true,
                    },
                ],
            }),
            true
        );

        // Add foreign keys for reorder_points
        await queryRunner.createForeignKey(
            'reorder_points',
            new TableForeignKey({
                columnNames: ['product_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'products',
                onDelete: 'CASCADE',
            })
        );

        await queryRunner.createForeignKey(
            'reorder_points',
            new TableForeignKey({
                columnNames: ['warehouse_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'warehouses',
                onDelete: 'CASCADE',
            })
        );

        await queryRunner.createForeignKey(
            'reorder_points',
            new TableForeignKey({
                columnNames: ['safety_stock_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'safety_stock_settings',
                onDelete: 'SET NULL',
            })
        );

        // Add unique constraint and indexes for reorder_points
        await queryRunner.createIndex(
            'reorder_points',
            new TableIndex({
                name: 'uk_reorder_point_product_warehouse',
                columnNames: ['product_id', 'warehouse_id'],
                isUnique: true,
            })
        );

        await queryRunner.createIndex(
            'reorder_points',
            new TableIndex({
                name: 'idx_reorder_point_product',
                columnNames: ['product_id'],
            })
        );

        await queryRunner.createIndex(
            'reorder_points',
            new TableIndex({
                name: 'idx_reorder_point_warehouse',
                columnNames: ['warehouse_id'],
            })
        );

        // Step 3: Create abc_analysis table
        await queryRunner.createTable(
            new Table({
                name: 'abc_analysis',
                columns: [
                    {
                        name: 'id',
                        type: 'bigint',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'product_id',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'analysis_date',
                        type: 'date',
                        isNullable: false,
                    },
                    {
                        name: 'annual_usage_value',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
                        isNullable: false,
                    },
                    {
                        name: 'annual_usage_quantity',
                        type: 'decimal',
                        precision: 10,
                        scale: 3,
                        isNullable: false,
                    },
                    {
                        name: 'classification',
                        type: 'enum',
                        enum: ['A', 'B', 'C'],
                        isNullable: false,
                    },
                    {
                        name: 'cumulative_value_percentage',
                        type: 'decimal',
                        precision: 5,
                        scale: 2,
                        isNullable: true,
                    },
                    {
                        name: 'recommendation',
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

        // Add foreign keys for abc_analysis
        await queryRunner.createForeignKey(
            'abc_analysis',
            new TableForeignKey({
                columnNames: ['product_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'products',
                onDelete: 'CASCADE',
            })
        );

        // Add indexes for abc_analysis
        await queryRunner.createIndex(
            'abc_analysis',
            new TableIndex({
                name: 'idx_abc_product',
                columnNames: ['product_id'],
            })
        );

        await queryRunner.createIndex(
            'abc_analysis',
            new TableIndex({
                name: 'idx_abc_classification',
                columnNames: ['classification'],
            })
        );

        await queryRunner.createIndex(
            'abc_analysis',
            new TableIndex({
                name: 'idx_abc_analysis_date',
                columnNames: ['analysis_date'],
            })
        );

        // Step 4: Create demand_forecasts table
        await queryRunner.createTable(
            new Table({
                name: 'demand_forecasts',
                columns: [
                    {
                        name: 'id',
                        type: 'bigint',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'product_id',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'warehouse_id',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'forecast_date',
                        type: 'date',
                        isNullable: false,
                    },
                    {
                        name: 'forecast_period',
                        type: 'enum',
                        enum: ['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'],
                        isNullable: false,
                    },
                    {
                        name: 'forecasted_quantity',
                        type: 'decimal',
                        precision: 10,
                        scale: 3,
                        isNullable: false,
                    },
                    {
                        name: 'confidence_level',
                        type: 'decimal',
                        precision: 5,
                        scale: 2,
                        isNullable: true,
                    },
                    {
                        name: 'forecast_method',
                        type: 'varchar',
                        length: '50',
                        isNullable: true,
                    },
                    {
                        name: 'actual_quantity',
                        type: 'decimal',
                        precision: 10,
                        scale: 3,
                        isNullable: true,
                    },
                    {
                        name: 'accuracy_percentage',
                        type: 'decimal',
                        precision: 5,
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
                    {
                        name: 'created_by',
                        type: 'int',
                        isNullable: true,
                    },
                ],
            }),
            true
        );

        // Add foreign keys for demand_forecasts
        await queryRunner.createForeignKey(
            'demand_forecasts',
            new TableForeignKey({
                columnNames: ['product_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'products',
                onDelete: 'CASCADE',
            })
        );

        await queryRunner.createForeignKey(
            'demand_forecasts',
            new TableForeignKey({
                columnNames: ['warehouse_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'warehouses',
                onDelete: 'CASCADE',
            })
        );

        // Add indexes for demand_forecasts
        await queryRunner.createIndex(
            'demand_forecasts',
            new TableIndex({
                name: 'idx_forecasts_product',
                columnNames: ['product_id'],
            })
        );

        await queryRunner.createIndex(
            'demand_forecasts',
            new TableIndex({
                name: 'idx_forecasts_warehouse',
                columnNames: ['warehouse_id'],
            })
        );

        await queryRunner.createIndex(
            'demand_forecasts',
            new TableIndex({
                name: 'idx_forecasts_date',
                columnNames: ['forecast_date'],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop in reverse order
        await queryRunner.dropTable('demand_forecasts');
        await queryRunner.dropTable('abc_analysis');
        await queryRunner.dropTable('reorder_points');
        await queryRunner.dropTable('safety_stock_settings');
    }
}

