import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { LeaveRequest } from '../entities/leave-request.entity';
import { LeaveRequestStatus } from '@/application/dtos/leave.dto';

@Injectable()
export class LeaveRequestRepository {
  constructor(
    @InjectRepository(LeaveRequest)
    private readonly leaveRequestRepository: Repository<LeaveRequest>,
  ) {}

  async findById(id: number): Promise<LeaveRequest | null> {
    return await this.leaveRequestRepository.findOne({
      where: { id },
      relations: ['employee', 'leaveType', 'approver', 'hrApprover'],
    });
  }

  async findByRequestNumber(requestNumber: string): Promise<LeaveRequest | null> {
    return await this.leaveRequestRepository.findOne({
      where: { request_number: requestNumber },
      relations: ['employee', 'leaveType', 'approver', 'hrApprover'],
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters?: {
      employee_id?: number;
      leave_type_id?: number;
      status?: LeaveRequestStatus;
      date_from?: Date;
      date_to?: Date;
      search?: string;
    },
  ): Promise<{ leaveRequests: LeaveRequest[]; total: number }> {
    const queryBuilder = this.leaveRequestRepository
      .createQueryBuilder('leaveRequest')
      .leftJoinAndSelect('leaveRequest.employee', 'employee')
      .leftJoinAndSelect('leaveRequest.leaveType', 'leaveType')
      .leftJoinAndSelect('leaveRequest.approver', 'approver')
      .leftJoinAndSelect('leaveRequest.hrApprover', 'hrApprover');

    if (filters?.employee_id) {
      queryBuilder.andWhere('leaveRequest.employee_id = :employee_id', {
        employee_id: filters.employee_id,
      });
    }

    if (filters?.leave_type_id) {
      queryBuilder.andWhere('leaveRequest.leave_type_id = :leave_type_id', {
        leave_type_id: filters.leave_type_id,
      });
    }

    if (filters?.status) {
      queryBuilder.andWhere('leaveRequest.status = :status', {
        status: filters.status,
      });
    }

    if (filters?.date_from && filters?.date_to) {
      queryBuilder.andWhere('leaveRequest.start_date <= :date_to', {
        date_to: filters.date_to,
      });
      queryBuilder.andWhere('leaveRequest.end_date >= :date_from', {
        date_from: filters.date_from,
      });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(leaveRequest.request_number LIKE :search OR employee.first_name LIKE :search OR employee.last_name LIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    const [leaveRequests, total] = await queryBuilder
      .orderBy('leaveRequest.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { leaveRequests, total };
  }

  async findByEmployeeId(
    employeeId: number,
    page: number = 1,
    limit: number = 10,
    filters?: {
      status?: LeaveRequestStatus;
      date_from?: Date;
      date_to?: Date;
    },
  ): Promise<{ leaveRequests: LeaveRequest[]; total: number }> {
    return this.findAll(page, limit, {
      employee_id: employeeId,
      ...filters,
    });
  }

  async findByApproverId(
    approverId: number,
    page: number = 1,
    limit: number = 10,
    status?: LeaveRequestStatus,
  ): Promise<{ leaveRequests: LeaveRequest[]; total: number }> {
    const queryBuilder = this.leaveRequestRepository
      .createQueryBuilder('leaveRequest')
      .leftJoinAndSelect('leaveRequest.employee', 'employee')
      .leftJoinAndSelect('leaveRequest.leaveType', 'leaveType')
      .where('(leaveRequest.approver_id = :approverId OR leaveRequest.hr_approver_id = :approverId)', {
        approverId,
      });

    if (status) {
      queryBuilder.andWhere('leaveRequest.status = :status', { status });
    }

    const [leaveRequests, total] = await queryBuilder
      .orderBy('leaveRequest.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { leaveRequests, total };
  }

  async create(leaveRequestData: Partial<LeaveRequest>): Promise<LeaveRequest> {
    const leaveRequest = this.leaveRequestRepository.create(leaveRequestData);
    return await this.leaveRequestRepository.save(leaveRequest);
  }

  async update(id: number, leaveRequestData: Partial<LeaveRequest>): Promise<LeaveRequest | null> {
    await this.leaveRequestRepository.update(id, leaveRequestData);
    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.leaveRequestRepository.delete(id);
    return result.affected > 0;
  }

  async generateRequestNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `LR-${year}`;
    const lastRequest = await this.leaveRequestRepository
      .createQueryBuilder('leaveRequest')
      .where('leaveRequest.request_number LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('leaveRequest.request_number', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastRequest) {
      const lastSequence = parseInt(lastRequest.request_number.split('-').pop() || '0', 10);
      sequence = lastSequence + 1;
    }

    return `${prefix}-${sequence.toString().padStart(6, '0')}`;
  }
}

