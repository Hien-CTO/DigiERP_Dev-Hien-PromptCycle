import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { PostingItem } from './posting-item.entity';

@Entity('inventory_postings')
export class InventoryPosting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  posting_number: string;

  @Column({ nullable: true })
  counting_id: number;

  @Column()
  warehouse_id: number;

  @Column({ type: 'date' })
  posting_date: Date;

  @Column({
    type: 'enum',
    enum: ['DRAFT', 'POSTED', 'CANCELLED'],
    default: 'DRAFT',
  })
  status: string;

  @Column({ length: 255 })
  posted_by: string;

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

  @OneToMany(() => PostingItem, (item) => item.posting)
  items: PostingItem[];
}
