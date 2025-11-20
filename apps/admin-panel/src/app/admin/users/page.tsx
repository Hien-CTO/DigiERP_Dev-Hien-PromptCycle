'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UserListResponse, UserResponse } from '@/types/user';
import apiClient from '@/lib/api';
import { UsersTable } from '@/components/tables/users-table';
import { UserDetailView } from '@/components/users/user-detail-view';
import { useTenantStore } from '@/store/tenant';

export default function UsersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingUserId, setViewingUserId] = useState<number | null>(null);
  const { getCurrentTenantId } = useTenantStore();
  const currentTenantId = getCurrentTenantId();

  // Fetch users from API - filter by selected tenant
  const { data: usersData, isLoading, error } = useQuery<UserListResponse>({
    queryKey: ['users', currentTenantId, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      // Thêm tenantId vào query params để filter users theo tenant
      if (currentTenantId) {
        params.append('tenantId', currentTenantId.toString());
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      const response = await apiClient.get<UserListResponse>(`/api/users${params.toString() ? `?${params.toString()}` : ''}`);
      return response;
    },
    enabled: !!currentTenantId, // Chỉ fetch khi đã chọn tenant
  });

  const users = usersData?.users || [];
  
  // Filter users based on search term
  const filteredUsers = searchTerm
    ? users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : users;

  const handleViewUser = (user: UserResponse) => {
    setViewingUserId(user.id);
    setIsViewDialogOpen(true);
  };

  const handleEditUser = (user: UserResponse) => {
    router.push(`/admin/users/${user.id}/edit`);
  };

  const handleDialogClose = (open: boolean) => {
    setIsViewDialogOpen(open);
    if (!open) {
      // Reset viewingUserId when dialog closes
      setViewingUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="mt-2 text-gray-600">
            Quản lý tài khoản người dùng trong hệ thống
          </p>
        </div>
        <Link href="/admin/users/new">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" />
            Thêm người dùng
          </Button>
        </Link>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <CardTitle>Danh sách người dùng</CardTitle>
              <CardDescription>
                {currentTenantId 
                  ? `Tổng số: ${usersData?.total || 0} người dùng trong tenant hiện tại`
                  : 'Vui lòng chọn tenant để xem danh sách người dùng'
                }
              </CardDescription>
            </div>
            <div className="w-80">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm người dùng..."  
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!currentTenantId ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Vui lòng chọn tenant từ dropdown trên navbar để xem danh sách người dùng</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">Đã xảy ra lỗi khi tải danh sách người dùng</p>
              <p className="text-sm text-gray-500 mt-2">Vui lòng thử lại sau</p>
            </div>
          ) : (
            <UsersTable
              users={filteredUsers}
              loading={isLoading}
              onView={handleViewUser}
              onEdit={handleEditUser}
            />
          )}
        </CardContent>
      </Card>

      {/* View User Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết người dùng</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết của người dùng trong hệ thống
            </DialogDescription>
          </DialogHeader>
          {viewingUserId && (
            <UserDetailView userId={viewingUserId} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
