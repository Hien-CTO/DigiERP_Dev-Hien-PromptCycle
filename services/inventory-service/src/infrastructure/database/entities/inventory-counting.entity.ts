import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { CountingItem } from './counting-item.entity';

@Entity('inventory_countings')
export class InventoryCounting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  counting_number: string;

  @Column()
  warehouse_id: number;

  @Column({ type: 'date' })
  counting_date: Date;

  @Column({
    type: 'enum',
    enum: ['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'POSTED', 'CANCELLED'],
    default: 'DRAFT',
  })
  status: string;

  @Column({ length: 255 })
  counted_by: string;

  @Column({ length: 255, nullable: true })
  reviewed_by: string;

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

  @OneToMany(() => CountingItem, (item) => item.counting)
  items: CountingItem[];
}
