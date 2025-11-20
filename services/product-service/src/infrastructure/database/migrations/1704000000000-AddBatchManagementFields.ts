import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBatchManagementFields1704000000000 implements MigrationInterface {
    name = 'AddBatchManagementFields1704000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add new columns to products table
        await queryRunner.query(`
            ALTER TABLE products 
            ADD COLUMN is_batch_managed BOOLEAN DEFAULT FALSE COMMENT 'Enable batch management for this product',
            ADD COLUMN has_expiry_date BOOLEAN DEFAULT FALSE COMMENT 'Product has expiry date',
            ADD COLUMN expiry_warning_days INT DEFAULT 30 COMMENT 'Days before expiry to show warning',
            ADD COLUMN batch_required BOOLEAN DEFAULT FALSE COMMENT 'Batch number required when receiving'
        `);

        // Add indexes for better performance
        await queryRunner.query(`CREATE INDEX idx_products_is_batch_managed ON products(is_batch_managed)`);
        await queryRunner.query(`CREATE INDEX idx_products_has_expiry_date ON products(has_expiry_date)`);
        await queryRunner.query(`CREATE INDEX idx_products_batch_required ON products(batch_required)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX idx_products_batch_required ON products`);
        await queryRunner.query(`DROP INDEX idx_products_has_expiry_date ON products`);
        await queryRunner.query(`DROP INDEX idx_products_is_batch_managed ON products`);

        // Drop columns
        await queryRunner.query(`
            ALTER TABLE products 
            DROP COLUMN batch_required,
            DROP COLUMN expiry_warning_days,
            DROP COLUMN has_expiry_date,
            DROP COLUMN is_batch_managed
        `);
    }
}
