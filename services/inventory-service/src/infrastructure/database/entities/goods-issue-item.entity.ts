import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { GoodsIssue } from './goods-issue.entity';

@Entity('goods_issue_items')
export class GoodsIssueItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  goods_issue_id: number;

  @Column()
  product_id: number;

  @Column({ length: 255 })
  product_name: string;

  @Column({ length: 100 })
  product_sku: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ length: 50 })
  unit: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  unit_cost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  total_amount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => GoodsIssue, (goodsIssue) => goodsIssue.items)
  @JoinColumn({ name: 'goods_issue_id' })
  goodsIssue: GoodsIssue;
}
