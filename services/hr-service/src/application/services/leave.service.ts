import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { LeaveRequestRepository } from '@/infrastructure/database/repositories/leave-request.repository';
import { LeaveBalanceRepository } from '@/infrastructure/database/repositories/leave-balance.repository';
import { LeaveEntitlementRepository } from '@/infrastructure/database/repositories/leave-entitlement.repository';
import { LeaveRequestApprovalRepository } from '@/infrastructure/database/repositories/leave-request-approval.repository';
import { LeaveRequestEditHistoryRepository } from '@/infrastructure/database/repositories/leave-request-edit-history.repository';
import { EmployeeRepository } from '@/infrastructure/database/repositories/employee.repository';
import { LeaveRequest } from '@/infrastructure/database/entities/leave-request.entity';
import { LeaveBalance } from '@/infrastructure/database/entities/leave-balance.entity';
import { LeaveRequestApproval } from '@/infrastructure/database/entities/leave-request-approval.entity';
import { LeaveRequestEditHistory } from '@/infrastructure/database/entities/leave-request-edit-history.entity';
import {
  CreateLeaveRequestDto,
  UpdateLeaveRequestDto,
  ApproveLeaveRequestDto,
  RejectLeaveRequestDto,
  CancelLeaveRequestDto,
  LeaveRequestStatus,
  ApprovalLevel,
  ApprovalStatus,
} from '@/application/dtos/leave.dto';

@Injectable()
export class LeaveService {
  private readonly logger = new Logger(LeaveService.name);

