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
    console.error(`Permission service proxy error for ${path}:`, error.message);
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
        message: 'Permission service is currently unavailable',
        timestamp: new Date(),
      });
    }
  }
};

/**
 * @swagger
 * /api/permissions:
 *   post:
 *     summary: Create a new permission
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Permission created successfully
 */
router.post('/',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.PERMISSION_CREATE]),
  async (req, res) => {
    await forwardRequest(req, res, '/permissions', 'POST');
  }
);

/**
 * @swagger
 * /api/permissions:
 *   get:
 *     summary: Get all permissions
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permissions retrieved successfully
 */
router.get('/',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.PERMISSION_READ]),
  async (req, res) => {
    await forwardRequest(req, res, '/permissions', 'GET');
  }
);

/**
 * @swagger
 * /api/permissions/roles/{id}/assign:
 *   post:
 *     summary: Assign permissions to role
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Permissions assigned successfully
 */
router.post('/roles/:id/assign',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.ROLE_UPDATE]),
  async (req, res) => {
    await forwardRequest(req, res, `/permissions/roles/${req.params.id}/assign`, 'POST');
  }
);

/**
 * @swagger
 * /api/permissions/users/{id}/assign-roles:
 *   post:
 *     summary: Assign roles to user
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Roles assigned successfully
 */
router.post('/users/:id/assign-roles',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.USER_UPDATE]),
  async (req, res) => {
    await forwardRequest(req, res, `/permissions/users/${req.params.id}/assign-roles`, 'POST');
  }
);

/**
 * @swagger
 * /api/permissions/{id}:
 *   get:
 *     summary: Get permission by ID
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Permission retrieved successfully
 */
router.get('/:id',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.PERMISSION_READ]),
  async (req, res) => {
    await forwardRequest(req, res, `/permissions/${req.params.id}`, 'GET');
  }
);

/**
 * @swagger
 * /api/permissions/{id}:
 *   put:
 *     summary: Update permission
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Permission updated successfully
 */
router.put('/:id',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.PERMISSION_UPDATE]),
  async (req, res) => {
    await forwardRequest(req, res, `/permissions/${req.params.id}`, 'PUT');
  }
);

/**
 * @swagger
 * /api/permissions/{id}:
 *   delete:
 *     summary: Delete permission
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Permission deleted successfully
 */
router.delete('/:id',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.PERMISSION_DELETE]),
  async (req, res) => {
    await forwardRequest(req, res, `/permissions/${req.params.id}`, 'DELETE');
  }
);

export default router;
