/**
 * Attendance Management Types
 */

export interface AttendanceRecord {
  id: number;
  employee_id: number;
  attendance_date: string; // ISO date string
  attendance_type_id?: number;
  check_in_time: string; // ISO datetime string
  check_out_time?: string; // ISO datetime string
  break_time: number;
  working_hours?: number;
  overtime_hours: number;
  late: boolean;
  late_minutes: number;
  late_reason?: string;
  early_leave: boolean;
  early_leave_minutes: number;
  early_leave_reason?: string;
  type: 'NORMAL' | 'OVERTIME' | 'HOLIDAY' | 'WEEKEND';
  status: 'CHECKED_IN' | 'COMPLETED' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approved_by?: number;
  approved_at?: string; // ISO datetime string
  rejected_by?: number;
  rejected_at?: string; // ISO datetime string
  rejection_reason?: string;
  edit_reason?: string;
  notes?: string;
  location?: string;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
  employee?: {
    id: number;
    employee_code: string;
    full_name: string;
    department?: {
      id: number;
      name: string;
    };
  };
  attendanceType?: {
    id: number;
    code: string;
    name: string;
  };
}

export interface CheckInRequest {
  location?: string;
  lateReason?: string;
}

export interface CheckOutRequest {
  earlyLeaveReason?: string;
}

export interface EditAttendanceRequest {
  checkInTime: string; // ISO datetime string
  checkOutTime: string; // ISO datetime string
  editReason: string;
}

export interface ApproveAttendanceRequest {
  notes?: string;
}

export interface RejectAttendanceRequest {
  rejectionReason: string;
}

export interface GetAttendanceQuery {
  page?: number;
  limit?: number;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
  status?: 'CHECKED_IN' | 'COMPLETED' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
}

export interface AttendanceListResponse {
  records: AttendanceRecord[];
  total: number;
}

export interface AttendanceStats {
  totalRecords: number;
  checkedInToday: number;
  pendingApprovals: number;
  lateCheckIns: number;
  earlyLeaves: number;
  averageWorkingHours: number;
  totalOvertimeHours: number;
}