  constructor(
    private readonly leaveRequestRepository: LeaveRequestRepository,
    private readonly leaveBalanceRepository: LeaveBalanceRepository,
    private readonly leaveEntitlementRepository: LeaveEntitlementRepository,
    private readonly leaveRequestApprovalRepository: LeaveRequestApprovalRepository,
    private readonly leaveRequestEditHistoryRepository: LeaveRequestEditHistoryRepository,
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  /**
   * Calculate total days for leave request
   */
  private calculateTotalDays(
    startDate: Date,
    endDate: Date,
    isHalfDay: boolean,
  ): number {
    if (isHalfDay) {
      return 0.5;
    }

    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }

  /**
   * Validate leave request dates
   */
  private validateLeaveDates(startDate: Date, endDate: Date, isHalfDay: boolean): void {
    if (endDate < startDate) {
      throw new BadRequestException('End date must be greater than or equal to start date');
    }

    if (isHalfDay && startDate.toDateString() !== endDate.toDateString()) {
      throw new BadRequestException('Half day leave must be on the same day');
    }
  }

  /**
   * Check if employee has sufficient leave balance
   */
  private async checkLeaveBalance(
    employeeId: number,
    leaveTypeId: number,
    totalDays: number,
    year: number,
  ): Promise<boolean> {
    const balance = await this.leaveBalanceRepository.findByEmployeeAndTypeAndYear(
      employeeId,
      leaveTypeId,
      year,
    );

    if (!balance) {
      // If no balance record exists, check if we should create one or reject
      // For now, we'll allow it and create balance later
      return true;
    }

    const availableDays = Number(balance.remaining_days) - Number(balance.pending_days);
    return availableDays >= totalDays;
  }

  /**
   * Update leave balance when request is created
   */
  private async updateBalanceOnCreate(
    employeeId: number,
    leaveTypeId: number,
    totalDays: number,
    year: number,
  ): Promise<void> {
    let balance = await this.leaveBalanceRepository.findByEmployeeAndTypeAndYear(
      employeeId,
      leaveTypeId,
      year,
    );

    if (!balance) {
      balance = await this.leaveBalanceRepository.create({
        employee_id: employeeId,
        leave_type_id: leaveTypeId,
        year,
        entitlement_days: 0,
        used_days: 0,
        remaining_days: 0,
        carry_over_days: 0,
        expired_days: 0,
        pending_days: 0,
      });
    }

    balance.pending_days = Number(balance.pending_days) + totalDays;
    await this.leaveBalanceRepository.update(balance.id, {
      pending_days: balance.pending_days,
      last_calculated_at: new Date(),
    });
    await this.leaveBalanceRepository.recalculateRemainingDays(balance.id);
  }

  /**
   * Update leave balance when request is approved
   */
  private async updateBalanceOnApprove(
    employeeId: number,
    leaveTypeId: number,
    totalDays: number,
    year: number,
  ): Promise<void> {
    const balance = await this.leaveBalanceRepository.findByEmployeeAndTypeAndYear(
      employeeId,
      leaveTypeId,
      year,
    );

    if (balance) {
      balance.pending_days = Math.max(0, Number(balance.pending_days) - totalDays);
      balance.used_days = Number(balance.used_days) + totalDays;
      await this.leaveBalanceRepository.update(balance.id, {
        pending_days: balance.pending_days,
        used_days: balance.used_days,
        last_calculated_at: new Date(),
      });
      await this.leaveBalanceRepository.recalculateRemainingDays(balance.id);
    }
  }

  /**
   * Update leave balance when request is rejected or cancelled
   */
  private async updateBalanceOnRejectOrCancel(
    employeeId: number,
    leaveTypeId: number,
    totalDays: number,
    year: number,
    wasApproved: boolean,
  ): Promise<void> {
    const balance = await this.leaveBalanceRepository.findByEmployeeAndTypeAndYear(
      employeeId,
      leaveTypeId,
      year,
    );

    if (balance) {
      if (wasApproved) {
        balance.used_days = Math.max(0, Number(balance.used_days) - totalDays);
      } else {
        balance.pending_days = Math.max(0, Number(balance.pending_days) - totalDays);
      }
      await this.leaveBalanceRepository.update(balance.id, {
        pending_days: balance.pending_days,
        used_days: balance.used_days,
        last_calculated_at: new Date(),
      });
      await this.leaveBalanceRepository.recalculateRemainingDays(balance.id);
    }
  }

  /**
   * Create leave request
   */
  async createLeaveRequest(
    dto: CreateLeaveRequestDto,
    userId: number,
  ): Promise<LeaveRequest> {
    // 1. Validate employee exists
    const employee = await this.employeeRepository.findById(dto.employee_id);
    if (!employee || !employee.is_active) {
      throw new NotFoundException('Employee not found or not active');
    }

    // 2. Validate dates
    const startDate = new Date(dto.start_date);
    const endDate = new Date(dto.end_date);
    this.validateLeaveDates(startDate, endDate, dto.is_half_day || false);

    // 3. Calculate total days
    const totalDays = this.calculateTotalDays(startDate, endDate, dto.is_half_day || false);

    // 4. Get year from start date
    const year = startDate.getFullYear();

    // 5. Check leave balance
    const hasBalance = await this.checkLeaveBalance(
      dto.employee_id,
      dto.leave_type_id,
      totalDays,
      year,
    );
    if (!hasBalance) {
      throw new BadRequestException('Insufficient leave balance');
    }

    // 6. Generate request number
    const requestNumber = await this.leaveRequestRepository.generateRequestNumber();

    // 7. Determine approver (manager)
    const approverId = employee.manager_id || null;
    const hrApproverId = dto.requires_hr_approval ? null : null; // TODO: Get HR manager

    // 8. Create leave request
    const leaveRequest = await this.leaveRequestRepository.create({
      request_number: requestNumber,
      employee_id: dto.employee_id,
      leave_type_id: dto.leave_type_id,
      start_date: startDate,
      end_date: endDate,
      total_days: totalDays,
      is_half_day: dto.is_half_day || false,
      half_day_type: dto.half_day_type || null,
      reason: dto.reason,
      approver_id: approverId,
      hr_approver_id: hrApproverId,
      requires_hr_approval: dto.requires_hr_approval || false,
      status: LeaveRequestStatus.PENDING,
      attachment_url: dto.attachment_url || null,
      notes: dto.notes || null,
      created_by: userId,
      updated_by: userId,
    });

    // 9. Update balance (add to pending)
    await this.updateBalanceOnCreate(dto.employee_id, dto.leave_type_id, totalDays, year);

    // 10. Create approval records
    if (approverId) {
      await this.leaveRequestApprovalRepository.create({
        leave_request_id: leaveRequest.id,
        approval_level: ApprovalLevel.MANAGER,
        approver_id: approverId,
        status: ApprovalStatus.PENDING,
        created_by: userId,
      });
    }

    if (dto.requires_hr_approval && hrApproverId) {
      await this.leaveRequestApprovalRepository.create({
        leave_request_id: leaveRequest.id,
        approval_level: ApprovalLevel.HR_MANAGER,
        approver_id: hrApproverId,
        status: ApprovalStatus.PENDING,
        created_by: userId,
      });
    }

    return await this.leaveRequestRepository.findById(leaveRequest.id);
  }

  /**
   * Get leave request by ID
   */
  async getLeaveRequestById(id: number): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRequestRepository.findById(id);
    if (!leaveRequest) {
      throw new NotFoundException('Leave request not found');
    }
    return leaveRequest;
  }

