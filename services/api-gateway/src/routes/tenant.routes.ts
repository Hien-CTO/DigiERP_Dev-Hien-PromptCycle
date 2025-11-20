import { Router } from 'express';
import axios from 'axios';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireAnyPermission, PERMISSIONS } from '../middleware/rbac.middleware';

const router = Router();
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';

// Helper function to forward requests
const forwardRequest = async (req: any, res: any, path: string, method: string = 'GET') => {
  try {
    // Build URL with query params if exists
    let url = `${USER_SERVICE_URL}/api/v1${path}`;
    if (req.query && Object.keys(req.query).length > 0 && method.toUpperCase() === 'GET') {
      const queryParams = new URLSearchParams(req.query as any).toString();
      url += `?${queryParams}`;
    }
    
    const config: any = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization,
      },
      timeout: 30000,
    };

    if (req.user) {
      config.headers['X-User-ID'] = req.user.id;
      config.headers['X-User-Email'] = req.user.email;
      config.headers['X-User-Roles'] = JSON.stringify(req.user.roles || []);
      config.headers['X-User-Permissions'] = JSON.stringify(req.user.permissions || []);
      if (req.user.tenantId) {
        config.headers['X-Tenant-ID'] = req.user.tenantId;
      }
    }

    if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      config.data = req.body;
    }

    console.log(`🔍 Proxying to user-service: ${method} ${path}`);
    const response = await axios(config);
    
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error(`Tenant service proxy error for ${path}:`, error.message);
    if (error.code === 'ECONNABORTED') {
      res.status(408).json({
        success: false,
        error: 'Request timeout',
        message: 'Request timed out',
        timestamp: new Date(),
      });
    } else if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(503).json({
        success: false,
        error: 'Service unavailable',
        message: 'Unable to connect to user service',
        timestamp: new Date(),
      });
    }
  }
};

/**
 * @route   GET /api/tenants
 * @desc    Get all tenants
 * @access  Private - tenant:read permission required
 */
router.get(
  '/',
  authMiddleware,
  // requireAnyPermission([PERMISSIONS.TENANT_READ, PERMISSIONS.TENANT_ADMIN]),
  (req, res) => {
    forwardRequest(req, res, '/tenants', 'GET');
  }
);

/**
 * @route   POST /api/tenants
 * @desc    Create a new tenant
 * @access  Private - tenant:create permission required
 */
router.post(
  '/',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.TENANT_CREATE, PERMISSIONS.TENANT_ADMIN]),
  (req, res) => {
    forwardRequest(req, res, '/tenants', 'POST');
  }
);

/**
 * @route   POST /api/tenants/assign-roles
 * @desc    Assign one or multiple roles to tenant (tenantId and roleIds in body)
 * @access  Private - tenant:update permission required
 * @note    Must be placed before /:id routes to avoid route conflict
 */
router.post(
  '/assign-roles',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.TENANT_UPDATE, PERMISSIONS.TENANT_ADMIN]),
  (req, res) => {
    forwardRequest(req, res, '/tenants/assign-roles', 'POST');
  }
);

/**
 * @route   GET /api/tenants/:id
 * @desc    Get tenant by ID
 * @access  Private - tenant:read permission required
 */
router.get(
  '/:id',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.TENANT_READ, PERMISSIONS.TENANT_ADMIN]),
  (req, res) => {
    forwardRequest(req, res, `/tenants/${req.params.id}`, 'GET');
  }
);

/**
 * @route   PUT /api/tenants/:id
 * @desc    Update tenant
 * @access  Private - tenant:update permission required
 */
router.put(
  '/:id',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.TENANT_UPDATE, PERMISSIONS.TENANT_ADMIN]),
  (req, res) => {
    forwardRequest(req, res, `/tenants/${req.params.id}`, 'PUT');
  }
);

/**
 * @route   DELETE /api/tenants/:id
 * @desc    Delete tenant
 * @access  Private - tenant:delete permission required
 */
router.delete(
  '/:id',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.TENANT_DELETE, PERMISSIONS.TENANT_ADMIN]),
  (req, res) => {
    forwardRequest(req, res, `/tenants/${req.params.id}`, 'DELETE');
  }
);

