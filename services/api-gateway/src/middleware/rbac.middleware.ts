import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';

export interface Permission {
  resource: string;
  action: string;
}

export interface Role {
  name: string;
  permissions: Permission[];
}

// Define all permissions in the system
export const PERMISSIONS = {
  // User Management
  USER_CREATE: { resource: 'user', action: 'create' },
  USER_READ: { resource: 'user', action: 'read' },
  USER_UPDATE: { resource: 'user', action: 'update' },
  USER_DELETE: { resource: 'user', action: 'delete' },
  
  // Role Management
  ROLE_CREATE: { resource: 'role', action: 'create' },
  ROLE_READ: { resource: 'role', action: 'read' },
  ROLE_UPDATE: { resource: 'role', action: 'update' },
  ROLE_DELETE: { resource: 'role', action: 'delete' },
  
  // Permission Management
  PERMISSION_CREATE: { resource: 'permission', action: 'create' },
  PERMISSION_READ: { resource: 'permission', action: 'read' },
  PERMISSION_UPDATE: { resource: 'permission', action: 'update' },
  PERMISSION_DELETE: { resource: 'permission', action: 'delete' },
  
  // Product Management
  PRODUCT_CREATE: { resource: 'product', action: 'create' },
  PRODUCT_READ: { resource: 'product', action: 'read' },
  PRODUCT_UPDATE: { resource: 'product', action: 'update' },
  PRODUCT_DELETE: { resource: 'product', action: 'delete' },
  
  // Sales Management
  ORDER_CREATE: { resource: 'order', action: 'create' },
  ORDER_READ: { resource: 'order', action: 'read' },
  ORDER_UPDATE: { resource: 'order', action: 'update' },
  ORDER_DELETE: { resource: 'order', action: 'delete' },
  
  // Inventory Management
  INVENTORY_READ: { resource: 'inventory', action: 'read' },
  INVENTORY_UPDATE: { resource: 'inventory', action: 'update' },
  WAREHOUSE_CREATE: { resource: 'warehouse', action: 'create' },
  WAREHOUSE_READ: { resource: 'warehouse', action: 'read' },
  WAREHOUSE_UPDATE: { resource: 'warehouse', action: 'update' },
  WAREHOUSE_DELETE: { resource: 'warehouse', action: 'delete' },
  GOODS_RECEIPT_CREATE: { resource: 'goods_receipt', action: 'create' },
  GOODS_RECEIPT_READ: { resource: 'goods_receipt', action: 'read' },
  GOODS_RECEIPT_UPDATE: { resource: 'goods_receipt', action: 'update' },
  GOODS_RECEIPT_DELETE: { resource: 'goods_receipt', action: 'delete' },
  GOODS_ISSUE_CREATE: { resource: 'goods_issue', action: 'create' },
  GOODS_ISSUE_READ: { resource: 'goods_issue', action: 'read' },
  GOODS_ISSUE_UPDATE: { resource: 'goods_issue', action: 'update' },
  GOODS_ISSUE_DELETE: { resource: 'goods_issue', action: 'delete' },
  
  // Purchase Management
  SUPPLIER_CREATE: { resource: 'supplier', action: 'create' },
  SUPPLIER_READ: { resource: 'supplier', action: 'read' },
  SUPPLIER_UPDATE: { resource: 'supplier', action: 'update' },
  SUPPLIER_DELETE: { resource: 'supplier', action: 'delete' },
  PURCHASE_ORDER_CREATE: { resource: 'purchase_order', action: 'create' },
  PURCHASE_ORDER_READ: { resource: 'purchase_order', action: 'read' },
  PURCHASE_ORDER_UPDATE: { resource: 'purchase_order', action: 'update' },
  PURCHASE_ORDER_DELETE: { resource: 'purchase_order', action: 'delete' },
  
  // Financial Management
  INVOICE_CREATE: { resource: 'invoice', action: 'create' },
  INVOICE_READ: { resource: 'invoice', action: 'read' },
  INVOICE_UPDATE: { resource: 'invoice', action: 'update' },
  INVOICE_DELETE: { resource: 'invoice', action: 'delete' },
  PAYMENT_RECORD: { resource: 'payment', action: 'record' },
  
  // Customer Management
  CUSTOMER_CREATE: { resource: 'customer', action: 'create' },
  CUSTOMER_READ: { resource: 'customer', action: 'read' },
  CUSTOMER_UPDATE: { resource: 'customer', action: 'update' },
  CUSTOMER_DELETE: { resource: 'customer', action: 'delete' },
  
  // Reports
  REPORT_SALES: { resource: 'report', action: 'sales' },
  REPORT_INVENTORY: { resource: 'report', action: 'inventory' },
  REPORT_FINANCIAL: { resource: 'report', action: 'financial' },
  
  // Tenant Management
  TENANT_CREATE: { resource: 'tenant', action: 'create' },
  TENANT_READ: { resource: 'tenant', action: 'read' },
  TENANT_UPDATE: { resource: 'tenant', action: 'update' },
  TENANT_DELETE: { resource: 'tenant', action: 'delete' },
  TENANT_ADMIN: { resource: 'tenant', action: 'admin' },
  
  // System Administration
  SYSTEM_ADMIN: { resource: 'system', action: 'admin' },
} as const;

