import { Injectable } from '@nestjs/common';
import { AttendanceRepository } from '@/infrastructure/database/repositories/attendance.repository';

export interface AttendanceStats {
  totalRecords: number;
  checkedInToday: number;
  pendingApprovals: number;
  lateCheckIns: number;
  earlyLeaves: number;
  averageWorkingHours: number;
  totalOvertimeHours: number;
}

@Injectable()
export class GetAttendanceStatsUseCase {
  constructor(private readonly attendanceRepository: AttendanceRepository) {}

  async execute(
    employeeId?: number,
    departmentId?: number,
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<AttendanceStats> {
    // Get records based on filters
    const query = employeeId
      ? await this.attendanceRepository.findByEmployeeId(employeeId, 1, 1000, dateFrom, dateTo)
      : departmentId
        ? await this.attendanceRepository.findByDepartment(departmentId, 1, 1000, dateFrom, dateTo)
        : { records: [], total: 0 };

    const records = query.records;

    // Calculate statistics
    const totalRecords = records.length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkedInToday = records.filter(
      (r) => r.attendance_date.getTime() === today.getTime() && r.check_in_time,
    ).length;
    const pendingApprovals = records.filter((r) => r.approval_status === 'PENDING').length;
    const lateCheckIns = records.filter((r) => r.late).length;
    const earlyLeaves = records.filter((r) => r.early_leave).length;

    const totalWorkingHours = records.reduce((sum, r) => sum + (Number(r.working_hours) || 0), 0);
    const averageWorkingHours = totalRecords > 0 ? totalWorkingHours / totalRecords : 0;

    const totalOvertimeHours = records.reduce((sum, r) => sum + (Number(r.overtime_hours) || 0), 0);

    return {
      totalRecords,
      checkedInToday,
      pendingApprovals,
      lateCheckIns,
      earlyLeaves,
      averageWorkingHours,
      totalOvertimeHours,
    };
  }
}

