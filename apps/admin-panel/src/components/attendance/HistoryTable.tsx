'use client';

import { Calendar, Clock, AlertCircle, CheckCircle2, XCircle, Hourglass } from 'lucide-react';
import { AttendanceRecord } from '@/types/attendance.types';
import { GreenBadge } from '@/components/ui/green-badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface HistoryTableProps {
  records: AttendanceRecord[];
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
  currentPage?: number;
  totalPages?: number;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  records,
  isLoading = false,
  onPageChange,
  currentPage = 1,
  totalPages = 1,
}) => {
  const getStatusBadge = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'CHECKED_IN':
        return <GreenBadge variant="info">Đã check-in</GreenBadge>;
      case 'COMPLETED':
        return <GreenBadge variant="success">Hoàn thành</GreenBadge>;
      case 'PENDING_APPROVAL':
        return <GreenBadge variant="warning">Chờ duyệt</GreenBadge>;
      case 'APPROVED':
        return <GreenBadge variant="success">Đã duyệt</GreenBadge>;
      case 'REJECTED':
        return <GreenBadge variant="error">Từ chối</GreenBadge>;
      default:
        return <GreenBadge variant="default">{status}</GreenBadge>;
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '-';
    return new Date(timeString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'short',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatHours = (hours?: number) => {
    if (hours === undefined || hours === null) return '-';
    return `${hours.toFixed(2)}h`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">Đang tải dữ liệu...</div>
        </CardContent>
      </Card>
    );
  }

  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">Không có dữ liệu chấm công</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch sử chấm công</CardTitle>
        <CardDescription>Danh sách các bản ghi chấm công của bạn</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3 font-semibold text-sm">Ngày</th>
                <th className="text-left p-3 font-semibold text-sm">Check-in</th>
                <th className="text-left p-3 font-semibold text-sm">Check-out</th>
                <th className="text-left p-3 font-semibold text-sm">Giờ làm</th>
                <th className="text-left p-3 font-semibold text-sm">OT</th>
                <th className="text-left p-3 font-semibold text-sm">Trạng thái</th>
                <th className="text-left p-3 font-semibold text-sm">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{formatDate(record.attendance_date)}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-green-600" />
                      <div>
                        <div>{formatTime(record.check_in_time)}</div>
                        {record.late && (
                          <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                            <AlertCircle className="h-3 w-3" />
                            Muộn {record.late_minutes} phút
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-sm">
                    {record.check_out_time ? (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <div>
                          <div>{formatTime(record.check_out_time)}</div>
                          {record.early_leave && (
                            <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
                              <AlertCircle className="h-3 w-3" />
                              Sớm {record.early_leave_minutes} phút
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-3 text-sm font-medium">
                    {formatHours(record.working_hours)}
                  </td>
                  <td className="p-3 text-sm">
                    {record.overtime_hours > 0 ? (
                      <span className="text-orange-600 font-medium">
                        {formatHours(record.overtime_hours)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-3 text-sm">
                    {getStatusBadge(record.status)}
                  </td>
                  <td className="p-3 text-sm">
                    <div className="space-y-1">
                      {record.late_reason && (
                        <div className="text-xs text-red-600">
                          <span className="font-medium">Muộn:</span> {record.late_reason}
                        </div>
                      )}
                      {record.early_leave_reason && (
                        <div className="text-xs text-orange-600">
                          <span className="font-medium">Sớm:</span> {record.early_leave_reason}
                        </div>
                      )}
                      {record.notes && (
                        <div className="text-xs text-gray-600">
                          {record.notes}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && onPageChange && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-gray-600">
              Trang {currentPage} / {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

