import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveCostPriceFromProductPrices1704000007000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop cost_price column
    await queryRunner.query(`
      ALTER TABLE \`product_prices\` 
      DROP COLUMN IF EXISTS \`cost_price\`
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add cost_price column back
    await queryRunner.query(`
      ALTER TABLE \`product_prices\` 
      ADD COLUMN \`cost_price\` DECIMAL(15,2) NULL
    `);
  }
}

