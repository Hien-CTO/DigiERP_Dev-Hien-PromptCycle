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
} from 'typeorm';
import { Department } from './department.entity';
import { Position } from './position.entity';
import { CatEmployeeStatus } from './cat-employee-status.entity';
import { CatContractTypes } from './cat-contract-types.entity';
import { ContractLegal } from './contract-legal.entity';
import { AttendanceRecord } from './attendance-record.entity';
import { LeaveRequest } from './leave-request.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true, comment: 'Mã nhân viên' })
  @Index('idx_employee_code')
  employee_code: string;

  @Column({ type: 'int', nullable: true, comment: 'FK to users.id - Liên kết với tài khoản hệ thống' })
  @Index('idx_user_id')
  user_id: number;

  // Thông tin cá nhân
  @Column({ type: 'varchar', length: 100 })
  first_name: string;

  @Column({ type: 'varchar', length: 100 })
  last_name: string;

  @Column({ 
    type: 'varchar', 
    length: 200, 
    generatedType: 'STORED', 
    asExpression: "CONCAT(first_name, ' ', last_name)",
    select: false // Don't select by default, it's a generated column
  })
  full_name: string;

  @Column({ type: 'enum', enum: ['MALE', 'FEMALE', 'OTHER'], nullable: true })
  gender: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  @Column({ type: 'varchar', length: 200, nullable: true })
  place_of_birth: string;

  // CMND/CCCD
  @Column({ type: 'varchar', length: 20, nullable: true, unique: true })
  id_card_number: string;

  @Column({ type: 'date', nullable: true })
  id_card_issued_date: Date;

  @Column({ type: 'varchar', length: 200, nullable: true })
  id_card_issued_place: string;

  // Địa chỉ
  @Column({ type: 'text', nullable: true, comment: 'Địa chỉ thường trú' })
  permanent_address: string;

  @Column({ type: 'text', nullable: true, comment: 'Địa chỉ tạm trú' })
  temporary_address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  province: string;

  @Column({ type: 'varchar', length: 100, default: 'Vietnam' })
  country: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  postal_code: string;

  // Liên hệ
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  emergency_contact_name: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  emergency_contact_phone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  emergency_contact_relationship: string;

  // Thông tin công việc
  @Column({ type: 'int', nullable: true, comment: 'FK to departments.id' })
  @Index('idx_department_id')
  department_id: number;

  @Column({ type: 'int', nullable: true, comment: 'FK to positions.id' })
  @Index('idx_position_id')
  position_id: number;

  @Column({ type: 'int', nullable: true, comment: 'FK to employees.id - Quản lý trực tiếp' })
  @Index('idx_manager_id')
  manager_id: number;

  // Ngày làm việc
  @Column({ type: 'date', comment: 'Ngày vào làm' })
  @Index('idx_hire_date')
  hire_date: Date;

  @Column({ type: 'date', nullable: true, comment: 'Ngày kết thúc thử việc' })
  probation_end_date: Date;

  @Column({ type: 'date', nullable: true, comment: 'Ngày nghỉ việc' })
  resignation_date: Date;

  // Trạng thái
  @Column({ type: 'int', nullable: true, comment: 'FK to cat_employee_status.id' })
  @Index('idx_status_id')
  status_id: number;

  @Column({ type: 'int', nullable: true, comment: 'FK to cat_contract_types.id' })
  contract_type_id: number;

  // Lương
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  base_salary: number;

  @Column({ type: 'varchar', length: 3, default: 'VND' })
  currency: string;

  // Thông tin khác
  @Column({ type: 'text', nullable: true })
  avatar_url: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'boolean', default: true })
  @Index('idx_is_active')
  is_active: boolean;

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
  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(() => Position, { nullable: true })
  @JoinColumn({ name: 'position_id' })
  position: Position;

  @ManyToOne(() => Employee, (emp) => emp.subordinates, { nullable: true })
  @JoinColumn({ name: 'manager_id' })
  manager: Employee;

  @OneToMany(() => Employee, (emp) => emp.manager)
  subordinates: Employee[];

  @ManyToOne(() => CatEmployeeStatus, { nullable: true })
  @JoinColumn({ name: 'status_id' })
  status: CatEmployeeStatus;

  @ManyToOne(() => CatContractTypes, { nullable: true })
  @JoinColumn({ name: 'contract_type_id' })
  contractType: CatContractTypes;

  @OneToMany(() => ContractLegal, (contract) => contract.employee)
  contracts: ContractLegal[];

  @OneToMany(() => AttendanceRecord, (attendance) => attendance.employee)
  attendanceRecords: AttendanceRecord[];

  @OneToMany(() => LeaveRequest, (leave) => leave.employee)
  leaveRequests: LeaveRequest[];
}

