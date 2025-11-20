import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSpGetProductPrice1704000001000 implements MigrationInterface {
  name = 'CreateSpGetProductPrice1704000001000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop existing procedure if exists to avoid conflicts
    await queryRunner.query(`DROP PROCEDURE IF EXISTS sp_GetProductPrice`);

    // Create stored procedure
    await queryRunner.query(`
      CREATE PROCEDURE sp_GetProductPrice(
          IN p_product_id INT,
          IN p_customer_id INT,
          IN p_quantity INT
      )
      BEGIN
          DECLARE v_price DECIMAL(15,2) DEFAULT 0;
          DECLARE v_price_type VARCHAR(20) DEFAULT 'STANDARD';
          DECLARE v_discount_amount DECIMAL(15,2) DEFAULT 0;
          DECLARE v_final_price DECIMAL(15,2) DEFAULT 0;
          DECLARE v_applied_price_id INT DEFAULT 0;
          DECLARE v_found BOOLEAN DEFAULT FALSE;

          -- Priority 1: Customer-specific price
          IF p_customer_id IS NOT NULL AND NOT v_found THEN
              SELECT 
                  price,
                  price_type,
                  discount_percentage,
                  discount_amount,
                  id
              INTO 
                  v_price,
                  v_price_type,
                  v_discount_amount,
                  v_discount_amount,
                  v_applied_price_id
              FROM product_prices 
              WHERE product_id = p_product_id 
                  AND price_type = 'CUSTOMER' 
                  AND customer_id = p_customer_id
                  AND is_active = 1
                  AND (valid_from IS NULL OR valid_from <= NOW())
                  AND (valid_to IS NULL OR valid_to >= NOW())
              ORDER BY created_at DESC
              LIMIT 1;

              IF v_price > 0 THEN
                  SET v_found = TRUE;
              END IF;
          END IF;

          -- Priority 2: Volume pricing
          IF p_quantity IS NOT NULL AND NOT v_found THEN
              SELECT 
                  price,
                  price_type,
                  discount_percentage,
                  discount_amount,
                  id
              INTO 
                  v_price,
                  v_price_type,
                  v_discount_amount,
                  v_discount_amount,
                  v_applied_price_id
              FROM product_prices 
              WHERE product_id = p_product_id 
                  AND price_type = 'VOLUME' 
                  AND min_quantity <= p_quantity
                  AND (max_quantity IS NULL OR max_quantity >= p_quantity)
                  AND is_active = 1
                  AND (valid_from IS NULL OR valid_from <= NOW())
                  AND (valid_to IS NULL OR valid_to >= NOW())
              ORDER BY min_quantity DESC
              LIMIT 1;

              IF v_price > 0 THEN
                  SET v_found = TRUE;
              END IF;
          END IF;

          -- Priority 3: Standard price
          IF NOT v_found THEN
              SELECT 
                  price,
                  price_type,
                  discount_percentage,
                  discount_amount,
                  id
              INTO 
                  v_price,
                  v_price_type,
                  v_discount_amount,
                  v_discount_amount,
                  v_applied_price_id
              FROM product_prices 
              WHERE product_id = p_product_id 
                  AND price_type = 'STANDARD' 
                  AND is_active = 1
                  AND (valid_from IS NULL OR valid_from <= NOW())
                  AND (valid_to IS NULL OR valid_to >= NOW())
              ORDER BY created_at DESC
              LIMIT 1;

              IF v_price > 0 THEN
                  SET v_found = TRUE;
              END IF;
          END IF;

          -- Calculate final price
          IF v_found THEN
              SET v_final_price = v_price - v_discount_amount;
          ELSE
              SET v_price = 0;
              SET v_final_price = 0;
          END IF;

          -- Return result
          SELECT 
              v_price as price,
              v_price_type as price_type,
              v_discount_amount as discount_amount,
              v_final_price as final_price,
              v_applied_price_id as applied_price_id;
      END
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP PROCEDURE IF EXISTS sp_GetProductPrice`);
  }
}


