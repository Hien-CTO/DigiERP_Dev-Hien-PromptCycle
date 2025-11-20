'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { UserForm } from '@/components/forms/user-form';
import { CreateUserRequest } from '@/types/user';
import apiClient from '@/lib/api';

export default function NewUserPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const createUserMutation = useMutation({
    mutationFn: async (data: CreateUserRequest) => {
      return await apiClient.post('/api/users', data);
    },
    onSuccess: () => {
      toast.success('Tạo người dùng thành công');
      // Invalidate users query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['users'] });
      router.push('/admin/users');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Tạo người dùng thất bại';
      toast.error(errorMessage);
    },
  });

  const handleSubmit = async (data: CreateUserRequest) => {
    await createUserMutation.mutateAsync(data);
  };

  const handleCancel = () => {
    router.push('/admin/users');
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Thêm người dùng mới</h1>
            <p className="mt-2 text-gray-600">
              Tạo tài khoản người dùng mới trong hệ thống
            </p>
          </div>
        </div>
      </div>

      {/* User Form */}
      <UserForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={createUserMutation.isPending}
      />
    </div>
  );
}

