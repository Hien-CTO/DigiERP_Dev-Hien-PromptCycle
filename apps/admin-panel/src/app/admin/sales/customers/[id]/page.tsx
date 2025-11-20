'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomerContacts } from '@/components/customer-contacts';
import { CustomerPricingPolicies } from '@/components/customer-pricing-policies';
import { 
  ArrowLeft, 
  Edit, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  User, 
  CreditCard,
  FileText,
  Package,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Contact,
  Tag,
} from 'lucide-react';

interface CustomerSummary {
  customer: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    contactPerson?: string;
    salesRep?: string;
    creditLimit: number;
    customerGroup?: {
      id: string;
      name: string;
      isCompany: boolean;
    };
  };
  financial: {
    creditLimit: number;
    currentDebt: number;
    availableCredit: number;
    unpaidInvoices: Array<{
      id: string;
      invoiceNumber: string;
      totalAmount: number;
      dueDate: string;
      status: string;
    }>;
  };
  orders: {
    recentOrders: Array<{
      id: string;
      orderNumber: string;
      totalAmount: number;
      status: string;
      createdAt: string;
    }>;
    totalOrders: number;
    totalValue: number;
    lastOrderDate?: string;
  };
  summary: {
    totalOrders: number;
    totalValue: number;
    currentDebt: number;
    creditUtilization: number;
  };
}

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params?.id as string;
  
  const [customerSummary, setCustomerSummary] = useState<CustomerSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomerSummary = useCallback(async () => {
    try {
      setLoading(true);
      // Use apiClient which is properly configured with baseURL
      const apiClient = (await import('@/lib/api')).default;
      const data = await apiClient.get(`/api/customers/${customerId}/summary`);
      setCustomerSummary(data);
    } catch (error: any) {
      console.error('Error fetching customer summary:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin khách hàng');
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    if (customerId) {
      fetchCustomerSummary();
    }
  }, [customerId, fetchCustomerSummary]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'PENDING': { variant: 'secondary' as const, label: 'Chờ xử lý', icon: Clock },
      'CONFIRMED': { variant: 'default' as const, label: 'Đã xác nhận', icon: CheckCircle },
      'SHIPPED': { variant: 'default' as const, label: 'Đã giao hàng', icon: Package },
      'DELIVERED': { variant: 'default' as const, label: 'Đã nhận hàng', icon: CheckCircle },
      'CANCELLED': { variant: 'destructive' as const, label: 'Đã hủy', icon: AlertTriangle },
      'PAID': { variant: 'default' as const, label: 'Đã thanh toán', icon: CheckCircle },
      'UNPAID': { variant: 'destructive' as const, label: 'Chưa thanh toán', icon: AlertTriangle },
      'OVERDUE': { variant: 'destructive' as const, label: 'Quá hạn', icon: AlertTriangle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['PENDING'];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        <Icon className="h-3 w-3" />
        <span>{config.label}</span>
      </Badge>
    );
  };

  const getCreditUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải thông tin khách hàng...</p>
        </div>
      </div>
    );
  }

  if (error || !customerSummary) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Không thể tải thông tin</h2>
        <p className="text-gray-600 mb-4">{error || 'Khách hàng không tồn tại'}</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
      </div>
    );
  }

  const { customer, financial, orders, summary } = customerSummary;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
            <h1 className="text-3xl font-bold tracking-tight">{customer.name}</h1>
            <p className="text-muted-foreground">
              {customer.customerGroup?.isCompany ? 'Khách hàng Công ty' : 'Khách hàng Lẻ'}
            </p>
          </div>
        </div>
        <Button onClick={() => router.push(`/admin/sales/customers/${customerId}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Chỉnh sửa
        </Button>
      </div>

      {/* Customer Type Badge */}
      <div className="flex items-center space-x-2">
        {customer.customerGroup?.isCompany ? (
          <Building2 className="h-5 w-5 text-blue-500" />
        ) : (
          <User className="h-5 w-5 text-green-500" />
        )}
        <Badge variant="outline">
          {customer.customerGroup?.name || 'Chưa phân loại'}
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Tổng giá trị: {formatCurrency(summary.totalValue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Công nợ hiện tại</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.currentDebt)}</div>
            <p className="text-xs text-muted-foreground">
              {financial.unpaidInvoices.length} hóa đơn chưa thanh toán
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hạn mức tín dụng</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financial.creditLimit)}</div>
            <p className="text-xs text-muted-foreground">
              Còn lại: {formatCurrency(financial.availableCredit)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sử dụng tín dụng</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getCreditUtilizationColor(summary.creditUtilization)}`}>
              {summary.creditUtilization.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.creditUtilization >= 90 ? 'Cảnh báo: Gần hết hạn mức' : 'Trong giới hạn'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="contacts">
            <Contact className="h-4 w-4 mr-2" />
            Liên hệ
          </TabsTrigger>
          <TabsTrigger value="pricing-policies">
            <Tag className="h-4 w-4 mr-2" />
            Chính sách giá
          </TabsTrigger>
          <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
          <TabsTrigger value="invoices">Hóa đơn</TabsTrigger>
          <TabsTrigger value="details">Chi tiết</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin liên hệ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {customer.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                {customer.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{customer.email}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <span>{customer.address}</span>
                  </div>
                )}
                {customer.contactPerson && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>Liên hệ: {customer.contactPerson}</span>
                  </div>
                )}
                {customer.salesRep && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>Sales Rep: {customer.salesRep}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Tình hình tài chính</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Hạn mức tín dụng:</span>
                  <span className="font-medium">{formatCurrency(financial.creditLimit)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Công nợ hiện tại:</span>
                  <span className="font-medium text-red-600">{formatCurrency(financial.currentDebt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hạn mức còn lại:</span>
                  <span className="font-medium text-green-600">{formatCurrency(financial.availableCredit)}</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between">
                    <span>Tỷ lệ sử dụng:</span>
                    <span className={`font-medium ${getCreditUtilizationColor(summary.creditUtilization)}`}>
                      {summary.creditUtilization.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${
                        summary.creditUtilization >= 90 ? 'bg-red-500' :
                        summary.creditUtilization >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(summary.creditUtilization, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="space-y-4">
          <CustomerContacts customerId={customerId} />
        </TabsContent>

        {/* Pricing Policies Tab */}
        <TabsContent value="pricing-policies" className="space-y-4">
          <CustomerPricingPolicies customerId={customerId} />
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử đơn hàng</CardTitle>
              <CardDescription>
                {orders.totalOrders} đơn hàng • Tổng giá trị: {formatCurrency(orders.totalValue)}
                {orders.lastOrderDate && ` • Đơn hàng cuối: ${formatDate(orders.lastOrderDate)}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orders.recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {orders.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Package className="h-5 w-5 text-gray-500" />
                        <div>
                          <div className="font-medium">{order.orderNumber}</div>
                          <div className="text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(order.totalAmount)}</div>
                        </div>
                        {getStatusBadge(order.status)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/sales/orders/${order.id}`)}
                        >
                          Xem
                        </Button>
                      </div>
                    </div>
                  ))}
                  {orders.totalOrders > orders.recentOrders.length && (
                    <div className="text-center py-4">
                      <Button variant="outline">
                        Xem tất cả {orders.totalOrders} đơn hàng
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Chưa có đơn hàng nào</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hóa đơn chưa thanh toán</CardTitle>
              <CardDescription>
                {financial.unpaidInvoices.length} hóa đơn • Tổng công nợ: {formatCurrency(financial.currentDebt)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {financial.unpaidInvoices.length > 0 ? (
                <div className="space-y-4">
                  {financial.unpaidInvoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <div className="font-medium">{invoice.invoiceNumber}</div>
                          <div className="text-sm text-gray-500">
                            Hạn thanh toán: {formatDate(invoice.dueDate)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(invoice.totalAmount)}</div>
                        </div>
                        {getStatusBadge(invoice.status)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/financial/invoices/${invoice.id}`)}
                        >
                          Xem
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-500">Không có hóa đơn chưa thanh toán</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin chi tiết</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">ID Khách hàng</label>
                  <p className="text-sm">{customer.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Nhóm khách hàng</label>
                  <p className="text-sm">{customer.customerGroup?.name || 'Chưa phân loại'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Loại khách hàng</label>
                  <p className="text-sm">
                    {customer.customerGroup?.isCompany ? 'Công ty' : 'Khách lẻ'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Sales Rep</label>
                  <p className="text-sm">{customer.salesRep || 'Chưa phân công'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
