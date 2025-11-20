'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Briefcase, Eye, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import apiClient from '@/lib/api';
import { toast } from 'react-hot-toast';

interface Position {
  id: number;
  code: string;
  name: string;
  display_name: string;
  description?: string;
  level: number;
  requirements?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PositionsResponse {
  positions: Position[];
  total: number;
  page: number;
  limit: number;
}

const levelLabels: Record<number, string> = {
  1: 'Junior',
  2: 'Middle',
  3: 'Senior',
  4: 'Lead',
  5: 'Manager',
};

export default function PositionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch positions
  const { data: positionsData, isLoading, error } = useQuery<PositionsResponse>({
    queryKey: ['system-positions', page, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      const response = await apiClient.get<PositionsResponse>(`/api/hr/positions?${params.toString()}`);
      return response;
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/api/hr/positions/${id}`);
    },
    onSuccess: () => {
      toast.success('Xóa chức vụ thành công');
      queryClient.invalidateQueries({ queryKey: ['system-positions'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi xóa chức vụ');
    },
  });

  const positions = positionsData?.positions || [];
  const total = positionsData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa chức vụ "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Danh mục Chức Vụ</h1>
          <p className="mt-2 text-gray-600">
            Quản lý các chức vụ và vị trí công việc trong công ty
          </p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700" onClick={() => router.push('/admin/system/catalogs/positions/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm mới
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc tìm kiếm</CardTitle>
          <CardDescription>Tìm kiếm chức vụ theo tên hoặc mã</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm chức vụ..."
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

      {/* Position List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Danh sách chức vụ</CardTitle>
              <CardDescription>
                Tổng số: {total} chức vụ
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">Có lỗi xảy ra khi tải dữ liệu</div>
          ) : positions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Không có chức vụ nào</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3 font-semibold text-sm">Mã</th>
                      <th className="text-left p-3 font-semibold text-sm">Tên chức vụ</th>
                      <th className="text-left p-3 font-semibold text-sm">Tên hiển thị</th>
                      <th className="text-left p-3 font-semibold text-sm">Cấp bậc</th>
                      <th className="text-left p-3 font-semibold text-sm">Mô tả</th>
                      <th className="text-left p-3 font-semibold text-sm">Trạng thái</th>
                      <th className="text-left p-3 font-semibold text-sm">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map((position) => (
                      <tr key={position.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 text-sm font-medium">{position.code}</td>
                        <td className="p-3 text-sm">{position.name}</td>
                        <td className="p-3 text-sm">{position.display_name}</td>
                        <td className="p-3 text-sm">
                          <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs">
                            {levelLabels[position.level] || `Level ${position.level}`}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-gray-500">{position.description || '-'}</td>
                        <td className="p-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs ${
                            position.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {position.is_active ? 'Hoạt động' : 'Không hoạt động'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/admin/system/catalogs/positions/${position.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/admin/system/catalogs/positions/${position.id}/edit`)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(position.id, position.name)}
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

