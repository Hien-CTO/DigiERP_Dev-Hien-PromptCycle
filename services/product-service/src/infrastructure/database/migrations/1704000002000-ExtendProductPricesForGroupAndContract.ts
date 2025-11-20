import { MigrationInterface, QueryRunner } from "typeorm";

export class ExtendProductPricesForGroupAndContract1704000002000 implements MigrationInterface {
  name = 'ExtendProductPricesForGroupAndContract1704000002000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new enum values if needed (MySQL ENUM changes require ALTER)
    await queryRunner.query(`
      ALTER TABLE product_prices 
      MODIFY COLUMN price_type ENUM('STANDARD','CUSTOMER','CUSTOMER_GROUP','CONTRACT','VOLUME') DEFAULT 'STANDARD'
    `);

    // Add new columns for group and contract
    await queryRunner.query(`
      ALTER TABLE product_prices 
      ADD COLUMN customer_group_id VARCHAR(36) NULL AFTER customer_id,
      ADD COLUMN contract_id VARCHAR(36) NULL AFTER customer_group_id
    `);

    // Useful indexes
    await queryRunner.query(`CREATE INDEX idx_prices_customer_group ON product_prices(customer_group_id)`);
    await queryRunner.query(`CREATE INDEX idx_prices_contract ON product_prices(contract_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX idx_prices_contract ON product_prices`);
    await queryRunner.query(`DROP INDEX idx_prices_customer_group ON product_prices`);
    await queryRunner.query(`
      ALTER TABLE product_prices 
      DROP COLUMN contract_id,
      DROP COLUMN customer_group_id
    `);
    await queryRunner.query(`
      ALTER TABLE product_prices 
      MODIFY COLUMN price_type ENUM('STANDARD','CUSTOMER','VOLUME') DEFAULT 'STANDARD'
    `);
  }
}



