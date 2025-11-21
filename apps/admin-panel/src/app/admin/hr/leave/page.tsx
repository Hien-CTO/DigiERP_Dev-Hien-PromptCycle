'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Calendar, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMyLeaveRequests, useMyLeaveBalance, usePendingApprovals } from '@/hooks/use-leave';
import apiClient from '@/lib/api';

interface LeaveType {
  id: number;
  code: string;
  name: string;
  is_paid: boolean;
  max_days_per_year: number;
}

export default function LeaveManagementPage() {
  const [activeTab, setActiveTab] = useState('my-requests');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const limit = 10;

  const currentYear = new Date().getFullYear();

  // Fetch leave types
  const { data: leaveTypesData } = useQuery<{ leaveTypes: LeaveType[] }>({
    queryKey: ['leave-types'],
    queryFn: async () => {
      const response = await apiClient.get<{ leaveTypes: LeaveType[] }>('/api/hr/leave-types');
      return response;
    },
  });

  // Fetch my leave requests
  const { data: myRequestsData, isLoading: isLoadingMyRequests } = useMyLeaveRequests({
    page,
    limit,
    status: statusFilter !== 'all' ? (statusFilter as any) : undefined,
  });

  // Fetch pending approvals
  const { data: pendingApprovalsData, isLoading: isLoadingPending } = usePendingApprovals({
    page,
    limit,
  });

  // Fetch my leave balance
  const { data: myBalanceData } = useMyLeaveBalance({
    year: currentYear,
  });

  const myRequests = myRequestsData?.leaveRequests || [];
  const pendingApprovals = pendingApprovalsData?.leaveRequests || [];
  const leaveBalances = myBalanceData || [];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-800' },
      APPROVED: { label: 'Đã duyệt', className: 'bg-green-100 text-green-800' },
      REJECTED: { label: 'Từ chối', className: 'bg-red-100 text-red-800' },
      CANCELLED: { label: 'Đã hủy', className: 'bg-gray-100 text-gray-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return (
      <span className={`px-2 py-1 rounded text-xs ${config.className}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý nghỉ phép</h1>
          <p className="mt-2 text-gray-600">
            Quản lý đơn nghỉ phép, xem số ngày phép còn lại và phê duyệt đơn nghỉ phép
          </p>
        </div>
        <Link href="/admin/hr/leave/new">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" />
            Tạo đơn nghỉ phép
          </Button>
        </Link>
      </div>

      {/* Leave Balance Summary */}
      {leaveBalances.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Số ngày phép còn lại ({currentYear})</CardTitle>
            <CardDescription>Tổng quan số ngày phép của bạn trong năm</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {leaveBalances.map((balance) => (
                <div key={balance.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">
                      {balance.leaveType?.name || `Loại ${balance.leave_type_id}`}
                    </span>
                    {balance.leaveType?.is_paid && (
                      <span className="text-xs text-green-600">Có lương</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Được cấp:</span>
                      <span className="font-medium">{balance.entitlement_days} ngày</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Đã dùng:</span>
                      <span className="font-medium">{balance.used_days} ngày</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Đang chờ:</span>
                      <span className="font-medium">{balance.pending_days} ngày</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                      <span>Còn lại:</span>
                      <span className="text-green-600">{balance.remaining_days} ngày</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="my-requests">Đơn của tôi</TabsTrigger>
          <TabsTrigger value="pending-approvals">
            Chờ duyệt ({pendingApprovals.length})
          </TabsTrigger>
        </TabsList>

        {/* My Requests Tab */}
        <TabsContent value="my-requests" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Đơn nghỉ phép của tôi</CardTitle>
                  <CardDescription>
                    Tổng số: {myRequestsData?.total || 0} đơn
                  </CardDescription>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Lọc theo trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                    <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                    <SelectItem value="REJECTED">Từ chối</SelectItem>
                    <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingMyRequests ? (
                <div className="text-center py-8">Đang tải...</div>
              ) : myRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Bạn chưa có đơn nghỉ phép nào
                </div>
              ) : (
                <div className="space-y-4">
                  {myRequests.map((request) => (
                    <div
                      key={request.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{request.request_number}</span>
                            {getStatusBadge(request.status)}
                            {request.is_edited && (
                              <span className="text-xs text-blue-600">(Đã chỉnh sửa)</span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(request.start_date).toLocaleDateString('vi-VN')} -{' '}
                                {new Date(request.end_date).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">{request.total_days}</span> ngày
                              {request.is_half_day && (
                                <span className="text-xs text-gray-500">
                                  {' '}
                                  ({request.half_day_type === 'MORNING' ? 'Sáng' : 'Chiều'})
                                </span>
                              )}
                            </div>
                            <div>
                              Loại: {request.leaveType?.name || `Loại ${request.leave_type_id}`}
                            </div>
                            <div className="truncate" title={request.reason}>
                              {request.reason}
                            </div>
                          </div>
                          {request.manager_rejection_reason && (
                            <div className="mt-2 text-sm text-red-600">
                              Lý do từ chối: {request.manager_rejection_reason}
                            </div>
                          )}
                          {request.hr_rejection_reason && (
                            <div className="mt-2 text-sm text-red-600">
                              Lý do HR từ chối: {request.hr_rejection_reason}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/admin/hr/leave/${request.id}`}>
                            <Button variant="outline" size="sm">
                              Xem chi tiết
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Pagination */}
                  {myRequestsData && myRequestsData.total > limit && (
                    <div className="flex items-center justify-between pt-4">
                      <div className="text-sm text-gray-600">
                        Trang {page} / {Math.ceil(myRequestsData.total / limit)}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                        >
                          Trước
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            setPage((p) => Math.min(Math.ceil(myRequestsData.total / limit), p + 1))
                          }
                          disabled={page >= Math.ceil(myRequestsData.total / limit)}
                        >
                          Sau
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Approvals Tab */}
        <TabsContent value="pending-approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Đơn chờ duyệt</CardTitle>
              <CardDescription>
                Tổng số: {pendingApprovalsData?.total || 0} đơn cần duyệt
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPending ? (
                <div className="text-center py-8">Đang tải...</div>
              ) : pendingApprovals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Không có đơn nào chờ duyệt
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingApprovals.map((request) => (
                    <div
                      key={request.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{request.request_number}</span>
                            {getStatusBadge(request.status)}
                          </div>
                          <div className="mb-2">
                            <span className="text-sm text-gray-600">Nhân viên: </span>
                            <span className="font-medium">
                              {request.employee?.full_name ||
                                `${request.employee?.first_name} ${request.employee?.last_name}` ||
                                `ID: ${request.employee_id}`}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(request.start_date).toLocaleDateString('vi-VN')} -{' '}
                                {new Date(request.end_date).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">{request.total_days}</span> ngày
                            </div>
                            <div>
                              Loại: {request.leaveType?.name || `Loại ${request.leave_type_id}`}
                            </div>
                            <div className="truncate" title={request.reason}>
                              {request.reason}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/admin/hr/leave/${request.id}/approve`}>
                            <Button className="bg-green-600 hover:bg-green-700" size="sm">
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Duyệt
                            </Button>
                          </Link>
                          <Link href={`/admin/hr/leave/${request.id}/reject`}>
                            <Button variant="destructive" size="sm">
                              <XCircle className="mr-2 h-4 w-4" />
                              Từ chối
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