  /**
   * Get leave requests with filters
   */
  async getLeaveRequests(
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
  ) {
    return await this.leaveRequestRepository.findAll(page, limit, filters);
  }

  /**
   * Update leave request
   */
  async updateLeaveRequest(
    id: number,
    dto: UpdateLeaveRequestDto,
    userId: number,
  ): Promise<LeaveRequest> {
    const existingRequest = await this.leaveRequestRepository.findById(id);
    if (!existingRequest) {
      throw new NotFoundException('Leave request not found');
    }

    // Only allow editing if status is PENDING or APPROVED
    if (existingRequest.status !== LeaveRequestStatus.PENDING && 
        existingRequest.status !== LeaveRequestStatus.APPROVED) {
      throw new BadRequestException('Cannot edit leave request with current status');
    }

    // Track old values for edit history
    const oldValues: any = {
      leave_type_id: existingRequest.leave_type_id,
      start_date: existingRequest.start_date,
      end_date: existingRequest.end_date,
      total_days: existingRequest.total_days,
      is_half_day: existingRequest.is_half_day,
      half_day_type: existingRequest.half_day_type,
      reason: existingRequest.reason,
    };

    // Prepare update data
    const updateData: any = {};
    const changedFields: string[] = [];

    if (dto.leave_type_id !== undefined && dto.leave_type_id !== existingRequest.leave_type_id) {
      updateData.leave_type_id = dto.leave_type_id;
      changedFields.push('leave_type_id');
    }

    if (dto.start_date) {
      const newStartDate = new Date(dto.start_date);
      if (newStartDate.toDateString() !== existingRequest.start_date.toDateString()) {
        updateData.start_date = newStartDate;
        changedFields.push('start_date');
      }
    }

    if (dto.end_date) {
      const newEndDate = new Date(dto.end_date);
      if (newEndDate.toDateString() !== existingRequest.end_date.toDateString()) {
        updateData.end_date = newEndDate;
        changedFields.push('end_date');
      }
    }

    if (dto.is_half_day !== undefined && dto.is_half_day !== existingRequest.is_half_day) {
      updateData.is_half_day = dto.is_half_day;
      changedFields.push('is_half_day');
    }

    if (dto.half_day_type !== undefined && dto.half_day_type !== existingRequest.half_day_type) {
      updateData.half_day_type = dto.half_day_type;
      changedFields.push('half_day_type');
    }

    if (dto.reason && dto.reason !== existingRequest.reason) {
      updateData.reason = dto.reason;
      changedFields.push('reason');
    }

    if (dto.attachment_url !== undefined) {
      updateData.attachment_url = dto.attachment_url;
      changedFields.push('attachment_url');
    }

    if (dto.notes !== undefined) {
      updateData.notes = dto.notes;
      changedFields.push('notes');
    }

    if (changedFields.length === 0) {
      return existingRequest;
    }

    // Recalculate total days if dates changed
    const startDate = updateData.start_date || existingRequest.start_date;
    const endDate = updateData.end_date || existingRequest.end_date;
    const isHalfDay = updateData.is_half_day !== undefined ? updateData.is_half_day : existingRequest.is_half_day;
    
    this.validateLeaveDates(startDate, endDate, isHalfDay);
    const newTotalDays = this.calculateTotalDays(startDate, endDate, isHalfDay);
    updateData.total_days = newTotalDays;

    // If approved, need to restore balance and recalculate
    const wasApproved = existingRequest.status === LeaveRequestStatus.APPROVED;
    if (wasApproved) {
      const year = startDate.getFullYear();
      await this.updateBalanceOnRejectOrCancel(
        existingRequest.employee_id,
        existingRequest.leave_type_id,
        existingRequest.total_days,
        year,
        true,
      );
      await this.updateBalanceOnCreate(
        existingRequest.employee_id,
        updateData.leave_type_id || existingRequest.leave_type_id,
        newTotalDays,
        year,
      );
    }

    // Update leave request
    updateData.is_edited = true;
    updateData.edited_at = new Date();
    updateData.edited_by = userId;
    updateData.edit_reason = dto.edit_reason || null;
    updateData.updated_by = userId;

    const updatedRequest = await this.leaveRequestRepository.update(id, updateData);

    // Create edit history
    const newValues: any = {
      leave_type_id: updatedRequest.leave_type_id,
      start_date: updatedRequest.start_date,
      end_date: updatedRequest.end_date,
      total_days: updatedRequest.total_days,
      is_half_day: updatedRequest.is_half_day,
      half_day_type: updatedRequest.half_day_type,
      reason: updatedRequest.reason,
    };

    await this.leaveRequestEditHistoryRepository.create({
      leave_request_id: id,
      edited_by: userId,
      edited_at: new Date(),
      edit_reason: dto.edit_reason || null,
      old_values: oldValues,
      new_values: newValues,
      changed_fields: changedFields.join(','),
    });

    return updatedRequest;
  }

