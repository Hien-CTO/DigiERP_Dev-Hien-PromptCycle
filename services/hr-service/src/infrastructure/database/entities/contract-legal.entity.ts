import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Employee } from './employee.entity';
import { CatContractTypes } from './cat-contract-types.entity';

@Entity('contract_legal')
export class ContractLegal {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true, comment: 'Số hợp đồng' })
  @Index('idx_contract_number')
  contract_number: string;

  @Column({ type: 'int', comment: 'FK to employees.id' })
  @Index('idx_employee_id')
  employee_id: number;

  @Column({ type: 'int', comment: 'FK to cat_contract_types.id' })
  @Index('idx_contract_type_id')
  contract_type_id: number;

  // Thời hạn hợp đồng
  @Column({ type: 'date', comment: 'Ngày bắt đầu' })
  @Index('idx_start_date')
  start_date: Date;

  @Column({ type: 'date', nullable: true, comment: 'Ngày kết thúc - NULL nếu hợp đồng không xác định thời hạn' })
  @Index('idx_end_date')
  end_date: Date;

  @Column({ type: 'boolean', default: false, comment: 'Hợp đồng không xác định thời hạn' })
  is_indefinite: boolean;

  // Điều khoản
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  base_salary: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, comment: 'Phụ cấp' })
  allowances: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, comment: 'Thưởng' })
  bonus: number;

  @Column({ type: 'varchar', length: 3, default: 'VND' })
  currency: string;

  @Column({ type: 'int', default: 40 })
  working_hours_per_week: number;

  @Column({ type: 'int', default: 0 })
  probation_period_days: number;

  // Thông tin ký kết
  @Column({ type: 'date', nullable: true })
  signed_date: Date;

  @Column({ type: 'boolean', default: false })
  signed_by_employee: boolean;

  @Column({ type: 'boolean', default: false })
  signed_by_company: boolean;

  @Column({ type: 'varchar', length: 200, nullable: true, comment: 'Người đại diện công ty ký' })
  company_representative: string;

  // File đính kèm
  @Column({ type: 'text', nullable: true, comment: 'Link file hợp đồng' })
  contract_file_url: string;

  // Trạng thái
  @Column({
    type: 'enum',
    enum: ['DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED', 'CANCELLED'],
    default: 'DRAFT',
  })
  @Index('idx_status')
  status: string;

  // Ghi chú
  @Column({ type: 'text', nullable: true, comment: 'Điều khoản và điều kiện' })
  terms_conditions: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Audit
  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Column({ type: 'int', nullable: true })
  created_by: number;

  @Column({ type: 'int', nullable: true })
  updated_by: number;

  // Relations
  @ManyToOne(() => Employee, (emp) => emp.contracts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @ManyToOne(() => CatContractTypes, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'contract_type_id' })
  contractType: CatContractTypes;
}

