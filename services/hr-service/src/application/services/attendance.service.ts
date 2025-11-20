import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceRepository } from '@/infrastructure/database/repositories/attendance.repository';
import { EmployeeRepository } from '@/infrastructure/database/repositories/employee.repository';
import { AttendanceRecord } from '@/infrastructure/database/entities/attendance-record.entity';
import { Employee } from '@/infrastructure/database/entities/employee.entity';
import {
  CheckInDto,
  CheckOutDto,
  EditAttendanceDto,
  ApproveAttendanceDto,
  RejectAttendanceDto,
} from '@/application/dtos/attendance.dto';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);
  private readonly STANDARD_WORKING_HOURS = 8;
  private readonly BREAK_TIME = 1;
  private readonly LATE_THRESHOLD_HOUR = 9;
  private readonly EARLY_LEAVE_THRESHOLD_HOUR = 17;

  constructor(
    private readonly attendanceRepository: AttendanceRepository,
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  /**
   * Employee check-in
   */
  async checkIn(employeeId: number, dto: CheckInDto, userId: number): Promise<AttendanceRecord> {
    // 1. Validate employee exists and is active
    const employee = await this.employeeRepository.findById(employeeId);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    if (!employee.is_active) {
      throw new BadRequestException('Employee is not active');
    }

    // 2. Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existing = await this.attendanceRepository.findTodayByEmployee(employeeId);
    if (existing) {
      throw new BadRequestException('Already checked in today');
    }

    // 3. Validate check-in time (not too early - after 6 AM)
    const checkInTime = new Date();
    const currentHour = checkInTime.getHours();
    if (currentHour < 6) {
      throw new BadRequestException('Check-in too early (before 6 AM)');
    }

    // 4. Calculate late status
    const lateThreshold = new Date(checkInTime);
    lateThreshold.setHours(this.LATE_THRESHOLD_HOUR, 0, 0, 0);
    
    const isLate = checkInTime > lateThreshold;
    const lateMinutes = isLate
      ? Math.floor((checkInTime.getTime() - lateThreshold.getTime()) / 60000)
      : 0;

    // 5. Create attendance record
    const attendance = await this.attendanceRepository.create({
      employee_id: employeeId,
      attendance_date: today,
      check_in_time: checkInTime,
      location: dto.location,
      late: isLate,
      late_minutes: lateMinutes,
      late_reason: isLate && dto.lateReason ? dto.lateReason : null,
      status: 'CHECKED_IN',
      type: 'NORMAL',
      break_time: this.BREAK_TIME,
      overtime_hours: 0,
      created_by: userId,
      updated_by: userId,
    });

    this.logger.log(`Check-in successful: Employee ${employeeId} at ${checkInTime.toISOString()}`);

    return attendance;
  }

  /**
   * Employee check-out
   */
  async checkOut(employeeId: number, dto: CheckOutDto, userId: number): Promise<AttendanceRecord> {
    // 1. Find today's check-in record
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const record = await this.attendanceRepository.findTodayByEmployee(employeeId);
    if (!record) {
      throw new BadRequestException('No check-in record found for today');
    }

    if (record.check_out_time) {
      throw new BadRequestException('Already checked out today');
    }

    // 2. Validate check-out time
    const checkOutTime = new Date();
    if (checkOutTime <= record.check_in_time) {
      throw new BadRequestException('Check-out time must be after check-in time');
    }

    // 3. Calculate working hours
    const diffMs = checkOutTime.getTime() - record.check_in_time.getTime();
    const totalHours = diffMs / (1000 * 60 * 60);
    const workingHours = Math.max(0, totalHours - record.break_time);

    // 4. Calculate overtime
    const overtimeHours = Math.max(0, workingHours - this.STANDARD_WORKING_HOURS);

    // 5. Check early leave
    const earlyLeaveThreshold = new Date(checkOutTime);
    earlyLeaveThreshold.setHours(this.EARLY_LEAVE_THRESHOLD_HOUR, 0, 0, 0);
    
    const isEarlyLeave = checkOutTime < earlyLeaveThreshold;
    const earlyLeaveMinutes = isEarlyLeave
      ? Math.floor((earlyLeaveThreshold.getTime() - checkOutTime.getTime()) / 60000)
      : 0;

    // 6. Determine status (needs approval if late or early leave)
    const needsApproval = record.late || isEarlyLeave;
    const status = needsApproval ? 'PENDING_APPROVAL' : 'COMPLETED';
    const approvalStatus = needsApproval ? 'PENDING' : 'APPROVED';

    // 7. Update record
    const updated = await this.attendanceRepository.update(record.id, {
      check_out_time: checkOutTime,
      working_hours: workingHours,
      overtime_hours: overtimeHours,
      early_leave: isEarlyLeave,
      early_leave_minutes: earlyLeaveMinutes,
      early_leave_reason: isEarlyLeave && dto.earlyLeaveReason ? dto.earlyLeaveReason : null,
      status,
      approval_status: approvalStatus,
      updated_by: userId,
    });

    this.logger.log(`Check-out successful: Employee ${employeeId} at ${checkOutTime.toISOString()}`);

    return updated!;
  }

  /**
   * Get attendance records for employee
   */
  async getMyAttendance(
    employeeId: number,
    page: number = 1,
    limit: number = 10,
    dateFrom?: string,
    dateTo?: string,
    status?: string,
  ) {
    const dateFromObj = dateFrom ? new Date(dateFrom) : undefined;
    const dateToObj = dateTo ? new Date(dateTo) : undefined;

    return await this.attendanceRepository.findByEmployeeId(
      employeeId,
      page,
      limit,
      dateFromObj,
      dateToObj,
      status,
    );
  }

  /**
   * Get attendance records for department (Manager)
   */
  async getDepartmentAttendance(
    departmentId: number,
    page: number = 1,
    limit: number = 10,
    dateFrom?: string,
    dateTo?: string,
    status?: string,
  ) {
    const dateFromObj = dateFrom ? new Date(dateFrom) : undefined;
    const dateToObj = dateTo ? new Date(dateTo) : undefined;

    return await this.attendanceRepository.findByDepartment(
      departmentId,
      page,
      limit,
      dateFromObj,
      dateToObj,
      status,
    );
  }

  /**
   * Get pending approvals
   */
  async getPendingApprovals(departmentId?: number, page: number = 1, limit: number = 10) {
    return await this.attendanceRepository.findPendingApprovals(departmentId, page, limit);
  }

  /**
   * Get attendance record by ID
   */
  async findOne(id: number): Promise<AttendanceRecord> {
    const record = await this.attendanceRepository.findById(id);
    if (!record) {
      throw new NotFoundException('Attendance record not found');
    }
    return record;
  }

  /**
   * Edit attendance record (within 24 hours)
   */
  async editAttendance(
    id: number,
    employeeId: number,
    dto: EditAttendanceDto,
    userId: number,
  ): Promise<AttendanceRecord> {
    const record = await this.findOne(id);

    // Check ownership
    if (record.employee_id !== employeeId) {
      throw new ForbiddenException('Cannot edit other employee attendance');
    }

    // Check if within 24 hours
    const now = new Date();
    const recordAge = now.getTime() - record.created_at.getTime();
    const hours24 = 24 * 60 * 60 * 1000;

    if (recordAge > hours24) {
      throw new BadRequestException('Can only edit attendance within 24 hours');
    }

    // Check if already approved
    if (record.approval_status === 'APPROVED') {
      throw new BadRequestException('Cannot edit approved attendance record');
    }

    // Validate times
    const checkInTime = new Date(dto.checkInTime);
    const checkOutTime = new Date(dto.checkOutTime);

    if (checkOutTime <= checkInTime) {
      throw new BadRequestException('Check-out time must be after check-in time');
    }

    // Recalculate
    const diffMs = checkOutTime.getTime() - checkInTime.getTime();
    const totalHours = diffMs / (1000 * 60 * 60);
    const workingHours = Math.max(0, totalHours - record.break_time);
    const overtimeHours = Math.max(0, workingHours - this.STANDARD_WORKING_HOURS);

    // Recalculate late/early leave
    const lateThreshold = new Date(checkInTime);
    lateThreshold.setHours(this.LATE_THRESHOLD_HOUR, 0, 0, 0);
    const isLate = checkInTime > lateThreshold;
    const lateMinutes = isLate
      ? Math.floor((checkInTime.getTime() - lateThreshold.getTime()) / 60000)
      : 0;

    const earlyLeaveThreshold = new Date(checkOutTime);
    earlyLeaveThreshold.setHours(this.EARLY_LEAVE_THRESHOLD_HOUR, 0, 0, 0);
    const isEarlyLeave = checkOutTime < earlyLeaveThreshold;
    const earlyLeaveMinutes = isEarlyLeave
      ? Math.floor((earlyLeaveThreshold.getTime() - checkOutTime.getTime()) / 60000)
      : 0;

    const needsApproval = isLate || isEarlyLeave;
    const status = needsApproval ? 'PENDING_APPROVAL' : 'COMPLETED';
    const approvalStatus = needsApproval ? 'PENDING' : 'APPROVED';

    // Update record
    const updated = await this.attendanceRepository.update(record.id, {
      check_in_time: checkInTime,
      check_out_time: checkOutTime,
      working_hours: workingHours,
      overtime_hours: overtimeHours,
      late: isLate,
      late_minutes: lateMinutes,
      early_leave: isEarlyLeave,
      early_leave_minutes: earlyLeaveMinutes,
      edit_reason: dto.editReason,
      status,
      approval_status: approvalStatus,
      updated_by: userId,
    });

    this.logger.log(`Attendance edited: Record ${id} by User ${userId}`);

    return updated!;
  }

  /**
   * Approve attendance record (Manager/HR Manager)
   */
  async approveAttendance(
    id: number,
    approverId: number,
    dto: ApproveAttendanceDto,
  ): Promise<AttendanceRecord> {
    const record = await this.findOne(id);

    if (record.approval_status === 'APPROVED') {
      throw new BadRequestException('Attendance record already approved');
    }

    if (record.approval_status === 'REJECTED') {
      throw new BadRequestException('Cannot approve rejected attendance record');
    }

    const updated = await this.attendanceRepository.update(record.id, {
      approval_status: 'APPROVED',
      approved_by: approverId,
      approved_at: new Date(),
      status: 'APPROVED',
      notes: dto.notes || record.notes,
      updated_by: approverId,
    });

    this.logger.log(`Attendance approved: Record ${id} by User ${approverId}`);

    return updated!;
  }

  /**
   * Reject attendance record (Manager/HR Manager)
   */
  async rejectAttendance(
    id: number,
    rejectorId: number,
    dto: RejectAttendanceDto,
  ): Promise<AttendanceRecord> {
    const record = await this.findOne(id);

    if (record.approval_status === 'REJECTED') {
      throw new BadRequestException('Attendance record already rejected');
    }

    if (record.approval_status === 'APPROVED') {
      throw new BadRequestException('Cannot reject approved attendance record');
    }

    const updated = await this.attendanceRepository.update(record.id, {
      approval_status: 'REJECTED',
      rejected_by: rejectorId,
      rejected_at: new Date(),
      rejection_reason: dto.rejectionReason,
      status: 'REJECTED',
      updated_by: rejectorId,
    });

    this.logger.warn(`Attendance rejected: Record ${id} by User ${rejectorId} - Reason: ${dto.rejectionReason}`);

    return updated!;
  }

  /**
   * Check if user can approve this attendance record
   */
  async canApprove(userId: number, employeeId: number): Promise<boolean> {
    // TODO: Implement proper authorization check
    // - HR Manager can approve all
    // - Manager can only approve their department employees
    // For now, return true (should be implemented with user service integration)
    return true;
  }

  /**
   * Check if employee belongs to manager's department
   */
  async isEmployeeInManagerDepartment(employeeId: number, managerId: number): Promise<boolean> {
    // TODO: Implement with user service integration
    // For now, return true
    return true;
  }
}

