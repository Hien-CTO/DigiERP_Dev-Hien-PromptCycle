import { api } from '../api';
import type {
  AttendanceRecord,
  CheckInRequest,
  CheckOutRequest,
  EditAttendanceRequest,
  ApproveAttendanceRequest,
  RejectAttendanceRequest,
  GetAttendanceQuery,
  AttendanceListResponse,
} from '@/types/attendance.types';

/**
 * Attendance API Client
 * Handles all attendance-related API calls
 */
export const attendanceApi = {
  /**
   * Employee check-in
   */
  checkIn: async (data: CheckInRequest): Promise<AttendanceRecord> => {
    return await api.post<AttendanceRecord>('/api/v1/attendance/check-in', data);
  },

  /**
   * Employee check-out
   */
  checkOut: async (data: CheckOutRequest): Promise<AttendanceRecord> => {
    return await api.post<AttendanceRecord>('/api/v1/attendance/check-out', data);
  },

  /**
   * Get my attendance records
   */
  getMyAttendance: async (query?: GetAttendanceQuery): Promise<AttendanceListResponse> => {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.dateFrom) params.append('dateFrom', query.dateFrom);
    if (query?.dateTo) params.append('dateTo', query.dateTo);
    if (query?.status) params.append('status', query.status);

    const queryString = params.toString();
    const url = `/api/v1/attendance/my-attendance${queryString ? `?${queryString}` : ''}`;
    
    return await api.get<AttendanceListResponse>(url);
  },

  /**
   * Get department attendance (Manager only)
   */
  getDepartmentAttendance: async (query?: GetAttendanceQuery): Promise<AttendanceListResponse> => {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.dateFrom) params.append('dateFrom', query.dateFrom);
    if (query?.dateTo) params.append('dateTo', query.dateTo);
    if (query?.status) params.append('status', query.status);

    const queryString = params.toString();
    const url = `/api/v1/attendance/department${queryString ? `?${queryString}` : ''}`;
    
    return await api.get<AttendanceListResponse>(url);
  },

  /**
   * Get pending approvals (Manager/HR Manager)
   */
  getPendingApprovals: async (query?: GetAttendanceQuery): Promise<AttendanceListResponse> => {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());

    const queryString = params.toString();
    const url = `/api/v1/attendance/pending-approvals${queryString ? `?${queryString}` : ''}`;
    
    return await api.get<AttendanceListResponse>(url);
  },

  /**
   * Get attendance record by ID
   */
  getAttendanceById: async (id: number): Promise<AttendanceRecord> => {
    return await api.get<AttendanceRecord>(`/api/v1/attendance/${id}`);
  },

  /**
   * Edit attendance record
   */
  editAttendance: async (id: number, data: EditAttendanceRequest): Promise<AttendanceRecord> => {
    return await api.put<AttendanceRecord>(`/api/v1/attendance/${id}`, data);
  },

  /**
   * Approve attendance record
   */
  approveAttendance: async (id: number, data?: ApproveAttendanceRequest): Promise<AttendanceRecord> => {
    return await api.put<AttendanceRecord>(`/api/v1/attendance/${id}/approve`, data || {});
  },

  /**
   * Reject attendance record
   */
  rejectAttendance: async (id: number, data: RejectAttendanceRequest): Promise<AttendanceRecord> => {
    return await api.put<AttendanceRecord>(`/api/v1/attendance/${id}/reject`, data);
  },
};

