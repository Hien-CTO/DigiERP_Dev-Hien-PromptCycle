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
    console.error(`Role service proxy error for ${path}:`, error.message);
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
        message: 'Role service is currently unavailable',
        timestamp: new Date(),
      });
    }
  }
};

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Role created successfully
 */
router.post('/',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.ROLE_CREATE]),
  async (req, res) => {
    await forwardRequest(req, res, '/roles', 'POST');
  }
);

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Roles retrieved successfully
 */
router.get('/',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.ROLE_READ]), 
  async (req, res) => {
    await forwardRequest(req, res, '/roles', 'GET');
  }
);

/**
 * @swagger
 * /api/roles/{id}/permissions:
 *   get:
 *     summary: Get role permissions
 *     tags: [Roles]
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
 *         description: Role permissions retrieved successfully
 */
router.get('/:id/permissions',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.ROLE_READ]),
  async (req, res) => {
    await forwardRequest(req, res, `/roles/${req.params.id}/permissions`, 'GET');
  }
);

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: Get role by ID
 *     tags: [Roles]
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
 *         description: Role retrieved successfully
 */
router.get('/:id',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.ROLE_READ]),
  async (req, res) => {
    await forwardRequest(req, res, `/roles/${req.params.id}`, 'GET');
  }
);

/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     summary: Update role
 *     tags: [Roles]
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
 *         description: Role updated successfully
 */
router.put('/:id',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.ROLE_UPDATE]),
  async (req, res) => {
    await forwardRequest(req, res, `/roles/${req.params.id}`, 'PUT');
  }
);

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     summary: Delete role
 *     tags: [Roles]
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
 *         description: Role deleted successfully
 */
router.delete('/:id',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.ROLE_DELETE]),
  async (req, res) => {
    await forwardRequest(req, res, `/roles/${req.params.id}`, 'DELETE');
  }
);

export default router;
