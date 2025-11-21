import { Injectable } from '@nestjs/common';
import { AttendanceRepository } from '@/infrastructure/database/repositories/attendance.repository';
import { AttendanceRecord } from '@/infrastructure/database/entities/attendance-record.entity';

export interface ExportAttendanceOptions {
  dateFrom: Date;
  dateTo: Date;
  employeeId?: number;
  departmentId?: number;
  status?: string;
  format: 'json' | 'csv' | 'excel';
}

@Injectable()
export class ExportAttendanceUseCase {
  constructor(private readonly attendanceRepository: AttendanceRepository) {}

  async execute(options: ExportAttendanceOptions): Promise<any> {
    const { dateFrom, dateTo, employeeId, departmentId, status, format } = options;

    // Get records
    const query = employeeId
      ? await this.attendanceRepository.findByEmployeeId(employeeId, 1, 10000, dateFrom, dateTo, status)
      : departmentId
        ? await this.attendanceRepository.findByDepartment(departmentId, 1, 10000, dateFrom, dateTo, status)
        : { records: [], total: 0 };

    const records = query.records.filter((r) => {
      // Only export approved records by default
      if (!status && r.approval_status !== 'APPROVED') {
        return false;
      }
      return true;
    });

    // Transform to export format
    const exportData = records.map((record) => ({
      id: record.id,
      employee_id: record.employee_id,
      employee_code: record.employee?.employee_code || '',
      employee_name: record.employee?.full_name || '',
      department: record.employee?.department?.name || '',
      attendance_date: record.attendance_date.toISOString().split('T')[0],
      check_in_time: record.check_in_time?.toISOString() || '',
      check_out_time: record.check_out_time?.toISOString() || '',
      working_hours: Number(record.working_hours) || 0,
      overtime_hours: Number(record.overtime_hours) || 0,
      late_minutes: record.late_minutes || 0,
      early_leave_minutes: record.early_leave_minutes || 0,
      late: record.late ? 'Yes' : 'No',
      early_leave: record.early_leave ? 'Yes' : 'No',
      status: record.status,
      approval_status: record.approval_status,
      approved_by: record.approved_by || '',
      approved_at: record.approved_at?.toISOString() || '',
    }));

    if (format === 'json') {
      return JSON.stringify(exportData, null, 2);
    }

    if (format === 'csv') {
      return this.convertToCSV(exportData);
    }

    // For Excel, return JSON (can be converted to Excel on frontend)
    return exportData;
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }
}

