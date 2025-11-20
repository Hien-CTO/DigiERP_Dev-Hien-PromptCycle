'use client';

import { useMemo, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ICellRendererParams, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { Edit, Eye, UserCheck, UserX, Mail, Phone, Calendar, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserResponse } from '@/types/user';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface UsersTableProps {
  users: UserResponse[];
  loading?: boolean;
  onView?: (user: UserResponse) => void;
  onEdit?: (user: UserResponse) => void;
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

const StatusCellRenderer = (params: ICellRendererParams<UserResponse>) => {
  const user = params.data;
  if (!user) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge
        variant={user.isActive ? 'default' : 'secondary'}
        className={`text-xs px-2 py-1 ${
          user.isActive 
            ? 'bg-green-500 text-white' 
            : 'bg-gray-300 text-gray-700'
        }`}
      >
        {user.isActive ? (
          <>
            <UserCheck className="mr-1 h-3 w-3" />
            Hoạt động
          </>
        ) : (
          <>
            <UserX className="mr-1 h-3 w-3" />
            Không hoạt động
          </>
        )}
      </Badge>
      <Badge
        variant={user.isVerified ? 'default' : 'secondary'}
        className={`text-xs px-2 py-1 ${
          user.isVerified 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-200 text-gray-600'
        }`}
      >
        {user.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
      </Badge>
    </div>
  );
};

const EmailCellRenderer = (params: ICellRendererParams<UserResponse>) => {
  const email = params.value;
  if (!email) return <span className="text-gray-400 text-sm">-</span>;

  return (
    <div className="flex items-center gap-2 min-w-0">
      <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
      <span className="text-sm text-gray-900 truncate" title={email}>{email}</span>
    </div>
  );
};

const PhoneCellRenderer = (params: ICellRendererParams<UserResponse>) => {
  const phone = params.value;
  if (!phone) return <span className="text-gray-400 text-sm">-</span>;

  return (
    <div className="flex items-center gap-2">
      <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
      <span className="text-sm text-gray-900 font-medium">{phone}</span>
    </div>
  );
};

const DateCellRenderer = (params: ICellRendererParams<UserResponse>) => {
  const dateString = params.value;
  if (!dateString) return <span className="text-gray-400 text-sm">-</span>;

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
      <span className="text-sm text-gray-900">{formatDate(dateString)}</span>
    </div>
  );
};

const LastLoginCellRenderer = (params: ICellRendererParams<UserResponse>) => {
  const dateString = params.value;
  if (!dateString) return (
    <span className="text-gray-400 text-sm">Chưa đăng nhập</span>
  );

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
      <span className="text-sm text-gray-900">{formatDate(dateString)}</span>
    </div>
  );
};

const TenantCellRenderer = (params: ICellRendererParams<UserResponse>) => {
  const user = params.data;
  if (!user) return <span className="text-gray-400 text-sm">-</span>;

  const tenant = user.primaryTenant || (user.tenants && user.tenants.length > 0 ? user.tenants[0] : null);
  
  if (!tenant) {
    return <span className="text-gray-400 text-sm">Chưa gán</span>;
  }

  return (
    <div className="flex items-center gap-2 min-w-0">
      <Building2 className="h-4 w-4 text-gray-500 flex-shrink-0" />
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <span className="text-sm font-medium text-gray-900 truncate" title={tenant.tenantName}>
          {tenant.tenantName}
        </span>
        {tenant.isPrimary && (
          <Badge variant="secondary" className="bg-green-500 text-white text-[10px] px-1.5 py-0.5 flex-shrink-0">
            Chính
          </Badge>
        )}
      </div>
    </div>
  );
};

// Avatar component for cell renderer
const UserAvatar = ({ avatarUrl, fullName }: { avatarUrl?: string; fullName: string }) => {
  const [imageError, setImageError] = useState(false);
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  useEffect(() => {
    // Reset error state when avatarUrl changes
    setImageError(false);
  }, [avatarUrl]);

  return (
    <div className="flex items-center justify-center h-full">
      {avatarUrl && !imageError ? (
        <img
          src={avatarUrl}
          alt={fullName}
          className="h-10 w-10 rounded-full object-cover border-2 border-gray-200 shadow-sm"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold border-2 border-gray-200 shadow-sm">
          {initials}
        </div>
      )}
    </div>
  );
};

const AvatarCellRenderer = (params: ICellRendererParams<UserResponse>) => {
  const user = params.data;
  if (!user) return null;

  const avatarUrl = user.avatarUrl;
  const fullName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;

  return <UserAvatar avatarUrl={avatarUrl} fullName={fullName} />;
};

const IndexCellRenderer = (params: ICellRendererParams<UserResponse>) => {
  // Lấy API của grid để tính toán số thứ tự theo trang
  const api = params.api;
  const rowIndex = params.node.rowIndex ?? 0;
  
  // Tính số thứ tự: (trang hiện tại - 1) * số dòng mỗi trang + vị trí trong trang + 1
  let index = rowIndex + 1;
  
  if (api) {
    try {
      const currentPage = api.paginationGetCurrentPage() ?? 0;
      const pageSize = api.paginationGetPageSize() ?? 20;
      index = currentPage * pageSize + rowIndex + 1;
    } catch (error) {
      // Fallback về cách tính đơn giản nếu API không available
      index = rowIndex + 1;
    }
  }
  
  return (
    <div className="flex items-center justify-center h-full text-gray-700 font-semibold text-sm">
      {index}
    </div>
  );
};

