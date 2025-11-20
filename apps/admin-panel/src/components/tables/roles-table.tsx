'use client';

import { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ICellRendererParams, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { Edit, Trash2, Shield, Key, Calendar, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RoleResponse } from '@/types/role';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface RolesTableProps {
  roles: RoleResponse[];
  loading?: boolean;
  onEdit?: (role: RoleResponse) => void;
  onDelete?: (role: RoleResponse) => void;
  onView?: (role: RoleResponse) => void;
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

const RoleCellRenderer = (params: ICellRendererParams<RoleResponse>) => {
  const role = params.data;
  if (!role) return null;

  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
        {role.isSystemRole ? (
          <Shield className="h-5 w-5 text-blue-600" />
        ) : (
          <Key className="h-5 w-5 text-blue-600" />
        )}
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-semibold text-gray-900 truncate" title={role.displayName}>
          {role.displayName}
        </span>
        <span className="text-xs text-gray-500 truncate" title={role.name}>
          {role.name}
        </span>
      </div>
    </div>
  );
};

const DescriptionCellRenderer = (params: ICellRendererParams<RoleResponse>) => {
  const description = params.value;
  if (!description) return <span className="text-gray-400 text-sm">Không có mô tả</span>;

  return (
    <span className="text-sm text-gray-600 truncate max-w-xs" title={description}>
      {description}
    </span>
  );
};

const TypeCellRenderer = (params: ICellRendererParams<RoleResponse>) => {
  const role = params.data;
  if (!role) return null;

  return (
    <Badge
      className={`text-xs px-2 py-1 ${
        role.isSystemRole
          ? 'bg-blue-100 text-blue-800'
          : 'bg-gray-100 text-gray-800'
      }`}
    >
      {role.isSystemRole ? 'Hệ thống' : 'Tùy chỉnh'}
    </Badge>
  );
};

const StatusCellRenderer = (params: ICellRendererParams<RoleResponse>) => {
  const role = params.data;
  if (!role) return null;

  return (
    <Badge
      className={`text-xs px-2 py-1 ${
        role.isActive
          ? 'bg-green-500 text-white'
          : 'bg-gray-300 text-gray-700'
      }`}
    >
      {role.isActive ? (
        <>
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Hoạt động
        </>
      ) : (
        <>
          <XCircle className="mr-1 h-3 w-3" />
          Không hoạt động
        </>
      )}
    </Badge>
  );
};

const DateCellRenderer = (params: ICellRendererParams<RoleResponse>) => {
  const dateString = params.value;
  if (!dateString) return <span className="text-gray-400 text-sm">-</span>;

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
      <span className="text-sm text-gray-900">{formatDate(dateString)}</span>
    </div>
  );
};

const IndexCellRenderer = (params: ICellRendererParams<RoleResponse>) => {
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

const ActionsCellRenderer = (params: ICellRendererParams<RoleResponse>) => {
  const role = params.data;
  const onEdit = params.context?.onEdit;
  const onDelete = params.context?.onDelete;
  const onView = params.context?.onView;

  if (!role) return null;

  return (
    <div className="flex items-center justify-center gap-2 h-full">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 transition-colors"
        title="Xem chi tiết"
        onClick={() => onView?.(role)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-green-50 hover:text-green-600 transition-colors"
        title="Chỉnh sửa"
        onClick={() => onEdit?.(role)}
        disabled={role.isSystemRole}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-red-50 hover:text-red-600 transition-colors"
        title="Xóa"
        onClick={() => onDelete?.(role)}
        disabled={role.isSystemRole}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export function RolesTable({ roles, loading = false, onEdit, onDelete, onView }: RolesTableProps) {
  const columnDefs: ColDef<RoleResponse>[] = useMemo(
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
        headerName: 'Role',
        field: 'displayName',
        width: 250,
        minWidth: 200,
        cellRenderer: RoleCellRenderer,
        filter: 'agTextColumnFilter',
        suppressSizeToFit: true,
        cellStyle: {
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
        },
      },
      {
        headerName: 'Mô tả',
        field: 'description',
        width: 300,
        minWidth: 200,
        cellRenderer: DescriptionCellRenderer,
        filter: 'agTextColumnFilter',
        suppressSizeToFit: true,
        cellStyle: {
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
        },
      },
      {
        headerName: 'Loại',
        field: 'isSystemRole',
        width: 150,
        minWidth: 120,
        cellRenderer: TypeCellRenderer,
        filter: 'agSetColumnFilter',
        filterParams: {
          values: ['Hệ thống', 'Tùy chỉnh'],
        },
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
        width: 180,
        minWidth: 150,
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

  // Calculate dynamic height based on visible rows to avoid internal scrollbar
  const calculateHeight = () => {
    const headerHeight = 50;
    const rowHeight = 60;
    const paginationHeight = 60;
    const pageSize = 20;
    const visibleRows = Math.min(roles.length, pageSize);
    
    const totalHeight = headerHeight + (rowHeight * visibleRows) + paginationHeight;
    
    return Math.max(400, Math.min(totalHeight, 800));
  };

  const gridHeight = useMemo(() => calculateHeight(), [roles.length]);

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
      className="roles-table-container w-full"
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
        <AgGridReact<RoleResponse>
          rowData={roles}
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

