import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveBalance } from '../entities/leave-balance.entity';

@Injectable()
export class LeaveBalanceRepository {
  constructor(
    @InjectRepository(LeaveBalance)
    private readonly leaveBalanceRepository: Repository<LeaveBalance>,
  ) {}

  async findById(id: number): Promise<LeaveBalance | null> {
    return await this.leaveBalanceRepository.findOne({
      where: { id },
      relations: ['employee', 'leaveType'],
    });
  }

  async findByEmployeeAndTypeAndYear(
    employeeId: number,
    leaveTypeId: number,
    year: number,
  ): Promise<LeaveBalance | null> {
    return await this.leaveBalanceRepository.findOne({
      where: {
        employee_id: employeeId,
        leave_type_id: leaveTypeId,
        year,
      },
      relations: ['employee', 'leaveType'],
    });
  }

  async findByEmployeeId(
    employeeId: number,
    year?: number,
  ): Promise<LeaveBalance[]> {
    const where: any = { employee_id: employeeId };
    if (year) {
      where.year = year;
    }

    return await this.leaveBalanceRepository.find({
      where,
      relations: ['employee', 'leaveType'],
      order: { year: 'DESC', leave_type_id: 'ASC' },
    });
  }

  async create(leaveBalanceData: Partial<LeaveBalance>): Promise<LeaveBalance> {
    const leaveBalance = this.leaveBalanceRepository.create(leaveBalanceData);
    return await this.leaveBalanceRepository.save(leaveBalance);
  }

  async update(id: number, leaveBalanceData: Partial<LeaveBalance>): Promise<LeaveBalance | null> {
    await this.leaveBalanceRepository.update(id, leaveBalanceData);
    return await this.findById(id);
  }

  async updateOrCreate(
    employeeId: number,
    leaveTypeId: number,
    year: number,
    leaveBalanceData: Partial<LeaveBalance>,
  ): Promise<LeaveBalance> {
    const existing = await this.findByEmployeeAndTypeAndYear(employeeId, leaveTypeId, year);
    
    if (existing) {
      await this.leaveBalanceRepository.update(existing.id, leaveBalanceData);
      return await this.findById(existing.id);
    } else {
      return await this.create({
        employee_id: employeeId,
        leave_type_id: leaveTypeId,
        year,
        ...leaveBalanceData,
      });
    }
  }

  async recalculateRemainingDays(id: number): Promise<void> {
    const balance = await this.findById(id);
    if (balance) {
      balance.remaining_days =
        Number(balance.entitlement_days) +
        Number(balance.carry_over_days) -
        Number(balance.used_days) -
        Number(balance.pending_days) -
        Number(balance.expired_days);
      balance.last_calculated_at = new Date();
      await this.leaveBalanceRepository.save(balance);
    }
  }
}

