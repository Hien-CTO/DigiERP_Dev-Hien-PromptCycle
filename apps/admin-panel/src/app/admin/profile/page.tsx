'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/auth';
import { UserResponse, UpdateUserRequest } from '@/types/user';
import apiClient from '@/lib/api';
import { ProfileView } from '@/components/profile/profile-view';

export default function ProfilePage() {
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  const userId = currentUser?.id;

  // Fetch full user details
  const { data: userData, isLoading, error } = useQuery<UserResponse>({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID not found');
      return await apiClient.get<UserResponse>(`/api/users/${userId}`);
    },
    enabled: !!userId,
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: UpdateUserRequest | FormData) => {
      if (!userId) throw new Error('User ID not found');
      return await apiClient.put<UserResponse>(`/api/users/${userId}`, data);
    },
    onSuccess: (updatedUser) => {
      toast.success('Cập nhật thông tin thành công');
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      // Update auth store with new user data
      const { user, updateUser } = useAuthStore.getState();
      if (user) {
        updateUser({
          ...user,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          phone: updatedUser.phone,
          avatarUrl: updatedUser.avatarUrl,
        });
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Cập nhật thông tin thất bại';
      toast.error(errorMessage);
    },
  });

  const handleSubmit = async (data: UpdateUserRequest | FormData) => {
    await updateUserMutation.mutateAsync(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
          <p className="mt-2 text-gray-600">Không thể tải thông tin cá nhân</p>
        </div>
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">
            {(error as any)?.response?.data?.message || 'Đã xảy ra lỗi khi tải thông tin'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
        <p className="mt-2 text-gray-600">
          Xem và quản lý thông tin cá nhân của bạn
        </p>
      </div>

      <ProfileView
        userData={userData}
        onSubmit={handleSubmit}
        isLoading={updateUserMutation.isPending}
      />
    </div>
  );
}

