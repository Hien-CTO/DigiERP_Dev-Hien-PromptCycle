'use client';

import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { UserForm } from '@/components/forms/user-form';
import { UserResponse, UpdateUserRequest } from '@/types/user';
import apiClient from '@/lib/api';

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = parseInt(params.id as string, 10);
  const queryClient = useQueryClient();

  // Fetch user data
  const { data: userData, isLoading: isLoadingUser, error } = useQuery<UserResponse>({
    queryKey: ['user', userId],
    queryFn: async () => {
      return await apiClient.get<UserResponse>(`/api/users/${userId}`);
    },
    enabled: !!userId && !isNaN(userId),
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: UpdateUserRequest | FormData) => {
      // apiClient will handle FormData automatically (no Content-Type header set)
      return await apiClient.put<UserResponse>(`/api/users/${userId}`, data);
    },
    onSuccess: () => {
      toast.success('Cập nhật người dùng thành công');
      // Invalidate queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      router.push('/admin/users');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Cập nhật người dùng thất bại';
      toast.error(errorMessage);
    },
  });

  const handleSubmit = async (data: UpdateUserRequest) => {
    await updateUserMutation.mutateAsync(data);
  };

  const handleCancel = () => {
    router.push('/admin/users');
  };

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin người dùng...</p>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleCancel}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lỗi</h1>
            <p className="mt-2 text-gray-600">
              Không thể tải thông tin người dùng
            </p>
          </div>
        </div>
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">
            {(error as any)?.response?.data?.message || 'Người dùng không tồn tại hoặc đã xảy ra lỗi'}
          </p>
        </div>
        <Button onClick={handleCancel}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleCancel}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa người dùng</h1>
            <p className="mt-2 text-gray-600">
              Cập nhật thông tin cho {userData.fullName} ({userData.username})
            </p>
          </div>
        </div>
      </div>

      {/* User Form */}
      <UserForm
        initialData={userData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={updateUserMutation.isPending}
      />
    </div>
  );
}

