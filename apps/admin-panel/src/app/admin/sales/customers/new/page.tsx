'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
}

export default function NewCustomerPage() {
  const router = useRouter();
  const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedGroupData, setSelectedGroupData] = useState<CustomerGroup | null>(null);
  
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
  });

  useEffect(() => {
    fetchCustomerGroups();
  }, []);

  useEffect(() => {
    // Update selected group data when group changes
    const group = customerGroups.find(g => g.id === selectedGroup);
    setSelectedGroupData(group || null);
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      customerGroupId: selectedGroup,
    }));
  }, [selectedGroup, customerGroups]);

  const fetchCustomerGroups = async () => {
    try {
      const apiClient = (await import('@/lib/api')).default;
      const data = await apiClient.get('/api/customers/groups');
      setCustomerGroups(data);
    } catch (error) {
      console.error('Error fetching customer groups:', error);
    }
  };

  const handleInputChange = (field: keyof CustomerFormData, value: string | number) => {
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
      alert('Vui lòng nhập tên khách hàng');
      return false;
    }

    if (!selectedGroup) {
      alert('Vui lòng chọn nhóm khách hàng');
      return false;
    }

    // Validate company customer requirements
    if (selectedGroupData?.isCompany) {
      if (!formData.taxCode.trim()) {
        alert('Mã số thuế là bắt buộc đối với khách hàng công ty');
        return false;
      }
      if (!formData.contactPerson.trim()) {
        alert('Người liên hệ là bắt buộc đối với khách hàng công ty');
        return false;
      }
    }

    // Validate email format
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert('Email không hợp lệ');
      return false;
    }

    // Validate phone format (basic)
    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      alert('Số điện thoại không hợp lệ');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newCustomer = await response.json();
        alert('Tạo khách hàng thành công!');
        router.push(`/admin/sales/customers/${newCustomer.id}`);
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.message || 'Không thể tạo khách hàng'}`);
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('Có lỗi xảy ra khi tạo khách hàng');
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold tracking-tight">Thêm khách hàng mới</h1>
          <p className="text-muted-foreground">
            Tạo thông tin khách hàng mới trong hệ thống
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
                      .filter(group => group.id && group.id.trim() !== '') // Filter out empty IDs
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
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedGroupData.description}
                  </p>
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
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang tạo...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Tạo khách hàng
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
