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
import { AttendanceEditHistoryRepository } from '@/infrastructure/database/repositories/attendance-edit-history.repository';
import { AttendanceConfigurationRepository } from '@/infrastructure/database/repositories/attendance-configuration.repository';
import { AttendanceLocationRepository } from '@/infrastructure/database/repositories/attendance-location.repository';
import { EmployeeRepository } from '@/infrastructure/database/repositories/employee.repository';
import { AttendanceRecord } from '@/infrastructure/database/entities/attendance-record.entity';
import { AttendanceEditHistory } from '@/infrastructure/database/entities/attendance-edit-history.entity';
import { AttendanceConfiguration } from '@/infrastructure/database/entities/attendance-configuration.entity';
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

  constructor(
    private readonly attendanceRepository: AttendanceRepository,
    private readonly attendanceEditHistoryRepository: AttendanceEditHistoryRepository,
    private readonly attendanceConfigurationRepository: AttendanceConfigurationRepository,
    private readonly attendanceLocationRepository: AttendanceLocationRepository,
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  /**
   * Employee check-in
   */
  async checkIn(employeeId: number, dto: CheckInDto, userId: number): Promise<AttendanceRecord> {
    try {
      // 1. Validate employee exists and is active
      const employee = await this.employeeRepository.findById(employeeId);
      if (!employee) {
        this.logger.error(`Employee not found: ${employeeId}`);
        throw new NotFoundException('Employee not found');
      }
      if (!employee.is_active) {
        this.logger.error(`Employee is not active: ${employeeId}`);
        throw new BadRequestException('Employee is not active');
      }

      // 2. Get configuration for employee
      const config = await this.attendanceConfigurationRepository.getConfigurationForEmployee(
        employee.department_id || undefined,
        employee.position_id || undefined,
      );
      if (!config) {
        this.logger.error(`Attendance configuration not found for employee ${employeeId} (dept: ${employee.department_id}, pos: ${employee.position_id})`);
        throw new BadRequestException('Attendance configuration not found');
      }

      // 3. Check if already checked in today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const existing = await this.attendanceRepository.findTodayByEmployee(employeeId);
      if (existing) {
        this.logger.warn(`Employee ${employeeId} already checked in today`);
        throw new BadRequestException('Already checked in today');
      }

      // 4. Validate check-in time
      const checkInTime = new Date();
      const earliestCheckIn = this.parseTimeString(config.earliest_check_in_time);
      if (checkInTime < earliestCheckIn) {
        this.logger.warn(`Check-in too early for employee ${employeeId}: ${checkInTime.toISOString()} < ${config.earliest_check_in_time}`);
        throw new BadRequestException(`Check-in too early (before ${config.earliest_check_in_time})`);
      }

      // 5. Validate GPS location if enabled
      if (config.location_validation_enabled && dto.latitude && dto.longitude) {
        const locationValidation = await this.attendanceLocationRepository.isLocationValid(
          dto.latitude,
          dto.longitude,
          config.allowed_location_radius_meters,
        );
        if (!locationValidation.valid) {
          this.logger.warn(`Check-in location invalid for employee ${employeeId}`);
          throw new BadRequestException('Check-in location is outside allowed area');
        }
      }

      // 6. Calculate late status
      const lateThreshold = this.parseTimeString(config.late_threshold_time);
      const isLate = checkInTime > lateThreshold;
      const lateMinutes = isLate
        ? Math.floor((checkInTime.getTime() - lateThreshold.getTime()) / 60000)
        : 0;

      // 7. Create attendance record
      const attendance = await this.attendanceRepository.create({
        employee_id: employeeId,
        attendance_date: today,
        check_in_time: checkInTime,
        check_in_location: dto.location,
        check_in_latitude: dto.latitude,
        check_in_longitude: dto.longitude,
        location: dto.location, // Keep for backward compatibility
        late: isLate,
        late_minutes: lateMinutes,
        late_reason: isLate && dto.lateReason ? dto.lateReason : null,
        status: isLate ? 'PENDING_APPROVAL' : 'CHECKED_IN',
        approval_status: isLate ? 'PENDING' : 'PENDING',
        type: 'WORK',
        special_case_type: 'NORMAL',
        break_duration_minutes: config.break_duration_minutes,
        overtime_hours: 0,
        created_by: userId,
        updated_by: userId,
      });

      this.logger.log(`Check-in successful: Employee ${employeeId} at ${checkInTime.toISOString()}`);

      return attendance;
    } catch (error) {
      this.logger.error(`Error in checkIn for employee ${employeeId}:`, error);
      throw error;
    }
  }

  /**
   * Parse time string (HH:mm:ss) or Date object to Date object for today
   */
  private parseTimeString(timeString: string | Date | null | undefined): Date {
    if (!timeString) {
      this.logger.warn('parseTimeString received null/undefined, using default 09:00:00');
      timeString = '09:00:00';
    }
    
    let timeStr: string;
    
    if (timeString instanceof Date) {
      // If it's already a Date, extract time string
      const hours = timeString.getHours().toString().padStart(2, '0');
      const minutes = timeString.getMinutes().toString().padStart(2, '0');
      const seconds = timeString.getSeconds().toString().padStart(2, '0');
      timeStr = `${hours}:${minutes}:${seconds}`;
    } else {
      timeStr = String(timeString);
    }
    
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) {
      this.logger.error(`Invalid time string format: ${timeStr}, using default 09:00:00`);
      return this.parseTimeString('09:00:00');
    }
    
    const date = new Date();
    date.setHours(hours || 0, minutes || 0, seconds || 0, 0);
    return date;
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

    // 2. Get configuration
    const employee = await this.employeeRepository.findById(employeeId);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    const config = await this.attendanceConfigurationRepository.getConfigurationForEmployee(
      employee.department_id,
      employee.position_id,
    );
    if (!config) {
      throw new BadRequestException('Attendance configuration not found');
    }

    // 3. Validate check-out time
    const checkOutTime = new Date();
    if (checkOutTime <= record.check_in_time) {
      throw new BadRequestException('Check-out time must be after check-in time');
    }

    const latestCheckOut = this.parseTimeString(config.latest_check_out_time);
    if (checkOutTime > latestCheckOut) {
      throw new BadRequestException(`Check-out too late (after ${config.latest_check_out_time})`);
    }

    // 4. Validate GPS location if enabled
    if (config.location_validation_enabled && dto.latitude && dto.longitude) {
      const locationValidation = await this.attendanceLocationRepository.isLocationValid(
        dto.latitude,
        dto.longitude,
        config.allowed_location_radius_meters,
      );
      if (!locationValidation.valid) {
        throw new BadRequestException('Check-out location is outside allowed area');
      }
    }

    // 5. Calculate working hours
    const diffMs = checkOutTime.getTime() - record.check_in_time.getTime();
    const totalHours = diffMs / (1000 * 60 * 60);
    const breakHours = config.break_duration_minutes / 60;
    const workingHours = Math.max(0, totalHours - breakHours);

    // Validate working hours (safety limit: 0-16 hours)
    if (workingHours < 0) {
      throw new BadRequestException('Invalid working hours (negative)');
    }
    if (workingHours > 16) {
      throw new BadRequestException('Working hours exceed safety limit (16 hours)');
    }

    // 6. Calculate overtime
    const overtimeHours = Math.max(0, workingHours - Number(config.standard_working_hours));

    // 7. Check early leave
    const earlyLeaveThreshold = this.parseTimeString(config.early_leave_threshold_time);
    const isEarlyLeave = checkOutTime < earlyLeaveThreshold;
    const earlyLeaveMinutes = isEarlyLeave
      ? Math.floor((earlyLeaveThreshold.getTime() - checkOutTime.getTime()) / 60000)
      : 0;

    // 8. Determine status (needs approval if late or early leave)
    const needsApproval = record.late || isEarlyLeave;
    const status = needsApproval ? 'PENDING_APPROVAL' : 'COMPLETED';
    const approvalStatus = needsApproval ? 'PENDING' : 'APPROVED';

    // 9. Update record
    const updated = await this.attendanceRepository.update(record.id, {
      check_out_time: checkOutTime,
      check_out_location: dto.location,
      check_out_latitude: dto.latitude,
      check_out_longitude: dto.longitude,
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

    // Get configuration
    const employee = await this.employeeRepository.findById(employeeId);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    const config = await this.attendanceConfigurationRepository.getConfigurationForEmployee(
      employee.department_id,
      employee.position_id,
    );
    if (!config) {
      throw new BadRequestException('Attendance configuration not found');
    }

    // Validate times
    const checkInTime = new Date(dto.checkInTime);
    const checkOutTime = new Date(dto.checkOutTime);

    if (checkOutTime <= checkInTime) {
      throw new BadRequestException('Check-out time must be after check-in time');
    }

    // Track changes for edit history
    const changes: Partial<AttendanceEditHistory>[] = [];

    // Recalculate
    const diffMs = checkOutTime.getTime() - checkInTime.getTime();
    const totalHours = diffMs / (1000 * 60 * 60);
    const breakHours = config.break_duration_minutes / 60;
    const workingHours = Math.max(0, totalHours - breakHours);
    const overtimeHours = Math.max(0, workingHours - Number(config.standard_working_hours));

    // Track field changes
    if (record.check_in_time.getTime() !== checkInTime.getTime()) {
      changes.push({
        attendance_record_id: id,
        field_name: 'check_in_time',
        old_value: record.check_in_time.toISOString(),
        new_value: checkInTime.toISOString(),
        edit_reason: dto.editReason,
        edited_by: userId,
      });
    }

    if (record.check_out_time && record.check_out_time.getTime() !== checkOutTime.getTime()) {
      changes.push({
        attendance_record_id: id,
        field_name: 'check_out_time',
        old_value: record.check_out_time.toISOString(),
        new_value: checkOutTime.toISOString(),
        edit_reason: dto.editReason,
        edited_by: userId,
      });
    }

    // Recalculate late/early leave
    const lateThreshold = this.parseTimeString(config.late_threshold_time);
    const isLate = checkInTime > lateThreshold;
    const lateMinutes = isLate
      ? Math.floor((checkInTime.getTime() - lateThreshold.getTime()) / 60000)
      : 0;

    const earlyLeaveThreshold = this.parseTimeString(config.early_leave_threshold_time);
    const isEarlyLeave = checkOutTime < earlyLeaveThreshold;
    const earlyLeaveMinutes = isEarlyLeave
      ? Math.floor((earlyLeaveThreshold.getTime() - checkOutTime.getTime()) / 60000)
      : 0;

    // Track other field changes
    if (record.late !== isLate) {
      changes.push({
        attendance_record_id: id,
        field_name: 'late',
        old_value: String(record.late),
        new_value: String(isLate),
        edit_reason: dto.editReason,
        edited_by: userId,
      });
    }

    if (record.early_leave !== isEarlyLeave) {
      changes.push({
        attendance_record_id: id,
        field_name: 'early_leave',
        old_value: String(record.early_leave),
        new_value: String(isEarlyLeave),
        edit_reason: dto.editReason,
        edited_by: userId,
      });
    }

    const needsApproval = isLate || isEarlyLeave;
    const status = needsApproval ? 'PENDING_APPROVAL' : 'COMPLETED';
    const approvalStatus = needsApproval ? 'PENDING' : 'APPROVED';

    // Save edit history
    if (changes.length > 0) {
      await this.attendanceEditHistoryRepository.createMultiple(changes);
    }

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
      is_edited: true,
      edited_at: new Date(),
      edited_by: userId,
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

