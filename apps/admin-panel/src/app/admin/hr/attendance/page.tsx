'use client';

import { useState } from 'react';
import { Calendar, Clock, Users, AlertCircle, TrendingUp } from 'lucide-react';
import { useAttendanceRecords, useTodayAttendance, useAttendanceStats } from '@/hooks/use-attendance';
import { TodayAttendanceCard } from '@/components/attendance/TodayAttendanceCard';
import { HistoryTable } from '@/components/attendance/HistoryTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GreenStatsCard } from '@/components/ui/green-card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function AttendancePage() {
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // 30 ngày trước
    return date.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [status, setStatus] = useState<string>('all');
  const limit = 10;

  // Fetch today's attendance
  const { data: todayAttendance, isLoading: isLoadingToday } = useTodayAttendance();

  // Fetch attendance records
  const {
    data: attendanceData,
    isLoading: isLoadingRecords,
  } = useAttendanceRecords({
    page,
    limit,
    dateFrom,
    dateTo,
    status: status !== 'all' ? status as any : undefined,
  });

  // Fetch stats
  const { data: stats, isLoading: isLoadingStats } = useAttendanceStats(dateFrom, dateTo);

  const records = attendanceData?.records || [];
  const total = attendanceData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chấm công</h1>
          <p className="mt-2 text-gray-600">
            Quản lý chấm công hàng ngày và xem lịch sử chấm công
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GreenStatsCard
          title="Đã check-in hôm nay"
          value={stats?.checkedInToday || 0}
          icon={<Users className="h-5 w-5" />}
        />
        <GreenStatsCard
          title="Chờ duyệt"
          value={stats?.pendingApprovals || 0}
          icon={<AlertCircle className="h-5 w-5" />}
        />
        <GreenStatsCard
          title="Đi muộn"
          value={stats?.lateCheckIns || 0}
          icon={<Clock className="h-5 w-5" />}
        />
        <GreenStatsCard
          title="Giờ làm TB"
          value={stats?.averageWorkingHours ? `${stats.averageWorkingHours.toFixed(1)}h` : '0h'}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {/* Today's Attendance Card */}
      <TodayAttendanceCard
        attendance={todayAttendance || undefined}
        isLoading={isLoadingToday}
      />

      {/* Filters and History */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử chấm công</CardTitle>
          <CardDescription>
            Xem và quản lý lịch sử chấm công của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateFrom">Từ ngày</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateTo">Đến ngày</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={status}
                  onValueChange={(value) => {
                    setStatus(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="CHECKED_IN">Đã check-in</SelectItem>
                    <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                    <SelectItem value="PENDING_APPROVAL">Chờ duyệt</SelectItem>
                    <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                    <SelectItem value="REJECTED">Từ chối</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <div className="text-sm text-gray-600 pt-2">
                  Tổng: {total} bản ghi
                </div>
              </div>
            </div>

            {/* History Table */}
            <HistoryTable
              records={records}
              isLoading={isLoadingRecords}
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