const ActionsCellRenderer = (params: ICellRendererParams<UserResponse> & { onView?: (user: UserResponse) => void; onEdit?: (user: UserResponse) => void }) => {
  const user = params.data;
  const onView = params.onView || params.context?.onView;
  const onEdit = params.onEdit || params.context?.onEdit;

  if (!user) return null;

  const handleView = () => {
    if (onView) {
      onView(user);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(user);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 h-full">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 transition-colors"
        title="Xem chi tiết"
        onClick={handleView}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-green-50 hover:text-green-600 transition-colors"
        title="Chỉnh sửa"
        onClick={handleEdit}
      >
        <Edit className="h-4 w-4" />
      </Button>
    </div>
  );
};

export function UsersTable({ users, loading = false, onView, onEdit }: UsersTableProps) {
  const columnDefs: ColDef<UserResponse>[] = useMemo(
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
        headerName: 'ID',
        field: 'id',
        width: 80,
        minWidth: 80,
        cellStyle: { 
          fontWeight: '600',
          fontSize: '14px',
          color: '#374151',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 8px'
        },
        suppressSizeToFit: true,
      },
      {
        headerName: 'Avatar',
        field: 'avatarUrl',
        width: 90,
        minWidth: 90,
        cellRenderer: AvatarCellRenderer,
        sortable: false,
        filter: false,
        suppressSizeToFit: true,
        cellStyle: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px',
        },
        headerClass: 'ag-header-cell-custom',
        headerStyle: {
          backgroundColor: '#f9fafb',
        },
      },
      {
        headerName: 'Username',
        field: 'username',
        width: 150,
        minWidth: 150,
        filter: 'agTextColumnFilter',
        suppressSizeToFit: true,
        cellStyle: {
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '600',
          color: '#111827',
        },
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
        headerName: 'Họ và tên',
        field: 'fullName',
        width: 200,
        minWidth: 150,
        filter: 'agTextColumnFilter',
        suppressSizeToFit: true,
        cellStyle: {
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
          fontSize: '14px',
          color: '#111827',
          fontWeight: '500',
        },
      },
      {
        headerName: 'Điện thoại',
        field: 'phone',
        width: 150,
        minWidth: 120,
        cellRenderer: PhoneCellRenderer,
        suppressSizeToFit: true,
        cellStyle: {
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
        },
      },
      {
        headerName: 'Tenant',
        field: 'primaryTenant',
        width: 200,
        minWidth: 160,
        cellRenderer: TenantCellRenderer,
        filter: 'agTextColumnFilter',
        suppressSizeToFit: true,
        cellStyle: { 
          display: 'flex', 
          alignItems: 'center',
          padding: '12px 16px'
        },
      },
      {
        headerName: 'Trạng thái',
        field: 'isActive',
        width: 240,
        minWidth: 200,
        cellRenderer: StatusCellRenderer,
        filter: 'agSetColumnFilter',
        filterParams: {
          values: ['Hoạt động', 'Không hoạt động'],
        },
        suppressSizeToFit: true,
        cellStyle: { 
          display: 'flex', 
          alignItems: 'center',
          padding: '12px 16px'
        },
      },
      {
        headerName: 'Đăng nhập cuối',
        field: 'lastLoginAt',
        width: 180,
        minWidth: 150,
        cellRenderer: LastLoginCellRenderer,
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
        width: 120,
        minWidth: 120,
        pinned: 'right',
        lockPinned: true,
        cellRenderer: ActionsCellRenderer,
        cellRendererParams: {
          onView,
          onEdit,
        },
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
    [onView, onEdit]
  );

  // Calculate total width of all columns
  const totalWidth = useMemo(() => {
    return columnDefs.reduce((sum, col) => sum + (col.width || 0), 0);
  }, [columnDefs]);

  // Calculate dynamic height based on visible rows to avoid internal scrollbar
  const calculateHeight = () => {
    const headerHeight = 50; // Header row height
    const rowHeight = 60; // From gridOptions
    const paginationHeight = 60; // Pagination controls height
    const pageSize = 20;
    const visibleRows = Math.min(users.length, pageSize);
    
    // Calculate total height: header + rows + pagination
    const totalHeight = headerHeight + (rowHeight * visibleRows) + paginationHeight;
    
    // Return reasonable height bounds
    return Math.max(400, Math.min(totalHeight, 800));
  };

  const gridHeight = useMemo(() => calculateHeight(), [users.length]);

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
        onView,
        onEdit,
      },
      loading: loading,
      animateRows: true,
      rowHeight: 60,
    }),
    [loading, onView, onEdit]
  );

  return (
    <div 
      className="users-table-container w-full"
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
        <AgGridReact<UserResponse>
          rowData={users}
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
