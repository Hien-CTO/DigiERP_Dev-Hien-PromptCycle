import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveApi } from '@/lib/api/leave.api';
import {
  LeaveRequest,
  LeaveBalance,
  CreateLeaveRequestRequest,
  UpdateLeaveRequestRequest,
  ApproveLeaveRequestRequest,
  RejectLeaveRequestRequest,
  CancelLeaveRequestRequest,
  GetLeaveRequestsQuery,
  GetLeaveBalanceQuery,
  LeaveRequestsListResponse,
} from '@/lib/api/leave.api';

/**
 * Hook để lấy danh sách leave requests
 */
export const useLeaveRequests = (query: GetLeaveRequestsQuery = {}) => {
  const { page = 1, limit = 10 } = query;

  return useQuery<LeaveRequestsListResponse>({
    queryKey: ['leave-requests', page, limit, query.employee_id, query.leave_type_id, query.status, query.date_from, query.date_to, query.search],
    queryFn: () => leaveApi.getLeaveRequests(query),
  });
};

/**
 * Hook để lấy leave requests của tôi
 */
export const useMyLeaveRequests = (query: Omit<GetLeaveRequestsQuery, 'employee_id'> = {}) => {
  const { page = 1, limit = 10 } = query;

  return useQuery<LeaveRequestsListResponse>({
    queryKey: ['my-leave-requests', page, limit, query.leave_type_id, query.status, query.date_from, query.date_to, query.search],
    queryFn: () => leaveApi.getMyLeaveRequests(query),
  });
};

/**
 * Hook để lấy pending approvals
 */
export const usePendingApprovals = (query: Omit<GetLeaveRequestsQuery, 'employee_id'> = {}) => {
  const { page = 1, limit = 10 } = query;

  return useQuery<LeaveRequestsListResponse>({
    queryKey: ['pending-approvals', page, limit, query.leave_type_id, query.status, query.date_from, query.date_to, query.search],
    queryFn: () => leaveApi.getPendingApprovals(query),
  });
};

/**
 * Hook để lấy leave request theo ID
 */
export const useLeaveRequest = (id: number) => {
  return useQuery<LeaveRequest>({
    queryKey: ['leave-request', id],
    queryFn: () => leaveApi.getLeaveRequestById(id),
    enabled: !!id,
  });
};

/**
 * Hook để tạo leave request
 */
export const useCreateLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeaveRequestRequest) => leaveApi.createLeaveRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave-balance'] });
    },
  });
};

/**
 * Hook để cập nhật leave request
 */
export const useUpdateLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLeaveRequestRequest }) =>
      leaveApi.updateLeaveRequest(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave-request', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['leave-balance'] });
    },
  });
};

/**
 * Hook để approve leave request
 */
export const useApproveLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ApproveLeaveRequestRequest }) =>
      leaveApi.approveLeaveRequest(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['leave-request', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['leave-balance'] });
    },
  });
};

/**
 * Hook để reject leave request
 */
export const useRejectLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RejectLeaveRequestRequest }) =>
      leaveApi.rejectLeaveRequest(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['leave-request', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['leave-balance'] });
    },
  });
};

/**
 * Hook để cancel leave request
 */
export const useCancelLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CancelLeaveRequestRequest }) =>
      leaveApi.cancelLeaveRequest(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave-request', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['leave-balance'] });
    },
  });
};

/**
 * Hook để lấy leave balance
 */
export const useLeaveBalance = (query: GetLeaveBalanceQuery) => {
  return useQuery<LeaveBalance[]>({
    queryKey: ['leave-balance', query.employee_id, query.year, query.leave_type_id],
    queryFn: () => leaveApi.getLeaveBalance(query),
    enabled: !!query.employee_id,
  });
};

/**
 * Hook để lấy leave balance của tôi
 */
export const useMyLeaveBalance = (query: Omit<GetLeaveBalanceQuery, 'employee_id'> = {}) => {
  return useQuery<LeaveBalance[]>({
    queryKey: ['my-leave-balance', query.year, query.leave_type_id],
    queryFn: () => leaveApi.getMyLeaveBalance(query),
  });
};

