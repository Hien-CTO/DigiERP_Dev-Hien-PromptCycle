import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveEntitlement } from '../entities/leave-entitlement.entity';

@Injectable()
export class LeaveEntitlementRepository {
  constructor(
    @InjectRepository(LeaveEntitlement)
    private readonly leaveEntitlementRepository: Repository<LeaveEntitlement>,
  ) {}

  async findById(id: number): Promise<LeaveEntitlement | null> {
    return await this.leaveEntitlementRepository.findOne({
      where: { id },
      relations: ['employee', 'leaveType'],
    });
  }

  async findByEmployeeId(
    employeeId: number,
    year?: number,
    leaveTypeId?: number,
  ): Promise<LeaveEntitlement[]> {
    const where: any = { employee_id: employeeId };
    if (year) {
      where.year = year;
    }
    if (leaveTypeId) {
      where.leave_type_id = leaveTypeId;
    }

    return await this.leaveEntitlementRepository.find({
      where,
      relations: ['employee', 'leaveType'],
      order: { granted_date: 'DESC' },
    });
  }

  async create(leaveEntitlementData: Partial<LeaveEntitlement>): Promise<LeaveEntitlement> {
    const leaveEntitlement = this.leaveEntitlementRepository.create(leaveEntitlementData);
    return await this.leaveEntitlementRepository.save(leaveEntitlement);
  }

  async update(id: number, leaveEntitlementData: Partial<LeaveEntitlement>): Promise<LeaveEntitlement | null> {
    await this.leaveEntitlementRepository.update(id, leaveEntitlementData);
    return await this.findById(id);
  }
}