// Define roles with their permissions
export const ROLES: Record<string, Role> = {
  SUPER_ADMIN: {
    name: 'SUPER_ADMIN',
    permissions: Object.values(PERMISSIONS),
  },
  ADMIN: {
    name: 'ADMIN',
    permissions: [
      PERMISSIONS.USER_CREATE,
      PERMISSIONS.USER_READ,
      PERMISSIONS.USER_UPDATE,
      PERMISSIONS.PRODUCT_CREATE,
      PERMISSIONS.PRODUCT_READ,
      PERMISSIONS.PRODUCT_UPDATE,
      PERMISSIONS.PRODUCT_DELETE,
      PERMISSIONS.ORDER_CREATE,
      PERMISSIONS.ORDER_READ,
      PERMISSIONS.ORDER_UPDATE,
      PERMISSIONS.ORDER_DELETE,
      PERMISSIONS.INVENTORY_READ,
      PERMISSIONS.INVENTORY_UPDATE,
      PERMISSIONS.WAREHOUSE_CREATE,
      PERMISSIONS.WAREHOUSE_READ,
      PERMISSIONS.WAREHOUSE_UPDATE,
      PERMISSIONS.WAREHOUSE_DELETE,
      PERMISSIONS.GOODS_RECEIPT_CREATE,
      PERMISSIONS.GOODS_RECEIPT_READ,
      PERMISSIONS.GOODS_RECEIPT_UPDATE,
      PERMISSIONS.GOODS_RECEIPT_DELETE,
      PERMISSIONS.GOODS_ISSUE_CREATE,
      PERMISSIONS.GOODS_ISSUE_READ,
      PERMISSIONS.GOODS_ISSUE_UPDATE,
      PERMISSIONS.GOODS_ISSUE_DELETE,
      PERMISSIONS.SUPPLIER_CREATE,
      PERMISSIONS.SUPPLIER_READ,
      PERMISSIONS.SUPPLIER_UPDATE,
      PERMISSIONS.SUPPLIER_DELETE,
      PERMISSIONS.PURCHASE_ORDER_CREATE,
      PERMISSIONS.PURCHASE_ORDER_READ,
      PERMISSIONS.PURCHASE_ORDER_UPDATE,
      PERMISSIONS.PURCHASE_ORDER_DELETE,
      PERMISSIONS.INVOICE_CREATE,
      PERMISSIONS.INVOICE_READ,
      PERMISSIONS.INVOICE_UPDATE,
      PERMISSIONS.INVOICE_DELETE,
      PERMISSIONS.PAYMENT_RECORD,
      PERMISSIONS.CUSTOMER_CREATE,
      PERMISSIONS.CUSTOMER_READ,
      PERMISSIONS.CUSTOMER_UPDATE,
      PERMISSIONS.CUSTOMER_DELETE,
      PERMISSIONS.REPORT_SALES,
      PERMISSIONS.REPORT_INVENTORY,
      PERMISSIONS.REPORT_FINANCIAL,
      PERMISSIONS.TENANT_CREATE,
      PERMISSIONS.TENANT_READ,
      PERMISSIONS.ROLE_READ,
      PERMISSIONS.PERMISSION_READ,
    ],
  },
  MANAGER: {
    name: 'MANAGER',
    permissions: [
      PERMISSIONS.USER_READ,
      PERMISSIONS.PRODUCT_READ,
      PERMISSIONS.ORDER_CREATE,
      PERMISSIONS.ORDER_READ,
      PERMISSIONS.ORDER_UPDATE,
      PERMISSIONS.INVENTORY_READ,
      PERMISSIONS.INVENTORY_UPDATE,
      PERMISSIONS.WAREHOUSE_READ,
      PERMISSIONS.GOODS_RECEIPT_READ,
      PERMISSIONS.GOODS_ISSUE_READ,
      PERMISSIONS.SUPPLIER_READ,
      PERMISSIONS.PURCHASE_ORDER_READ,
      PERMISSIONS.INVOICE_READ,
      PERMISSIONS.CUSTOMER_READ,
      PERMISSIONS.CUSTOMER_UPDATE,
      PERMISSIONS.REPORT_SALES,
      PERMISSIONS.REPORT_INVENTORY,
    ],
  },
  SALES_STAFF: {
    name: 'SALES_STAFF',
    permissions: [
      PERMISSIONS.USER_READ,
      PERMISSIONS.PRODUCT_READ,
      PERMISSIONS.ORDER_CREATE,
      PERMISSIONS.ORDER_READ,
      PERMISSIONS.ORDER_UPDATE,
      PERMISSIONS.INVENTORY_READ,
      PERMISSIONS.INVOICE_READ,
      PERMISSIONS.CUSTOMER_CREATE,
      PERMISSIONS.CUSTOMER_READ,
      PERMISSIONS.CUSTOMER_UPDATE,
      PERMISSIONS.REPORT_SALES,
    ],
  },
  WAREHOUSE_STAFF: {
    name: 'WAREHOUSE_STAFF',
    permissions: [
      PERMISSIONS.PRODUCT_READ,
      PERMISSIONS.INVENTORY_READ,
      PERMISSIONS.INVENTORY_UPDATE,
      PERMISSIONS.WAREHOUSE_READ,
      PERMISSIONS.GOODS_RECEIPT_CREATE,
      PERMISSIONS.GOODS_RECEIPT_READ,
      PERMISSIONS.GOODS_RECEIPT_UPDATE,
      PERMISSIONS.GOODS_ISSUE_CREATE,
      PERMISSIONS.GOODS_ISSUE_READ,
      PERMISSIONS.GOODS_ISSUE_UPDATE,
      PERMISSIONS.REPORT_INVENTORY,
    ],
  },
  PURCHASE_STAFF: {
    name: 'PURCHASE_STAFF',
    permissions: [
      PERMISSIONS.PRODUCT_READ,
      PERMISSIONS.SUPPLIER_CREATE,
      PERMISSIONS.SUPPLIER_READ,
      PERMISSIONS.SUPPLIER_UPDATE,
      PERMISSIONS.PURCHASE_ORDER_CREATE,
      PERMISSIONS.PURCHASE_ORDER_READ,
      PERMISSIONS.PURCHASE_ORDER_UPDATE,
      PERMISSIONS.INVENTORY_READ,
    ],
  },
  ACCOUNTANT: {
    name: 'ACCOUNTANT',
    permissions: [
      PERMISSIONS.ORDER_READ,
      PERMISSIONS.INVOICE_CREATE,
      PERMISSIONS.INVOICE_READ,
      PERMISSIONS.INVOICE_UPDATE,
      PERMISSIONS.PAYMENT_RECORD,
      PERMISSIONS.REPORT_FINANCIAL,
    ],
  },
  VIEWER: {
    name: 'VIEWER',
    permissions: [
      PERMISSIONS.USER_READ,
      PERMISSIONS.PRODUCT_READ,
      PERMISSIONS.ORDER_READ,
      PERMISSIONS.INVENTORY_READ,
      PERMISSIONS.WAREHOUSE_READ,
      PERMISSIONS.SUPPLIER_READ,
      PERMISSIONS.PURCHASE_ORDER_READ,
      PERMISSIONS.INVOICE_READ,
      PERMISSIONS.REPORT_SALES,
      PERMISSIONS.REPORT_INVENTORY,
      PERMISSIONS.REPORT_FINANCIAL,
    ],
  },
};

