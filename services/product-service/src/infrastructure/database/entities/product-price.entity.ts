import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Product } from "./product.entity";

/**
 * ProductPrice Entity - Refactored (removed price_type, min_quantity, max_quantity, discount_percentage)
 * Added document_price field
 * Updated: 2025-11-10 - Removed deprecated fields
 */
@Entity("product_prices")
@Index(["product_id"])
@Index(["is_active"])
export class ProductPrice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int" })
  product_id: number;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  price: number;

  @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
  document_price: number;

  @Column({ type: "boolean", default: true })
  is_active: boolean;

  @Column({ type: "text", nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: "int", nullable: true })
  created_by: number;

  @Column({ type: "int", nullable: true })
  updated_by: number;

  // Relationships
  @ManyToOne(() => Product, (product) => product.prices)
  @JoinColumn({ name: "product_id" })
  product: Product;
}