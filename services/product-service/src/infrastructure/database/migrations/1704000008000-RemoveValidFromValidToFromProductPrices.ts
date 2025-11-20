import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveValidFromValidToFromProductPrices1704000008000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop valid_from and valid_to columns
    await queryRunner.query(`
      ALTER TABLE \`product_prices\` 
      DROP COLUMN IF EXISTS \`valid_from\`
    `);
    
    await queryRunner.query(`
      ALTER TABLE \`product_prices\` 
      DROP COLUMN IF EXISTS \`valid_to\`
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add valid_from and valid_to columns back
    await queryRunner.query(`
      ALTER TABLE \`product_prices\` 
      ADD COLUMN \`valid_from\` TIMESTAMP NULL
    `);
    
    await queryRunner.query(`
      ALTER TABLE \`product_prices\` 
      ADD COLUMN \`valid_to\` TIMESTAMP NULL
    `);
  }
}

