import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from "typeorm";
import { ProductCategory } from "./product-category.entity";
import { ProductPrice } from "./product-price.entity";
import { Material } from "./material.entity";
import { Brand } from "./brand.entity";
import { FormulaProduct } from "./formula-product.entity";
import { Unit } from "./unit.entity";
import { ProductStatus } from "./product-status.entity";
import { StockStatus } from "./stock-status.entity";
import { PackagingType } from "./packaging-type.entity";

@Entity("products")
@Index(["category_id"])
@Index(["material_id"])
@Index(["is_active"])
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100, unique: true })
  sku: string;

  @Column({ type: "varchar", length: 200 })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "int" })
  category_id: number;

  @Column({ type: "int", nullable: true })
  material_id: number;

  @Column({ type: "int", nullable: true })
  brand_id: number;

  @Column({ type: "int", nullable: true })
  model_id: number;

  @Column({ type: "int", nullable: true })
  unit_id: number;

  @Column({ type: "int", nullable: true })
  packaging_type_id: number;

  @Column({ type: "varchar", length: 200, nullable: true })
  packaging: string;

  @Column({ type: "int", nullable: true })
  status_id: number;

  @Column({ type: "int", nullable: true })
  stock_status_id: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  weight: number;

  @Column({ type: "boolean", default: true })
  is_active: boolean;

  @Column({ type: "varchar", length: 500, nullable: true })
  image_url: string;

  @Column({ type: "text", nullable: true })
  images: string;

  @Column({ type: "int", default: 0 })
  sort_order: number;

  @Column({ type: "boolean", default: false })
  is_batch_managed: boolean;

  @Column({ type: "boolean", default: false })
  has_expiry_date: boolean;

  @Column({ type: "int", default: 30 })
  expiry_warning_days: number;

  @Column({ type: "boolean", default: false })
  batch_required: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: "int", nullable: true })
  created_by: number;

  @Column({ type: "int", nullable: true })
  updated_by: number;

  // Relationships - Simplified to avoid circular dependencies
  @OneToMany(() => ProductPrice, (price) => price.product)
  prices: ProductPrice[];
  @ManyToOne(() => ProductCategory, (category) => category.products)
  @JoinColumn({ name: "category_id" })
  category: ProductCategory;

  @ManyToOne(() => Material, (material) => material.products)
  @JoinColumn({ name: "material_id" })
  material: Material;

  @ManyToOne(() => Brand, (brand) => brand.products)
  @JoinColumn({ name: "brand_id" })
  brand: Brand;

  @ManyToOne(() => FormulaProduct, (model) => model.products)
  @JoinColumn({ name: "model_id" })
  model: FormulaProduct;

  @ManyToOne(() => Unit, (unit) => unit.products)
  @JoinColumn({ name: "unit_id" })
  unit: Unit;

  @ManyToOne(() => PackagingType, (packagingType) => packagingType.products)
  @JoinColumn({ name: "packaging_type_id" })
  packagingType: PackagingType;

  @ManyToOne(() => ProductStatus, (status) => status.products)
  @JoinColumn({ name: "status_id" })
  productStatus: ProductStatus;

  @ManyToOne(() => StockStatus, (stockStatus) => stockStatus.products)
  @JoinColumn({ name: "stock_status_id" })
  stockStatus: StockStatus;

}