  /**
   * Approve leave request (Manager or HR Manager)
   */
  async approveLeaveRequest(
    id: number,
    dto: ApproveLeaveRequestDto,
    approverId: number,
    isHrManager: boolean = false,
  ): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRequestRepository.findById(id);
    if (!leaveRequest) {
      throw new NotFoundException('Leave request not found');
    }

    if (leaveRequest.status !== LeaveRequestStatus.PENDING) {
      throw new BadRequestException('Leave request is not pending');
    }

    // Check if approver is authorized
    if (isHrManager) {
      if (leaveRequest.hr_approver_id !== approverId) {
        throw new ForbiddenException('Not authorized to approve as HR Manager');
      }
    } else {
      if (leaveRequest.approver_id !== approverId) {
        throw new ForbiddenException('Not authorized to approve as Manager');
      }
    }

    const approvalLevel = isHrManager ? ApprovalLevel.HR_MANAGER : ApprovalLevel.MANAGER;
    const approval = await this.leaveRequestApprovalRepository.findByLeaveRequestIdAndLevel(
      id,
      approvalLevel,
    );

    if (!approval) {
      throw new NotFoundException('Approval record not found');
    }

    // Update approval record
    await this.leaveRequestApprovalRepository.update(approval.id, {
      status: ApprovalStatus.APPROVED,
      approved_at: new Date(),
      notes: dto.notes || null,
    });

    // Update leave request
    const updateData: any = {};
    if (isHrManager) {
      updateData.hr_approved_at = new Date();
      updateData.hr_notes = dto.notes || null;
      updateData.status = LeaveRequestStatus.APPROVED;
    } else {
      updateData.manager_approved_at = new Date();
      updateData.manager_notes = dto.notes || null;
      
      // If requires HR approval, keep status as PENDING
      if (leaveRequest.requires_hr_approval) {
        updateData.status = LeaveRequestStatus.PENDING;
      } else {
        updateData.status = LeaveRequestStatus.APPROVED;
      }
    }

    const updatedRequest = await this.leaveRequestRepository.update(id, updateData);

