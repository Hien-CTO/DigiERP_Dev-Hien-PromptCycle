import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import {
  AttendanceRecord,
  AttendanceListResponse,
  AttendanceStats,
  CheckInRequest,
  CheckOutRequest,
  GetAttendanceQuery,
} from '@/types/attendance.types';

/**
 * Hook để lấy danh sách attendance records
 */
export const useAttendanceRecords = (query: GetAttendanceQuery = {}) => {
  const { page = 1, limit = 10, dateFrom, dateTo, status } = query;

  return useQuery<AttendanceListResponse>({
    queryKey: ['attendance-records', page, limit, dateFrom, dateTo, status],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (dateFrom) {
        params.append('dateFrom', dateFrom);
      }
      if (dateTo) {
        params.append('dateTo', dateTo);
      }
      if (status) {
        params.append('status', status);
      }
      return apiClient.get(`/api/hr/attendance?${params.toString()}`);
    },
  });
};

/**
 * Hook để lấy attendance record của employee hiện tại hôm nay
 */
export const useTodayAttendance = () => {
  return useQuery<AttendanceRecord | null>({
    queryKey: ['attendance-today'],
    queryFn: async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const response = await apiClient.get<AttendanceListResponse>(
          `/api/hr/attendance?dateFrom=${today}&dateTo=${today}&limit=1`
        );
        return response.records?.[0] || null;
      } catch (error) {
        // Nếu không có record hôm nay, trả về null
        return null;
      }
    },
  });
};

/**
 * Hook để lấy attendance record theo ID
 */
export const useAttendanceRecord = (id: number) => {
  return useQuery<AttendanceRecord>({
    queryKey: ['attendance-record', id],
    queryFn: () => apiClient.get(`/api/hr/attendance/${id}`),
    enabled: !!id,
  });
};

/**
 * Hook để lấy attendance statistics
 */
export const useAttendanceStats = (dateFrom?: string, dateTo?: string) => {
  return useQuery<AttendanceStats>({
    queryKey: ['attendance-stats', dateFrom, dateTo],
    queryFn: () => {
      const params = new URLSearchParams();
      if (dateFrom) {
        params.append('dateFrom', dateFrom);
      }
      if (dateTo) {
        params.append('dateTo', dateTo);
      }
      const queryString = params.toString();
      return apiClient.get(`/api/hr/attendance/stats${queryString ? `?${queryString}` : ''}`);
    },
  });
};

/**
 * Hook để check-in
 */
export const useCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckInRequest) => apiClient.post('/api/hr/attendance/check-in', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-today'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-stats'] });
    },
  });
};

/**
 * Hook để check-out
 */
export const useCheckOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckOutRequest) => apiClient.post('/api/hr/attendance/check-out', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-today'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-stats'] });
    },
  });
};

