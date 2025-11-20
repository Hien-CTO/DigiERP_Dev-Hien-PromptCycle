import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Product } from "./product.entity";

@Entity("cat_product_categories")
export class ProductCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ type: "varchar", length: 200, nullable: true })
  description: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  code: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  parent_category: string;

  @Column({ type: "int", nullable: true })
  parent_id: number;

  @Column({ type: "int", default: 0 })
  sort_order: number;

  @Column({ type: "boolean", default: true })
  is_active: boolean;

  @Column({ type: "varchar", length: 500, nullable: true })
  image_url: string;

  @Column({ type: "varchar", length: 200, nullable: true })
  meta_title: string;

  @Column({ type: "text", nullable: true })
  meta_description: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  meta_keywords: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: "int", nullable: true })
  created_by: number;

  @Column({ type: "int", nullable: true })
  updated_by: number;

  // Self-referencing relationship for parent-child categories
  @ManyToOne(() => ProductCategory, (category) => category.children)
  @JoinColumn({ name: "parent_id" })
  parent: ProductCategory;

  @OneToMany(() => ProductCategory, (category) => category.parent)
  children: ProductCategory[];

  // Relationship with products - Simplified to avoid circular dependencies
  @OneToMany("Product", "category")
  products: any[];
}
