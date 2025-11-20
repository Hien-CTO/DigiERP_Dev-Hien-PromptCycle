import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSpGetProductPriceExtended1704000003000 implements MigrationInterface {
  name = 'UpdateSpGetProductPriceExtended1704000003000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP PROCEDURE IF EXISTS sp_GetProductPrice`);
    await queryRunner.query(`
      CREATE PROCEDURE sp_GetProductPrice(
          IN p_product_id INT,
          IN p_customer_id INT,
          IN p_quantity INT,
          IN p_customer_group_id VARCHAR(36),
          IN p_contract_id VARCHAR(36)
      )
      BEGIN
          DECLARE v_price DECIMAL(15,2) DEFAULT 0;
          DECLARE v_price_type VARCHAR(20) DEFAULT 'STANDARD';
          DECLARE v_discount_pct DECIMAL(5,2) DEFAULT 0;
          DECLARE v_discount_amt DECIMAL(15,2) DEFAULT 0;
          DECLARE v_final_price DECIMAL(15,2) DEFAULT 0;
          DECLARE v_applied_price_id INT DEFAULT 0;
          DECLARE v_found BOOLEAN DEFAULT FALSE;

          -- 1) CONTRACT
          IF p_contract_id IS NOT NULL AND NOT v_found THEN
              SELECT price, price_type, COALESCE(discount_percentage,0), COALESCE(discount_amount,0), id
              INTO v_price, v_price_type, v_discount_pct, v_discount_amt, v_applied_price_id
              FROM product_prices
              WHERE product_id = p_product_id
                AND price_type = 'CONTRACT'
                AND contract_id = p_contract_id
                AND is_active = 1
                AND (valid_from IS NULL OR valid_from <= NOW())
                AND (valid_to IS NULL OR valid_to >= NOW())
              ORDER BY created_at DESC
              LIMIT 1;

              IF v_price > 0 THEN SET v_found = TRUE; END IF;
          END IF;

          -- 2) CUSTOMER
          IF p_customer_id IS NOT NULL AND NOT v_found THEN
              SELECT price, price_type, COALESCE(discount_percentage,0), COALESCE(discount_amount,0), id
              INTO v_price, v_price_type, v_discount_pct, v_discount_amt, v_applied_price_id
              FROM product_prices
              WHERE product_id = p_product_id
                AND price_type = 'CUSTOMER'
                AND customer_id = p_customer_id
                AND is_active = 1
                AND (valid_from IS NULL OR valid_from <= NOW())
                AND (valid_to IS NULL OR valid_to >= NOW())
              ORDER BY created_at DESC
              LIMIT 1;

              IF v_price > 0 THEN SET v_found = TRUE; END IF;
          END IF;

          -- 3) CUSTOMER_GROUP
          IF p_customer_group_id IS NOT NULL AND NOT v_found THEN
              SELECT price, price_type, COALESCE(discount_percentage,0), COALESCE(discount_amount,0), id
              INTO v_price, v_price_type, v_discount_pct, v_discount_amt, v_applied_price_id
              FROM product_prices
              WHERE product_id = p_product_id
                AND price_type = 'CUSTOMER_GROUP'
                AND customer_group_id = p_customer_group_id
                AND is_active = 1
                AND (valid_from IS NULL OR valid_from <= NOW())
                AND (valid_to IS NULL OR valid_to >= NOW())
              ORDER BY created_at DESC
              LIMIT 1;

              IF v_price > 0 THEN SET v_found = TRUE; END IF;
          END IF;

          -- 4) VOLUME
          IF p_quantity IS NOT NULL AND NOT v_found THEN
              SELECT price, price_type, COALESCE(discount_percentage,0), COALESCE(discount_amount,0), id
              INTO v_price, v_price_type, v_discount_pct, v_discount_amt, v_applied_price_id
              FROM product_prices
              WHERE product_id = p_product_id
                AND price_type = 'VOLUME'
                AND min_quantity <= p_quantity
                AND (max_quantity IS NULL OR max_quantity >= p_quantity)
                AND is_active = 1
                AND (valid_from IS NULL OR valid_from <= NOW())
                AND (valid_to IS NULL OR valid_to >= NOW())
              ORDER BY min_quantity DESC, created_at DESC
              LIMIT 1;

              IF v_price > 0 THEN SET v_found = TRUE; END IF;
          END IF;

          -- 5) STANDARD
          IF NOT v_found THEN
              SELECT price, price_type, COALESCE(discount_percentage,0), COALESCE(discount_amount,0), id
              INTO v_price, v_price_type, v_discount_pct, v_discount_amt, v_applied_price_id
              FROM product_prices
              WHERE product_id = p_product_id
                AND price_type = 'STANDARD'
                AND is_active = 1
                AND (valid_from IS NULL OR valid_from <= NOW())
                AND (valid_to IS NULL OR valid_to >= NOW())
              ORDER BY created_at DESC
              LIMIT 1;
          END IF;

          -- discount: percentage overrides amount if present
          IF v_discount_pct > 0 THEN
              SET v_discount_amt = ROUND(v_price * v_discount_pct / 100, 2);
          END IF;

          SET v_final_price = GREATEST(0, v_price - v_discount_amt);

          SELECT 
              v_price AS price,
              v_price_type AS price_type,
              v_discount_amt AS discount_amount,
              v_final_price AS final_price,
              v_applied_price_id AS applied_price_id;
      END
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // revert to the previous 3-parameter version (minimal compatible fallback)
    await queryRunner.query(`DROP PROCEDURE IF EXISTS sp_GetProductPrice`);
    await queryRunner.query(`
      CREATE PROCEDURE sp_GetProductPrice(
          IN p_product_id INT,
          IN p_customer_id INT,
          IN p_quantity INT
      )
      BEGIN
          DECLARE v_price DECIMAL(15,2) DEFAULT 0;
          DECLARE v_price_type VARCHAR(20) DEFAULT 'STANDARD';
          DECLARE v_discount_amt DECIMAL(15,2) DEFAULT 0;
          DECLARE v_final_price DECIMAL(15,2) DEFAULT 0;
          DECLARE v_applied_price_id INT DEFAULT 0;
          DECLARE v_found BOOLEAN DEFAULT FALSE;

          IF p_customer_id IS NOT NULL AND NOT v_found THEN
              SELECT price, price_type, COALESCE(discount_amount,0), id
              INTO v_price, v_price_type, v_discount_amt, v_applied_price_id
              FROM product_prices
              WHERE product_id = p_product_id AND price_type = 'CUSTOMER' AND customer_id = p_customer_id AND is_active = 1
              AND (valid_from IS NULL OR valid_from <= NOW()) AND (valid_to IS NULL OR valid_to >= NOW())
              ORDER BY created_at DESC LIMIT 1;
              IF v_price > 0 THEN SET v_found = TRUE; END IF;
          END IF;

          IF p_quantity IS NOT NULL AND NOT v_found THEN
              SELECT price, price_type, COALESCE(discount_amount,0), id
              INTO v_price, v_price_type, v_discount_amt, v_applied_price_id
              FROM product_prices
              WHERE product_id = p_product_id AND price_type = 'VOLUME' AND min_quantity <= p_quantity
                AND (max_quantity IS NULL OR max_quantity >= p_quantity) AND is_active = 1
                AND (valid_from IS NULL OR valid_from <= NOW()) AND (valid_to IS NULL OR valid_to >= NOW())
              ORDER BY min_quantity DESC LIMIT 1;
              IF v_price > 0 THEN SET v_found = TRUE; END IF;
          END IF;

          IF NOT v_found THEN
              SELECT price, price_type, COALESCE(discount_amount,0), id
              INTO v_price, v_price_type, v_discount_amt, v_applied_price_id
              FROM product_prices
              WHERE product_id = p_product_id AND price_type = 'STANDARD' AND is_active = 1
                AND (valid_from IS NULL OR valid_from <= NOW()) AND (valid_to IS NULL OR valid_to >= NOW())
              ORDER BY created_at DESC LIMIT 1;
          END IF;

          SET v_final_price = GREATEST(0, v_price - v_discount_amt);
          SELECT v_price AS price, v_price_type AS price_type, v_discount_amt AS discount_amount, v_final_price AS final_price, v_applied_price_id AS applied_price_id;
      END
    `);
  }
}



