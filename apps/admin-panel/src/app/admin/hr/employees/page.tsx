'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Users, Building2 } from 'lucide-react';
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
import apiClient from '@/lib/api';

interface Employee {
  id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email?: string;
  phone?: string;
  department?: { id: number; name: string; code: string };
  position?: { id: number; name: string; code: string };
  status?: { id: number; name: string; code: string };
  hire_date: string;
  is_active: boolean;
}

interface EmployeesResponse {
  employees: Employee[];
  total: number;
  page: number;
  limit: number;
}

interface Department {
  id: number;
  code: string;
  name: string;
  display_name: string;
}

interface EmployeeStatus {
  id: number;
  code: string;
  name: string;
}

interface StatsResponse {
  activeEmployees: number;
  totalDepartments: number;
}

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch statistics
  const { data: stats } = useQuery<StatsResponse>({
    queryKey: ['hr-employees-stats'],
    queryFn: async () => {
      const response = await apiClient.get<StatsResponse>('/api/hr/employees/stats/summary');
      return response;
    },
  });

  // Fetch departments
  const { data: departmentsData } = useQuery<{ departments: Department[] }>({
    queryKey: ['hr-departments'],
    queryFn: async () => {
      const response = await apiClient.get<{ departments: Department[] }>('/api/hr/departments');
      return response;
    },
  });

  // Fetch employee statuses
  const { data: statusesData } = useQuery<{ statuses: EmployeeStatus[] }>({
    queryKey: ['hr-employee-statuses'],
    queryFn: async () => {
      const response = await apiClient.get<{ statuses: EmployeeStatus[] }>('/api/hr/employee-status');
      return response;
    },
  });

  // Fetch employees with filters
  const { data: employeesData, isLoading, error } = useQuery<EmployeesResponse>({
    queryKey: ['hr-employees', page, searchTerm, selectedDepartment, selectedStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      if (selectedDepartment && selectedDepartment !== 'all') {
        params.append('departmentId', selectedDepartment);
      }
      if (selectedStatus && selectedStatus !== 'all') {
        params.append('statusId', selectedStatus);
      }
      const response = await apiClient.get<EmployeesResponse>(`/api/hr/employees?${params.toString()}`);
      return response;
    },
  });

  const employees = employeesData?.employees || [];
  const total = employeesData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleFilterChange = () => {
    setPage(1); // Reset to first page when filter changes
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý nhân viên</h1>
          <p className="mt-2 text-gray-600">
            Quản lý thông tin nhân viên, phòng ban và chức vụ trong công ty
          </p>
        </div>
        <Link href="/admin/hr/employees/new">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" />
            Thêm nhân viên
          </Button>
        </Link>
      </div>

      {/* Section 1: Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số nhân viên Active</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeEmployees || 0}</div>
            <p className="text-xs text-muted-foreground">Nhân viên đang làm việc</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số phòng ban</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalDepartments || 0}</div>
            <p className="text-xs text-muted-foreground">Phòng ban đang hoạt động</p>
          </CardContent>
        </Card>
      </div>

      {/* Section 2: Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc tìm kiếm</CardTitle>
          <CardDescription>Tìm kiếm và lọc nhân viên theo các tiêu chí</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm nhân viên..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedDepartment || 'all'}
              onValueChange={(value) => {
                setSelectedDepartment(value);
                handleFilterChange();
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn phòng ban" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả phòng ban</SelectItem>
                {departmentsData?.departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.display_name || dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedStatus || 'all'}
              onValueChange={(value) => {
                setSelectedStatus(value);
                handleFilterChange();
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn tình trạng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả tình trạng</SelectItem>
                {statusesData?.statuses.map((status) => (
                  <SelectItem key={status.id} value={status.id.toString()}>
                    {status.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Employee List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Danh sách nhân viên</CardTitle>
              <CardDescription>
                Tổng số: {total} nhân viên
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">Có lỗi xảy ra khi tải dữ liệu</div>
          ) : employees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Không có nhân viên nào</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3 font-semibold text-sm">Mã NV</th>
                      <th className="text-left p-3 font-semibold text-sm">Họ tên</th>
                      <th className="text-left p-3 font-semibold text-sm">Email</th>
                      <th className="text-left p-3 font-semibold text-sm">SĐT</th>
                      <th className="text-left p-3 font-semibold text-sm">Phòng ban</th>
                      <th className="text-left p-3 font-semibold text-sm">Chức vụ</th>
                      <th className="text-left p-3 font-semibold text-sm">Tình trạng</th>
                      <th className="text-left p-3 font-semibold text-sm">Ngày vào làm</th>
                      <th className="text-left p-3 font-semibold text-sm">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((employee) => (
                      <tr key={employee.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 text-sm font-medium">{employee.employee_code}</td>
                        <td className="p-3 text-sm">{employee.full_name}</td>
                        <td className="p-3 text-sm">{employee.email || '-'}</td>
                        <td className="p-3 text-sm">{employee.phone || '-'}</td>
                        <td className="p-3 text-sm">
                          {employee.department ? (
                            <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs">
                              {employee.department.name}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="p-3 text-sm">
                          {employee.position ? (
                            <span className="px-2 py-1 rounded bg-purple-100 text-purple-800 text-xs">
                              {employee.position.name}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="p-3 text-sm">
                          {employee.status ? (
                            <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                              {employee.status.name}
                            </span>
                          ) : (
                            <span className={`px-2 py-1 rounded text-xs ${
                              employee.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {employee.is_active ? 'Đang làm việc' : 'Nghỉ việc'}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-sm">
                          {new Date(employee.hire_date).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="p-3">
                          <Link href={`/admin/hr/employees/${employee.id}`}>
                            <Button variant="outline" size="sm">Xem</Button>
                          </Link>
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