// Helper function to check if user has permission
export const hasPermission = (userPermissions: string[], requiredPermission: Permission): boolean => {
  if (!userPermissions || userPermissions.length === 0) return false;
  
  const permissionString = `${requiredPermission.resource}:${requiredPermission.action}`;
  
  // Check exact match
  if (userPermissions.includes(permissionString)) return true;
  
  // Check wildcard permissions (e.g., "user:*" matches "user:read")
  const wildcardPermission = `${requiredPermission.resource}:*`;
  if (userPermissions.includes(wildcardPermission)) return true;
  
  // Check admin/super admin permissions
  if (userPermissions.includes('*:*') || userPermissions.includes('system:admin') || userPermissions.includes('admin:*')) {
    return true;
  }
  
  return false;
};

// Helper function to check if user has role
export const hasRole = (userRoles: string[], requiredRole: string): boolean => {
  return userRoles.includes(requiredRole) || userRoles.includes('SUPER_ADMIN');
};

// RBAC middleware factory
export const requirePermission = (permission: Permission) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required',
        timestamp: new Date(),
      });
      return;
    }

    if (!hasPermission(req.user.permissions, permission)) {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Insufficient permissions. Required: ${permission.resource}:${permission.action}`,
        timestamp: new Date(),
      });
      return;
    }

    next();
  };
};

// RBAC middleware factory for roles
export const requireRole = (role: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required',
        timestamp: new Date(),
      });
      return;
    }

    if (!hasRole(req.user.roles, role)) {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Insufficient role. Required: ${role}`,
        timestamp: new Date(),
      });
      return;
    }

    next();
  };
};

// Multiple permissions middleware
export const requireAnyPermission = (permissions: Permission[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required',
        timestamp: new Date(),
      });
      return;
    }

    const hasAnyPermission = permissions.some(permission => hasPermission(req.user!.permissions, permission));
    
    if (!hasAnyPermission) {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Insufficient permissions. Required one of: ${permissions.map(p => `${p.resource}:${p.action}`).join(', ')}`,
        timestamp: new Date(),
      });
      return;
    }

    next();
  };
};

// Multiple roles middleware
export const requireAnyRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required',
        timestamp: new Date(),
      });
      return;
    }

    const hasAnyRole = roles.some(role => hasRole(req.user!.roles, role));
    
    if (!hasAnyRole) {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Insufficient role. Required one of: ${roles.join(', ')}`,
        timestamp: new Date(),
      });
      return;
    }

    next();
  };
};
