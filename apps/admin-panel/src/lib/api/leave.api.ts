import apiClient from '../api';

export interface LeaveRequest {
  id: number;
  request_number: string;
  employee_id: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  total_days: number;
  is_half_day: boolean;
  half_day_type?: 'MORNING' | 'AFTERNOON';
  reason: string;
  approver_id?: number;
  hr_approver_id?: number;
  requires_hr_approval: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  manager_approved_at?: string;
  hr_approved_at?: string;
  manager_rejection_reason?: string;
  hr_rejection_reason?: string;
  manager_notes?: string;
  hr_notes?: string;
  attachment_url?: string;
  is_edited: boolean;
  edited_at?: string;
  edited_by?: number;
  edit_reason?: string;
  cancellation_reason?: string;
  cancelled_at?: string;
  cancelled_by?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  employee?: any;
  leaveType?: any;
  approver?: any;
  hrApprover?: any;
}

export interface LeaveBalance {
  id: number;
  employee_id: number;
  leave_type_id: number;
  year: number;
  entitlement_days: number;
  used_days: number;
  remaining_days: number;
  carry_over_days: number;
  expired_days: number;
  pending_days: number;
  last_calculated_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  employee?: any;
  leaveType?: any;
}

export interface CreateLeaveRequestRequest {
  employee_id: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  is_half_day?: boolean;
  half_day_type?: 'MORNING' | 'AFTERNOON';
  reason: string;
  attachment_url?: string;
  notes?: string;
  requires_hr_approval?: boolean;
}

export interface UpdateLeaveRequestRequest {
  leave_type_id?: number;
  start_date?: string;
  end_date?: string;
  is_half_day?: boolean;
  half_day_type?: 'MORNING' | 'AFTERNOON';
  reason?: string;
  attachment_url?: string;
  notes?: string;
  edit_reason?: string;
}

export interface ApproveLeaveRequestRequest {
  notes?: string;
}

export interface RejectLeaveRequestRequest {
  rejection_reason: string;
  notes?: string;
}

export interface CancelLeaveRequestRequest {
  cancellation_reason: string;
}

export interface GetLeaveRequestsQuery {
  page?: number;
  limit?: number;
  employee_id?: number;
  leave_type_id?: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface GetLeaveBalanceQuery {
  employee_id: number;
  year?: number;
  leave_type_id?: number;
}

export interface LeaveRequestsListResponse {
  leaveRequests: LeaveRequest[];
  total: number;
  page: number;
  limit: number;
}

export const leaveApi = {
  /**
   * Create a new leave request
   */
  createLeaveRequest: async (data: CreateLeaveRequestRequest): Promise<LeaveRequest> => {
    const response = await apiClient.post<LeaveRequest>('/api/hr/leave/requests', data);
    return response;
  },

  /**
   * Get leave requests with filters
   */
  getLeaveRequests: async (query: GetLeaveRequestsQuery = {}): Promise<LeaveRequestsListResponse> => {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.employee_id) params.append('employee_id', query.employee_id.toString());
    if (query.leave_type_id) params.append('leave_type_id', query.leave_type_id.toString());
    if (query.status) params.append('status', query.status);
    if (query.date_from) params.append('date_from', query.date_from);
    if (query.date_to) params.append('date_to', query.date_to);
    if (query.search) params.append('search', query.search);

    const response = await apiClient.get<LeaveRequestsListResponse>(
      `/api/hr/leave/requests?${params.toString()}`,
    );
    return response;
  },

  /**
   * Get my leave requests
   */
  getMyLeaveRequests: async (query: Omit<GetLeaveRequestsQuery, 'employee_id'> = {}): Promise<LeaveRequestsListResponse> => {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.leave_type_id) params.append('leave_type_id', query.leave_type_id.toString());
    if (query.status) params.append('status', query.status);
    if (query.date_from) params.append('date_from', query.date_from);
    if (query.date_to) params.append('date_to', query.date_to);
    if (query.search) params.append('search', query.search);

    const response = await apiClient.get<LeaveRequestsListResponse>(
      `/api/hr/leave/requests/my-requests?${params.toString()}`,
    );
    return response;
  },

  /**
   * Get pending approvals
   */
  getPendingApprovals: async (query: Omit<GetLeaveRequestsQuery, 'employee_id'> = {}): Promise<LeaveRequestsListResponse> => {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.leave_type_id) params.append('leave_type_id', query.leave_type_id.toString());
    if (query.status) params.append('status', query.status);
    if (query.date_from) params.append('date_from', query.date_from);
    if (query.date_to) params.append('date_to', query.date_to);
    if (query.search) params.append('search', query.search);

    const response = await apiClient.get<LeaveRequestsListResponse>(
      `/api/hr/leave/requests/pending-approvals?${params.toString()}`,
    );
    return response;
  },

  /**
   * Get leave request by ID
   */
  getLeaveRequestById: async (id: number): Promise<LeaveRequest> => {
    const response = await apiClient.get<LeaveRequest>(`/api/hr/leave/requests/${id}`);
    return response;
  },

  /**
   * Update leave request
   */
  updateLeaveRequest: async (id: number, data: UpdateLeaveRequestRequest): Promise<LeaveRequest> => {
    const response = await apiClient.put<LeaveRequest>(`/api/hr/leave/requests/${id}`, data);
    return response;
  },

  /**
   * Approve leave request
   */
  approveLeaveRequest: async (id: number, data: ApproveLeaveRequestRequest): Promise<LeaveRequest> => {
    const response = await apiClient.put<LeaveRequest>(`/api/hr/leave/requests/${id}/approve`, data);
    return response;
  },

  /**
   * Reject leave request
   */
  rejectLeaveRequest: async (id: number, data: RejectLeaveRequestRequest): Promise<LeaveRequest> => {
    const response = await apiClient.put<LeaveRequest>(`/api/hr/leave/requests/${id}/reject`, data);
    return response;
  },

  /**
   * Cancel leave request
   */
  cancelLeaveRequest: async (id: number, data: CancelLeaveRequestRequest): Promise<LeaveRequest> => {
    const response = await apiClient.put<LeaveRequest>(`/api/hr/leave/requests/${id}/cancel`, data);
    return response;
  },

  /**
   * Get leave balance
   */
  getLeaveBalance: async (query: GetLeaveBalanceQuery): Promise<LeaveBalance[]> => {
    const params = new URLSearchParams();
    params.append('employee_id', query.employee_id.toString());
    if (query.year) params.append('year', query.year.toString());
    if (query.leave_type_id) params.append('leave_type_id', query.leave_type_id.toString());

    const response = await apiClient.get<LeaveBalance[]>(
      `/api/hr/leave/balance?${params.toString()}`,
    );
    return response;
  },

  /**
   * Get my leave balance
   */
  getMyLeaveBalance: async (query: Omit<GetLeaveBalanceQuery, 'employee_id'> = {}): Promise<LeaveBalance[]> => {
    const params = new URLSearchParams();
    if (query.year) params.append('year', query.year.toString());
    if (query.leave_type_id) params.append('leave_type_id', query.leave_type_id.toString());

    const response = await apiClient.get<LeaveBalance[]>(
      `/api/hr/leave/balance/my-balance?${params.toString()}`,
    );
    return response;
  },
};

