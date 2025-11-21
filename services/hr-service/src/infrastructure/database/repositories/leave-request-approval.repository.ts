import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveRequestApproval } from '../entities/leave-request-approval.entity';
import { ApprovalLevel, ApprovalStatus } from '@/application/dtos/leave.dto';

@Injectable()
export class LeaveRequestApprovalRepository {
  constructor(
    @InjectRepository(LeaveRequestApproval)
    private readonly leaveRequestApprovalRepository: Repository<LeaveRequestApproval>,
  ) {}

  async findById(id: number): Promise<LeaveRequestApproval | null> {
    return await this.leaveRequestApprovalRepository.findOne({
      where: { id },
      relations: ['leaveRequest', 'approver'],
    });
  }

  async findByLeaveRequestId(leaveRequestId: number): Promise<LeaveRequestApproval[]> {
    return await this.leaveRequestApprovalRepository.find({
      where: { leave_request_id: leaveRequestId },
      relations: ['approver'],
      order: { created_at: 'ASC' },
    });
  }

  async findByLeaveRequestIdAndLevel(
    leaveRequestId: number,
    approvalLevel: ApprovalLevel,
  ): Promise<LeaveRequestApproval | null> {
    return await this.leaveRequestApprovalRepository.findOne({
      where: {
        leave_request_id: leaveRequestId,
        approval_level: approvalLevel,
      },
      relations: ['approver'],
    });
  }

  async create(approvalData: Partial<LeaveRequestApproval>): Promise<LeaveRequestApproval> {
    const approval = this.leaveRequestApprovalRepository.create(approvalData);
    return await this.leaveRequestApprovalRepository.save(approval);
  }

  async update(id: number, approvalData: Partial<LeaveRequestApproval>): Promise<LeaveRequestApproval | null> {
    await this.leaveRequestApprovalRepository.update(id, approvalData);
    return await this.findById(id);
  }
}

