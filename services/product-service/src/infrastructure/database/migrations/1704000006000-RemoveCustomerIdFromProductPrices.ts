import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveCustomerIdFromProductPrices1704000006000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop index that includes customer_id
    await queryRunner.query(`
      DROP INDEX IF EXISTS \`IDX_product_prices_product_id_customer_id\` ON \`product_prices\`
    `);

    // Drop customer_id column
    await queryRunner.query(`
      ALTER TABLE \`product_prices\` 
      DROP COLUMN IF EXISTS \`customer_id\`
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add customer_id column back
    await queryRunner.query(`
      ALTER TABLE \`product_prices\` 
      ADD COLUMN \`customer_id\` INT NULL
    `);

    // Recreate index
    await queryRunner.query(`
      CREATE INDEX \`IDX_product_prices_product_id_customer_id\` 
      ON \`product_prices\` (\`product_id\`, \`customer_id\`)
    `);
  }
}

