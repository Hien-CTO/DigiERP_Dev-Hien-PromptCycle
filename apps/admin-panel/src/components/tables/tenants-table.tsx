'use client';

import { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ICellRendererParams, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { Edit, Trash2, Building2, Mail, Calendar, CheckCircle2, XCircle, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TenantResponse } from '@/types/tenant';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface TenantsTableProps {
  tenants: TenantResponse[];
  loading?: boolean;
  onEdit?: (tenant: TenantResponse) => void;
  onDelete?: (tenant: TenantResponse) => void;
  onView?: (tenant: TenantResponse) => void;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const TenantCellRenderer = (params: ICellRendererParams<TenantResponse>) => {
  const tenant = params.data;
  if (!tenant) return null;

  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
        <Building2 className="h-5 w-5 text-blue-600" />
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-semibold text-gray-900 truncate" title={tenant.displayName}>
          {tenant.displayName}
        </span>
        <span className="text-xs text-gray-500 truncate" title={tenant.code}>
          {tenant.code}
        </span>
      </div>
    </div>
  );
};

const EmailCellRenderer = (params: ICellRendererParams<TenantResponse>) => {
  const email = params.value;
  if (!email) return <span className="text-gray-400 text-sm">-</span>;

  return (
    <div className="flex items-center gap-2 min-w-0">
      <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
      <span className="text-sm text-gray-900 truncate" title={email}>{email}</span>
    </div>
  );
};

const StatusCellRenderer = (params: ICellRendererParams<TenantResponse>) => {
  const tenant = params.data;
  if (!tenant) return null;

  const statusConfig = {
    ACTIVE: {
      label: 'Hoạt động',
      icon: CheckCircle2,
      className: 'bg-green-500 text-white',
    },
    SUSPENDED: {
      label: 'Tạm ngưng',
      icon: Clock,
      className: 'bg-yellow-500 text-white',
    },
    INACTIVE: {
      label: 'Không hoạt động',
      icon: XCircle,
      className: 'bg-gray-300 text-gray-700',
    },
  };

  const config = statusConfig[tenant.status] || statusConfig.INACTIVE;
  const Icon = config.icon;

  return (
    <Badge className={`text-xs px-2 py-1 ${config.className}`}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
};

const SubscriptionTierCellRenderer = (params: ICellRendererParams<TenantResponse>) => {
  const tier = params.value;
  if (!tier) return <span className="text-gray-400 text-sm">-</span>;

  const tierConfig: Record<string, { label: string; className: string }> = {
    FREE: { label: 'Miễn phí', className: 'bg-gray-100 text-gray-800' },
    BASIC: { label: 'Cơ bản', className: 'bg-blue-100 text-blue-800' },
    PREMIUM: { label: 'Cao cấp', className: 'bg-purple-100 text-purple-800' },
    ENTERPRISE: { label: 'Doanh nghiệp', className: 'bg-indigo-100 text-indigo-800' },
  };

  const config = tierConfig[tier] || tierConfig.BASIC;

  return (
    <Badge className={`text-xs px-2 py-1 ${config.className}`}>
      {config.label}
    </Badge>
  );
};

const DateCellRenderer = (params: ICellRendererParams<TenantResponse>) => {
  const dateString = params.value;
  if (!dateString) return <span className="text-gray-400 text-sm">-</span>;

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
      <span className="text-sm text-gray-900">{formatDate(dateString)}</span>
    </div>
  );
};

const IndexCellRenderer = (params: ICellRendererParams<TenantResponse>) => {
  const api = params.api;
  const rowIndex = params.node.rowIndex ?? 0;
  
  let index = rowIndex + 1;
  
  if (api) {
    try {
      const currentPage = api.paginationGetCurrentPage() ?? 0;
      const pageSize = api.paginationGetPageSize() ?? 20;
      index = currentPage * pageSize + rowIndex + 1;
    } catch (error) {
      index = rowIndex + 1;
    }
  }
  
  return (
    <div className="flex items-center justify-center h-full text-gray-700 font-semibold text-sm">
      {index}
    </div>
  );
};

const ActionsCellRenderer = (params: ICellRendererParams<TenantResponse>) => {
  const tenant = params.data;
  const onEdit = params.context?.onEdit;
  const onDelete = params.context?.onDelete;
  const onView = params.context?.onView;

  if (!tenant) return null;

  return (
    <div className="flex items-center justify-center gap-2 h-full">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 transition-colors"
        title="Xem roles"
        onClick={() => onView?.(tenant)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-green-50 hover:text-green-600 transition-colors"
        title="Chỉnh sửa"
        onClick={() => onEdit?.(tenant)}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-red-50 hover:text-red-600 transition-colors"
        title="Xóa"
        onClick={() => onDelete?.(tenant)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export function TenantsTable({ tenants, loading = false, onEdit, onDelete, onView }: TenantsTableProps) {
  const columnDefs: ColDef<TenantResponse>[] = useMemo(
    () => [
      {
        headerName: 'STT',
        field: 'index',
        width: 70,
        minWidth: 70,
        pinned: 'left',
        lockPinned: true,
        cellRenderer: IndexCellRenderer,
        sortable: false,
        filter: false,
        suppressSizeToFit: true,
        cellStyle: { 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 8px',
          backgroundColor: '#f9fafb',
        },
        headerClass: 'ag-header-cell-custom',
        headerStyle: {
          backgroundColor: '#f9fafb',
        },
      },
      {
        headerName: 'Tenant',
        field: 'displayName',
        width: 250,
        minWidth: 200,
        cellRenderer: TenantCellRenderer,
        filter: 'agTextColumnFilter',
        suppressSizeToFit: true,
        cellStyle: {
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
        },
      },
      {
        headerName: 'Mã số thuế',
        field: 'taxCode',
        width: 150,
        minWidth: 120,
        filter: 'agTextColumnFilter',
        suppressSizeToFit: true,
        cellStyle: {
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
          fontSize: '14px',
          color: '#6b7280',
        },
        valueGetter: (params) => params.data?.taxCode || '-',
      },
      {
        headerName: 'Email',
        field: 'email',
        width: 250,
        minWidth: 200,
        cellRenderer: EmailCellRenderer,
        filter: 'agTextColumnFilter',
        suppressSizeToFit: true,
        cellStyle: {
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
        },
      },
      {
        headerName: 'Trạng thái',
        field: 'status',
        width: 180,
        minWidth: 150,
        cellRenderer: StatusCellRenderer,
        filter: 'agSetColumnFilter',
        filterParams: {
          values: ['ACTIVE', 'SUSPENDED', 'INACTIVE'],
        },
        suppressSizeToFit: true,
        cellStyle: { 
          display: 'flex', 
          alignItems: 'center',
          padding: '12px 16px'
        },
      },
      {
        headerName: 'Gói đăng ký',
        field: 'subscriptionTier',
        width: 150,
        minWidth: 120,
        cellRenderer: SubscriptionTierCellRenderer,
        filter: 'agSetColumnFilter',
        filterParams: {
          values: ['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE'],
        },
        suppressSizeToFit: true,
        cellStyle: { 
          display: 'flex', 
          alignItems: 'center',
          padding: '12px 16px'
        },
      },
      {
        headerName: 'Ngày tạo',
        field: 'createdAt',
        width: 180,
        minWidth: 150,
        cellRenderer: DateCellRenderer,
        suppressSizeToFit: true,
        cellStyle: {
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
        },
      },
      {
        headerName: 'Thao tác',
        field: 'actions',
        width: 160,
        minWidth: 160,
        pinned: 'right',
        lockPinned: true,
        cellRenderer: ActionsCellRenderer,
        sortable: false,
        filter: false,
        suppressSizeToFit: true,
        cellStyle: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px',
        },
      },
    ],
    []
  );

  // Calculate total width of all columns
  const totalWidth = useMemo(() => {
    return columnDefs.reduce((sum, col) => sum + (col.width || 0), 0);
  }, [columnDefs]);

  // Calculate dynamic height based on visible rows to avoid internal scrollbar
  const calculateHeight = () => {
    const headerHeight = 50;
    const rowHeight = 60;
    const paginationHeight = 60;
    const pageSize = 20;
    const visibleRows = Math.min(tenants.length, pageSize);
    
    const totalHeight = headerHeight + (rowHeight * visibleRows) + paginationHeight;
    
    return Math.max(400, Math.min(totalHeight, 800));
  };

  const gridHeight = useMemo(() => calculateHeight(), [tenants.length]);

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      cellStyle: {
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        fontSize: '14px',
        lineHeight: '1.5',
      },
      headerClass: 'ag-header-cell-custom',
    }),
    []
  );

  const gridOptions = useMemo(
    () => ({
      context: {
        onEdit,
        onDelete,
        onView,
      },
      loading: loading,
      animateRows: true,
      rowHeight: 60,
    }),
    [loading, onEdit, onDelete, onView]
  );

  return (
    <div 
      className="tenants-table-container w-full"
      style={{ 
        height: `${gridHeight}px`,
      }}
    >
      <div 
        className="ag-theme-alpine" 
        style={{ 
          width: '100%', 
          height: '100%'
        }}
      >
        <AgGridReact<TenantResponse>
          rowData={tenants}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          gridOptions={gridOptions}
          loading={loading}
          pagination={true}
          paginationPageSize={20}
          paginationPageSizeSelector={[10, 20, 50, 100]}
          suppressHorizontalScroll={false}
          suppressVerticalScroll={true}
          alwaysShowHorizontalScroll={false}
          suppressSizeToFit={true}
          domLayout="normal"
          localeText={{
            noRowsToShow: 'Không có dữ liệu',
            loadingOoo: 'Đang tải...',
            page: 'Trang',
            to: 'đến',
            of: 'của',
            nextPage: 'Trang tiếp',
            lastPage: 'Trang cuối',
            firstPage: 'Trang đầu',
            previousPage: 'Trang trước',
            pageSizeSelectorLabel: 'Số dòng mỗi trang:',
          }}
        />
      </div>
    </div>
  );
}