    // If fully approved, update balance
    if (updatedRequest.status === LeaveRequestStatus.APPROVED) {
      const year = new Date(updatedRequest.start_date).getFullYear();
      await this.updateBalanceOnApprove(
        updatedRequest.employee_id,
        updatedRequest.leave_type_id,
        updatedRequest.total_days,
        year,
      );
    }

    return updatedRequest;
  }

  /**
   * Reject leave request
   */
  async rejectLeaveRequest(
    id: number,
    dto: RejectLeaveRequestDto,
    rejectorId: number,
    isHrManager: boolean = false,
  ): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRequestRepository.findById(id);
    if (!leaveRequest) {
      throw new NotFoundException('Leave request not found');
    }

    if (leaveRequest.status !== LeaveRequestStatus.PENDING) {
      throw new BadRequestException('Leave request is not pending');
    }

    // Check if rejector is authorized
    if (isHrManager) {
      if (leaveRequest.hr_approver_id !== rejectorId) {
        throw new ForbiddenException('Not authorized to reject as HR Manager');
      }
    } else {
      if (leaveRequest.approver_id !== rejectorId) {
        throw new ForbiddenException('Not authorized to reject as Manager');
      }
    }

    const approvalLevel = isHrManager ? ApprovalLevel.HR_MANAGER : ApprovalLevel.MANAGER;
    const approval = await this.leaveRequestApprovalRepository.findByLeaveRequestIdAndLevel(
      id,
      approvalLevel,
    );

    if (!approval) {
      throw new NotFoundException('Approval record not found');
    }

    // Update approval record
    await this.leaveRequestApprovalRepository.update(approval.id, {
      status: ApprovalStatus.REJECTED,
      rejected_at: new Date(),
      rejection_reason: dto.rejection_reason,
      notes: dto.notes || null,
    });

    // Update leave request
    const updateData: any = {
      status: LeaveRequestStatus.REJECTED,
      rejected_at: new Date(),
    };

    if (isHrManager) {
      updateData.hr_rejection_reason = dto.rejection_reason;
      updateData.hr_notes = dto.notes || null;
    } else {
      updateData.manager_rejection_reason = dto.rejection_reason;
      updateData.manager_notes = dto.notes || null;
    }

    const updatedRequest = await this.leaveRequestRepository.update(id, updateData);

    // Restore balance
    const year = new Date(updatedRequest.start_date).getFullYear();
    await this.updateBalanceOnRejectOrCancel(
      updatedRequest.employee_id,
      updatedRequest.leave_type_id,
      updatedRequest.total_days,
      year,
      false,
    );

    return updatedRequest;
  }

  /**
   * Cancel leave request
   */
  async cancelLeaveRequest(
    id: number,
    dto: CancelLeaveRequestDto,
    userId: number,
  ): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRequestRepository.findById(id);
    if (!leaveRequest) {
      throw new NotFoundException('Leave request not found');
    }

    // Only allow cancellation if status is PENDING or APPROVED
    if (leaveRequest.status !== LeaveRequestStatus.PENDING && 
        leaveRequest.status !== LeaveRequestStatus.APPROVED) {
      throw new BadRequestException('Cannot cancel leave request with current status');
    }

    const wasApproved = leaveRequest.status === LeaveRequestStatus.APPROVED;

    // Update leave request
    const updatedRequest = await this.leaveRequestRepository.update(id, {
      status: LeaveRequestStatus.CANCELLED,
      cancellation_reason: dto.cancellation_reason,
      cancelled_at: new Date(),
      cancelled_by: userId,
    });

    // Restore balance
    const year = new Date(updatedRequest.start_date).getFullYear();
    await this.updateBalanceOnRejectOrCancel(
      updatedRequest.employee_id,
      updatedRequest.leave_type_id,
      updatedRequest.total_days,
      year,
      wasApproved,
    );

    return updatedRequest;
  }

  /**
   * Get leave balance for employee
   */
  async getLeaveBalance(
    employeeId: number,
    year?: number,
    leaveTypeId?: number,
  ): Promise<LeaveBalance[]> {
    return await this.leaveBalanceRepository.findByEmployeeId(employeeId, year);
  }
}

