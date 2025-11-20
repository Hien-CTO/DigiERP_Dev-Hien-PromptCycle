/**
 * Permission utilities for checking user permissions
 */

/**
 * Check if user has a specific permission
 * @param permissions - Array of user permissions
 * @param requiredPermission - Required permission string (e.g., "product:read", "user:read")
 * @returns boolean
 */
export function hasPermission(permissions: string[], requiredPermission: string): boolean {
  if (!permissions || permissions.length === 0) return false;
  
  // Check exact match
  if (permissions.includes(requiredPermission)) return true;
  
  // Check wildcard permissions (e.g., "product:*" matches "product:read")
  const [resource] = requiredPermission.split(':');
  const wildcardPermission = `${resource}:*`;
  if (permissions.includes(wildcardPermission)) return true;
  
  // Check admin/super admin permissions
  if (permissions.includes('*:*') || permissions.includes('admin:*')) return true;
  
  // Fallback: check plural/singular variations for backward compatibility
  // Backend uses singular (user, product) but some places might use plural (users, products)
  const [resourcePart, actionPart] = requiredPermission.split(':');
  
  // If requiredPermission is singular (user:read), also check plural form (users:read) in permissions
  if (!resourcePart.endsWith('s')) {
    const pluralResource = `${resourcePart}s`;
    const pluralPermission = `${pluralResource}:${actionPart}`;
    if (permissions.includes(pluralPermission)) return true;
  } else {
    // If requiredPermission is plural (users:read), also check singular form (user:read) in permissions
    const singularResource = resourcePart.slice(0, -1);
    const singularPermission = `${singularResource}:${actionPart}`;
    if (permissions.includes(singularPermission)) return true;
  }
  
  return false;
}

/**
 * Check if user has any of the required permissions
 * @param permissions - Array of user permissions
 * @param requiredPermissions - Array of required permission strings
 * @returns boolean
 */
export function hasAnyPermission(permissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.some(permission => hasPermission(permissions, permission));
}

/**
 * Check if user has all of the required permissions
 * @param permissions - Array of user permissions
 * @param requiredPermissions - Array of required permission strings
 * @returns boolean
 */
export function hasAllPermissions(permissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.every(permission => hasPermission(permissions, permission));
}

/**
 * Map navigation items to required permissions
 * Format: "resource:action" (e.g., "product:read", "user:read")
 * Note: Backend uses singular form (user, not users)
 */
export const NAVIGATION_PERMISSIONS: Record<string, string | string[]> = {
  '/admin': [], // Home - no permission required
  '/dashboard': ['dashboard:read'],
  '/admin/products': 'product:read',
  '/admin/sales/orders': 'order:read',
  '/admin/sales/customers': 'customer:read',
  '/admin/purchase/requests': 'purchase_request:read',
  '/admin/purchase/orders': 'purchase:read',
  '/admin/purchase/suppliers': 'supplier:read',
  '/admin/inventory/stock': 'inventory:read',
  '/admin/inventory/goods-receipt': 'goods_receipt:read',
  '/admin/inventory/warehouses': 'warehouse:read',
  '/admin/financial/invoices': 'invoice:read',
  '/admin/users': 'user:read',
  '/admin/roles': 'role:read',
  '/admin/hr/employees': 'hr.employees.read',
  '/admin/hr/departments': 'hr.departments.read',
  '/admin/hr/positions': 'hr.positions.read',
  '/admin/hr/attendance': 'hr.attendance.read',
  '/admin/hr/leave': 'hr.leave.read',
  '/admin/system/catalog': ['tenant:read', 'role:read', 'permission:read'],
  '/admin/settings': 'settings:read',
};

/**
 * Check if user can access a navigation item
 * @param permissions - Array of user permissions
 * @param href - Navigation item href
 * @returns boolean
 */
export function canAccessNavigation(permissions: string[], href: string): boolean {
  const requiredPermission = NAVIGATION_PERMISSIONS[href];
  
  // No permission required
  if (!requiredPermission || (Array.isArray(requiredPermission) && requiredPermission.length === 0)) {
    return true;
  }
  
  // Single permission required
  if (typeof requiredPermission === 'string') {
    const hasAccess = hasPermission(permissions, requiredPermission);
    if (!hasAccess) {
      console.log(`🚫 No access to ${href}. Required: ${requiredPermission}, User has:`, permissions);
      
      // Special fallback: purchase_request:read can also use purchase:read
      if (requiredPermission === 'purchase_request:read') {
        const hasPurchaseRead = hasPermission(permissions, 'purchase:read');
        if (hasPurchaseRead) {
          console.log(`✅ Access granted to ${href} with fallback permission: purchase:read`);
          return true;
        }
      }
      
      // Debug: Check if user has similar permissions
      const [resource, action] = requiredPermission.split(':');
      const similarPermissions = permissions.filter(p => 
        p.includes(resource) || p.includes(action)
      );
      if (similarPermissions.length > 0) {
        console.log(`💡 Similar permissions found:`, similarPermissions);
      }
    } else {
      console.log(`✅ Access granted to ${href} with permission: ${requiredPermission}`);
    }
    return hasAccess;
  }
  
  // Multiple permissions required (OR logic)
  if (Array.isArray(requiredPermission)) {
    const hasAccess = hasAnyPermission(permissions, requiredPermission);
    if (!hasAccess) {
      console.log(`🚫 No access to ${href}. Required: ${requiredPermission.join(' OR ')}, User has:`, permissions);
    } else {
      const matchedPermission = requiredPermission.find(p => hasPermission(permissions, p));
      console.log(`✅ Access granted to ${href} with permission: ${matchedPermission}`);
    }
    return hasAccess;
  }
  
  return false;
}

