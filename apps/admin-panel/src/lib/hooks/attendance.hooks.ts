'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '../api/attendance.api';
import type {
  CheckInRequest,
  CheckOutRequest,
  EditAttendanceRequest,
  ApproveAttendanceRequest,
  RejectAttendanceRequest,
  GetAttendanceQuery,
} from '@/types/attendance.types';

/**
 * Query keys for attendance
 */
export const attendanceKeys = {
  all: ['attendance'] as const,
  myAttendance: (query?: GetAttendanceQuery) => [...attendanceKeys.all, 'my', query] as const,
  departmentAttendance: (query?: GetAttendanceQuery) => [...attendanceKeys.all, 'department', query] as const,
  pendingApprovals: (query?: GetAttendanceQuery) => [...attendanceKeys.all, 'pending', query] as const,
  detail: (id: number) => [...attendanceKeys.all, 'detail', id] as const,
};

/**
 * Get my attendance records
 */
export function useMyAttendance(query?: GetAttendanceQuery) {
  return useQuery({
    queryKey: attendanceKeys.myAttendance(query),
    queryFn: () => attendanceApi.getMyAttendance(query),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Get department attendance (Manager)
 */
export function useDepartmentAttendance(query?: GetAttendanceQuery) {
  return useQuery({
    queryKey: attendanceKeys.departmentAttendance(query),
    queryFn: () => attendanceApi.getDepartmentAttendance(query),
    staleTime: 30 * 1000,
  });
}

/**
 * Get pending approvals
 */
export function usePendingApprovals(query?: GetAttendanceQuery) {
  return useQuery({
    queryKey: attendanceKeys.pendingApprovals(query),
    queryFn: () => attendanceApi.getPendingApprovals(query),
    staleTime: 10 * 1000, // 10 seconds - refresh more often
  });
}

/**
 * Get attendance record by ID
 */
export function useAttendance(id: number) {
  return useQuery({
    queryKey: attendanceKeys.detail(id),
    queryFn: () => attendanceApi.getAttendanceById(id),
    enabled: !!id,
  });
}

/**
 * Check-in mutation
 */
export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckInRequest) => attendanceApi.checkIn(data),
    onSuccess: () => {
      // Invalidate and refetch my attendance
      queryClient.invalidateQueries({ queryKey: attendanceKeys.myAttendance() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.pendingApprovals() });
    },
  });
}

/**
 * Check-out mutation
 */
export function useCheckOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckOutRequest) => attendanceApi.checkOut(data),
    onSuccess: () => {
      // Invalidate and refetch my attendance
      queryClient.invalidateQueries({ queryKey: attendanceKeys.myAttendance() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.pendingApprovals() });
    },
  });
}

/**
 * Edit attendance mutation
 */
export function useEditAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EditAttendanceRequest }) =>
      attendanceApi.editAttendance(id, data),
    onSuccess: (_, variables) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: attendanceKeys.myAttendance() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.pendingApprovals() });
    },
  });
}

/**
 * Approve attendance mutation
 */
export function useApproveAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: ApproveAttendanceRequest }) =>
      attendanceApi.approveAttendance(id, data),
    onSuccess: (_, variables) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: attendanceKeys.pendingApprovals() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.departmentAttendance() });
    },
  });
}

/**
 * Reject attendance mutation
 */
export function useRejectAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RejectAttendanceRequest }) =>
      attendanceApi.rejectAttendance(id, data),
    onSuccess: (_, variables) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: attendanceKeys.pendingApprovals() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.departmentAttendance() });
    },
  });
}