/**
 * @route   GET /api/tenants/:id/users
 * @desc    Get all users in a tenant
 * @access  Private - tenant:read permission required
 */
router.get(
  '/:id/users',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.TENANT_READ, PERMISSIONS.TENANT_ADMIN]),
  (req, res) => {
    forwardRequest(req, res, `/tenants/${req.params.id}/users`, 'GET');
  }
);

/**
 * @route   POST /api/tenants/:id/assign-user
 * @desc    Assign user to tenant with roles (tenantId from URL, userId and roleId from body)
 * @access  Private - tenant:update permission required
 */
router.post(
  '/:id/assign-user',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.TENANT_UPDATE, PERMISSIONS.TENANT_ADMIN]),
  (req, res) => {
    forwardRequest(req, res, `/tenants/${req.params.id}/assign-user`, 'POST');
  }
);

/**
 * @route   PUT /api/tenants/:id/users/:userId/role
 * @desc    Update user role in tenant
 * @access  Private - tenant:update permission required
 */
router.put(
  '/:id/users/:userId/role',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.TENANT_UPDATE, PERMISSIONS.TENANT_ADMIN]),
  (req, res) => {
    forwardRequest(req, res, `/tenants/${req.params.id}/users/${req.params.userId}/role`, 'PUT');
  }
);

/**
 * @route   PUT /api/tenants/:id/users/:userId/primary
 * @desc    Set tenant as primary for user
 * @access  Private - tenant:update permission required
 */
router.put(
  '/:id/users/:userId/primary',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.TENANT_UPDATE, PERMISSIONS.TENANT_ADMIN]),
  (req, res) => {
    forwardRequest(req, res, `/tenants/${req.params.id}/users/${req.params.userId}/primary`, 'PUT');
  }
);

/**
 * @route   DELETE /api/tenants/:id/users/:userId
 * @desc    Remove user from tenant
 * @access  Private - tenant:update permission required
 */
router.delete(
  '/:id/users/:userId',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.TENANT_UPDATE, PERMISSIONS.TENANT_ADMIN]),
  (req, res) => {
    forwardRequest(req, res, `/tenants/${req.params.id}/users/${req.params.userId}`, 'DELETE');
  }
);

/**
 * @route   GET /api/tenants/:id/roles
 * @desc    Get all roles for a tenant
 * @access  Private - tenant:read permission required
 */
router.get(
  '/:id/roles',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.TENANT_READ, PERMISSIONS.TENANT_ADMIN]),
  (req, res) => {
    forwardRequest(req, res, `/tenants/${req.params.id}/roles`, 'GET');
  }
);

/**
 * @route   POST /api/tenants/:id/assign-roles
 * @desc    Assign one or multiple roles to tenant
 * @access  Private - tenant:update permission required
 */
router.post(
  '/assign-roles',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.TENANT_UPDATE, PERMISSIONS.TENANT_ADMIN]),
  (req, res) => {
    forwardRequest(req, res, `/tenants/assign-roles`, 'POST');
  }
);

/**
 * @route   POST /api/tenants/:id/initialize-roles-permissions
 * @desc    Re-initialize roles and permissions for a tenant (sync from code to database)
 * @access  Private - tenant:admin permission required
 */
router.post(
  '/:id/initialize-roles-permissions',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.TENANT_ADMIN]),
  (req, res) => {
    forwardRequest(req, res, `/tenants/${req.params.id}/initialize-roles-permissions`, 'POST');
  }
);

/**
 * @route   GET /api/tenants/:id/permissions
 * @desc    Get all permissions for a tenant
 * @access  Private - tenant:read permission required
 */
router.get(
  '/:id/permissions',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.TENANT_READ, PERMISSIONS.TENANT_ADMIN]),
  (req, res) => {
    forwardRequest(req, res, `/tenants/${req.params.id}/permissions`, 'GET');
  }
);

/**
 * @route   POST /api/tenants/:id/permissions
 * @desc    Create a new permission for tenant
 * @access  Private - tenant:update permission required
 */
router.post(
  '/:id/permissions',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.TENANT_UPDATE, PERMISSIONS.TENANT_ADMIN]),
  (req, res) => {
    forwardRequest(req, res, `/tenants/${req.params.id}/permissions`, 'POST');
  }
);

export default router;

