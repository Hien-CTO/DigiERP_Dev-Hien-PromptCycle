import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '@/lib/api/attendance.api';
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
    queryFn: () => attendanceApi.getMyAttendance({ page, limit, dateFrom, dateTo, status }),
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
        const response = await attendanceApi.getMyAttendance({
          dateFrom: today,
          dateTo: today,
          limit: 1,
        });
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
    queryFn: () => attendanceApi.getAttendanceById(id),
    enabled: !!id,
  });
};

/**
 * Hook để lấy attendance statistics
 */
export const useAttendanceStats = (dateFrom?: string, dateTo?: string) => {
  return useQuery<AttendanceStats>({
    queryKey: ['attendance-stats', dateFrom, dateTo],
    queryFn: () => attendanceApi.getStats({ dateFrom, dateTo }),
  });
};

/**
 * Hook để check-in
 */
export const useCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckInRequest) => attendanceApi.checkIn(data),
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
    mutationFn: (data: CheckOutRequest) => attendanceApi.checkOut(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-today'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-stats'] });
    },
  });
};

/**
 * Hook để export attendance data
 */
export const useExportAttendance = () => {
  return useMutation({
    mutationFn: (query: GetAttendanceQuery) => attendanceApi.exportAttendance(query),
  });
};

