'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Building2, Eye, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import apiClient from '@/lib/api';
import { toast } from 'react-hot-toast';

interface Department {
  id: number;
  code: string;
  name: string;
  display_name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface DepartmentsResponse {
  departments: Department[];
  total: number;
  page: number;
  limit: number;
}

export default function DepartmentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch departments
  const { data: departmentsData, isLoading, error } = useQuery<DepartmentsResponse>({
    queryKey: ['system-departments', page, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      const response = await apiClient.get<DepartmentsResponse>(`/api/hr/departments?${params.toString()}`);
      return response;
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/api/hr/departments/${id}`);
    },
    onSuccess: () => {
      toast.success('Xóa phòng ban thành công');
      queryClient.invalidateQueries({ queryKey: ['system-departments'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi xóa phòng ban');
    },
  });

  const departments = departmentsData?.departments || [];
  const total = departmentsData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa phòng ban "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Danh mục Phòng Ban</h1>
          <p className="mt-2 text-gray-600">
            Quản lý thông tin các phòng ban trong công ty
          </p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700" onClick={() => router.push('/admin/system/catalogs/departments/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm mới
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc tìm kiếm</CardTitle>
          <CardDescription>Tìm kiếm phòng ban theo tên hoặc mã</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm phòng ban..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Department List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Danh sách phòng ban</CardTitle>
              <CardDescription>
                Tổng số: {total} phòng ban
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">Có lỗi xảy ra khi tải dữ liệu</div>
          ) : departments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Không có phòng ban nào</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3 font-semibold text-sm">Mã</th>
                      <th className="text-left p-3 font-semibold text-sm">Tên phòng ban</th>
                      <th className="text-left p-3 font-semibold text-sm">Tên hiển thị</th>
                      <th className="text-left p-3 font-semibold text-sm">Mô tả</th>
                      <th className="text-left p-3 font-semibold text-sm">Trạng thái</th>
                      <th className="text-left p-3 font-semibold text-sm">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map((dept) => (
                      <tr key={dept.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 text-sm font-medium">{dept.code}</td>
                        <td className="p-3 text-sm">{dept.name}</td>
                        <td className="p-3 text-sm">{dept.display_name}</td>
                        <td className="p-3 text-sm text-gray-500">{dept.description || '-'}</td>
                        <td className="p-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs ${
                            dept.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {dept.is_active ? 'Hoạt động' : 'Không hoạt động'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/admin/system/catalogs/departments/${dept.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/admin/system/catalogs/departments/${dept.id}/edit`)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(dept.id, dept.name)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    Trang {page} / {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Trước
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

