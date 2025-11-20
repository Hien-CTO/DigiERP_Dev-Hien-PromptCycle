'use client';

import { Clock, Calendar, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AttendanceRecord } from '@/types/attendance.types';
import { GreenCard } from '@/components/ui/green-card';
import { GreenBadge } from '@/components/ui/green-badge';
import { CheckInButton } from './CheckInButton';
import { CheckOutButton } from './CheckOutButton';

interface TodayAttendanceCardProps {
  attendance?: AttendanceRecord | null;
  isLoading?: boolean;
}

export const TodayAttendanceCard: React.FC<TodayAttendanceCardProps> = ({
  attendance,
  isLoading = false,
}) => {
  const formatTime = (timeString?: string) => {
    if (!timeString) return '-';
    return new Date(timeString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateWorkingHours = () => {
    if (!attendance?.check_in_time) return null;
    if (!attendance?.check_out_time) {
      const now = new Date();
      const checkIn = new Date(attendance.check_in_time);
      const diffMs = now.getTime() - checkIn.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      return Math.max(0, diffHours - (attendance.break_time || 0));
    }
    return attendance.working_hours || null;
  };

  const workingHours = calculateWorkingHours();

  if (isLoading) {
    return (
      <GreenCard>
        <div className="text-center py-8 text-gray-500">Đang tải thông tin chấm công hôm nay...</div>
      </GreenCard>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const hasCheckedIn = !!attendance?.check_in_time;
  const hasCheckedOut = !!attendance?.check_out_time;

  return (
    <GreenCard variant="elevated">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Chấm công hôm nay</h3>
            <p className="text-sm text-gray-600 mt-1">
              <Calendar className="inline h-4 w-4 mr-1" />
              {formatDate(today)}
            </p>
          </div>
          {hasCheckedIn && !hasCheckedOut && (
            <GreenBadge variant="info" animated>
              Đang làm việc
            </GreenBadge>
          )}
          {hasCheckedOut && (
            <GreenBadge variant="success">
              <CheckCircle2 className="inline h-3 w-3 mr-1" />
              Hoàn thành
            </GreenBadge>
          )}
        </div>

        {/* Status Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Check-in</span>
            </div>
            {hasCheckedIn ? (
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatTime(attendance.check_in_time)}
                </div>
                {attendance.late && (
                  <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    Muộn {attendance.late_minutes} phút
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-400">Chưa check-in</div>
            )}
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Check-out</span>
            </div>
            {hasCheckedOut ? (
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatTime(attendance.check_out_time)}
                </div>
                {attendance.early_leave && (
                  <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    Sớm {attendance.early_leave_minutes} phút
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-400">Chưa check-out</div>
            )}
          </div>
        </div>

        {/* Working Hours */}
        {hasCheckedIn && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-700">Giờ làm việc</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {workingHours !== null ? `${workingHours.toFixed(2)}h` : '-'}
                </div>
              </div>
              {attendance.overtime_hours > 0 && (
                <div className="text-right">
                  <div className="text-sm font-medium text-orange-600">Làm thêm</div>
                  <div className="text-xl font-bold text-orange-600 mt-1">
                    {attendance.overtime_hours.toFixed(2)}h
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Location */}
        {attendance?.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{attendance.location}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <div className="flex-1">
            <CheckInButton className="w-full" />
          </div>
          <div className="flex-1">
            <CheckOutButton className="w-full" />
          </div>
        </div>
      </div>
    </GreenCard>
  );
};

