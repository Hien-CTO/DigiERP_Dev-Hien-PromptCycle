'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Building2, User } from 'lucide-react';
import { useCustomer, useUpdateCustomer, useCustomerGroups } from '@/hooks/use-customers';
import { UpdateCustomerRequest } from '@/types/customer';

interface CustomerGroup {
  id: string;
  name: string;
  isCompany: boolean;
  color?: string;
  description?: string;
}

interface CustomerFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  taxCode: string;
  contactPerson: string;
  paymentTerms: string;
  creditLimit: number;
  notes: string;
  salesRep: string;
  customerGroupId: string;
  isActive: boolean;
  salesRepresentativeId?: number;
}

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params?.id as string;

  const { data: customer, isLoading: loadingCustomer } = useCustomer(customerId);
  const { data: customerGroups } = useCustomerGroups();
  const updateCustomerMutation = useUpdateCustomer();

  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    phone: '',
    email: '',
    address: '',
    taxCode: '',
    contactPerson: '',
    paymentTerms: '',
    creditLimit: 0,
    notes: '',
    salesRep: '',
    customerGroupId: '',
    isActive: true,
  });

  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedGroupData, setSelectedGroupData] = useState<CustomerGroup | null>(null);

  // Load customer data into form
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
        taxCode: customer.taxCode || '',
        contactPerson: customer.contactPerson || '',
        paymentTerms: customer.paymentTerms || '',
        creditLimit: Math.round(customer.creditLimit || 0), // Làm tròn đến số nguyên
        notes: customer.notes || '',
        salesRep: customer.salesRep || '',
        customerGroupId: customer.customerGroupId || '',
        isActive: customer.isActive ?? true,
        salesRepresentativeId: customer.salesRepresentativeId,
      });
      setSelectedGroup(customer.customerGroupId || '');
    }
  }, [customer]);

  useEffect(() => {
    // Update selected group data when group changes
    const group = customerGroups?.find(g => g.id === selectedGroup);
    setSelectedGroupData(group || null);
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      customerGroupId: selectedGroup,
    }));
  }, [selectedGroup, customerGroups]);

  const handleInputChange = (field: keyof CustomerFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Format number with US thousands separator (1,234,567)
  const formatNumber = (num: number): string => {
    return Math.round(num).toLocaleString('en-US');
  };

  // Parse formatted number string back to number
  const parseFormattedNumber = (value: string): number => {
    // Remove all commas and parse
    const cleaned = value.replace(/,/g, '');
    const parsed = parseFloat(cleaned) || 0;
    return Math.round(parsed);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên khách hàng');
      return false;
    }

    if (!selectedGroup) {
      toast.error('Vui lòng chọn nhóm khách hàng');
      return false;
    }

    // Validate company customer requirements
    if (selectedGroupData?.isCompany) {
      if (!formData.taxCode.trim()) {
        toast.error('Mã số thuế là bắt buộc đối với khách hàng công ty');
        return false;
      }
      if (!formData.contactPerson.trim()) {
        toast.error('Người liên hệ là bắt buộc đối với khách hàng công ty');
        return false;
      }
    }

    // Validate email format
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Email không hợp lệ');
      return false;
    }

    // Validate phone format (basic)
    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      toast.error('Số điện thoại không hợp lệ');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const updateData: UpdateCustomerRequest = {
        name: formData.name,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        address: formData.address || undefined,
        taxCode: formData.taxCode || undefined,
        contactPerson: formData.contactPerson || undefined,
        paymentTerms: formData.paymentTerms || undefined,
        creditLimit: formData.creditLimit || 0,
        notes: formData.notes || undefined,
        salesRep: formData.salesRep || undefined,
        customerGroupId: formData.customerGroupId || undefined,
        isActive: formData.isActive,
        salesRepresentativeId: formData.salesRepresentativeId,
      };

      await updateCustomerMutation.mutateAsync({
        id: customerId,
        data: updateData,
      });

      toast.success('Cập nhật khách hàng thành công!');
      router.push(`/admin/sales/customers/${customerId}`);
    } catch (error: any) {
      console.error('Error updating customer:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật khách hàng');
    }
  };

  const getCustomerTypeIcon = () => {
    if (selectedGroupData?.isCompany) {
      return <Building2 className="h-5 w-5 text-blue-500" />;
    }
    return <User className="h-5 w-5 text-green-500" />;
  };

  const getCustomerTypeText = () => {
    if (selectedGroupData?.isCompany) {
      return 'Khách hàng Công ty';
    }
    return 'Khách hàng Lẻ';
  };

  if (loadingCustomer) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin khách hàng...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">Không tìm thấy khách hàng</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa khách hàng</h1>
          <p className="text-muted-foreground">
            Cập nhật thông tin khách hàng trong hệ thống
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Group Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Phân loại khách hàng</CardTitle>
            <CardDescription>
              Chọn nhóm khách hàng để xác định loại khách hàng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="customerGroup">Nhóm khách hàng *</Label>
                <Select value={selectedGroup || undefined} onValueChange={setSelectedGroup}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn nhóm khách hàng" />
                  </SelectTrigger>
                  <SelectContent>
                    {customerGroups
                      ?.filter(group => group.id && group.id.trim() !== '') // Filter out empty IDs
                      .map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          <div className="flex items-center space-x-2">
                            {group.isCompany ? (
                              <Building2 className="h-4 w-4 text-blue-500" />
                            ) : (
                              <User className="h-4 w-4 text-green-500" />
                            )}
                            <span>{group.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedGroupData && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    {getCustomerTypeIcon()}
                    <span className="font-medium">{getCustomerTypeText()}</span>
                  </div>
                  {selectedGroupData.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedGroupData.description}
                    </p>
                  )}
                  {selectedGroupData.isCompany && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                      <strong>Lưu ý:</strong> Khách hàng công ty cần có mã số thuế và người liên hệ
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
            <CardDescription>
              Thông tin chính của khách hàng
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Tên khách hàng *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nhập tên khách hàng"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Nhập số điện thoại"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Nhập email"
                />
              </div>
              <div>
                <Label htmlFor="salesRep">Nhân viên Sales</Label>
                <Input
                  id="salesRep"
                  value={formData.salesRep}
                  onChange={(e) => handleInputChange('salesRep', e.target.value)}
                  placeholder="Nhập tên nhân viên sales"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Địa chỉ</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Nhập địa chỉ"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
              />
              <Label htmlFor="isActive">Khách hàng đang hoạt động</Label>
            </div>
          </CardContent>
        </Card>

        {/* Company Information (Conditional) */}
        {selectedGroupData?.isCompany && (
          <Card>
            <CardHeader>
              <CardTitle>Thông tin công ty</CardTitle>
              <CardDescription>
                Thông tin dành riêng cho khách hàng công ty
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="taxCode">Mã số thuế *</Label>
                  <Input
                    id="taxCode"
                    value={formData.taxCode}
                    onChange={(e) => handleInputChange('taxCode', e.target.value)}
                    placeholder="Nhập mã số thuế"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactPerson">Người liên hệ *</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    placeholder="Nhập tên người liên hệ"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="paymentTerms">Điều khoản thanh toán</Label>
                <Select value={formData.paymentTerms || undefined} onValueChange={(value) => handleInputChange('paymentTerms', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn điều khoản thanh toán" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COD">COD (Thanh toán khi giao hàng)</SelectItem>
                    <SelectItem value="NET_7">Net 7 (Thanh toán trong 7 ngày)</SelectItem>
                    <SelectItem value="NET_15">Net 15 (Thanh toán trong 15 ngày)</SelectItem>
                    <SelectItem value="NET_30">Net 30 (Thanh toán trong 30 ngày)</SelectItem>
                    <SelectItem value="NET_60">Net 60 (Thanh toán trong 60 ngày)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin tài chính</CardTitle>
            <CardDescription>
              Cấu hình hạn mức tín dụng và điều khoản thanh toán
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="creditLimit">Hạn mức tín dụng (VND)</Label>
              <Input
                id="creditLimit"
                type="text"
                value={formatNumber(formData.creditLimit)}
                onChange={(e) => {
                  const value = e.target.value;
                  const parsedValue = parseFormattedNumber(value);
                  handleInputChange('creditLimit', parsedValue);
                }}
                placeholder="Nhập hạn mức tín dụng (ví dụ: 5,000,000)"
                inputMode="numeric"
              />
            </div>

            {!selectedGroupData?.isCompany && (
              <div>
                <Label htmlFor="paymentTerms">Điều khoản thanh toán</Label>
                <Select value={formData.paymentTerms || undefined} onValueChange={(value) => handleInputChange('paymentTerms', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn điều khoản thanh toán" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COD">COD (Thanh toán khi giao hàng)</SelectItem>
                    <SelectItem value="NET_7">Net 7 (Thanh toán trong 7 ngày)</SelectItem>
                    <SelectItem value="NET_15">Net 15 (Thanh toán trong 15 ngày)</SelectItem>
                    <SelectItem value="NET_30">Net 30 (Thanh toán trong 30 ngày)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin bổ sung</CardTitle>
            <CardDescription>
              Ghi chú và thông tin khác
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Nhập ghi chú về khách hàng"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={updateCustomerMutation.isPending}>
            {updateCustomerMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Lưu thay đổi
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

