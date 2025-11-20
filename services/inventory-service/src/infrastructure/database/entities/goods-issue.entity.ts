import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { GoodsIssueItem } from './goods-issue-item.entity';

@Entity('goods_issues')
export class GoodsIssue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  issue_number: string;

  @Column({ nullable: true })
  sales_order_id: number;

  @Column()
  warehouse_id: number;

  @Column({ type: 'date' })
  issue_date: Date;

  @Column({
    type: 'enum',
    enum: ['DRAFT', 'PENDING', 'ISSUED', 'VERIFIED', 'CANCELLED'],
    default: 'DRAFT',
  })
  status: string;

  @Column({ length: 255, nullable: true })
  issued_by: string;

  @Column({ length: 255, nullable: true })
  verified_by: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column()
  created_by: number;

  @Column()
  updated_by: number;

  @OneToMany(() => GoodsIssueItem, (item) => item.goodsIssue)
  items: GoodsIssueItem[];
}
