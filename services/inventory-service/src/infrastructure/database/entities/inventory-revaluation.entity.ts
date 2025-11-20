import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { RevaluationItem } from './revaluation-item.entity';

@Entity('inventory_revaluations')
export class InventoryRevaluation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  revaluation_number: string;

  @Column()
  warehouse_id: number;

  @Column({ type: 'date' })
  revaluation_date: Date;

  @Column({
    type: 'enum',
    enum: ['DRAFT', 'POSTED', 'CANCELLED'],
    default: 'DRAFT',
  })
  status: string;

  @Column({ length: 255 })
  revalued_by: string;

  @Column({ length: 500 })
  reason: string;

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

  @OneToMany(() => RevaluationItem, (item) => item.revaluation)
  items: RevaluationItem[];
}
