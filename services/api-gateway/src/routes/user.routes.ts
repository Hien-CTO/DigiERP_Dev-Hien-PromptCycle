import { Router } from 'express';
import axios from 'axios';
import FormData from 'form-data';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireAnyPermission, PERMISSIONS } from '../middleware/rbac.middleware';

const router = Router();
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Helper function to forward requests
const forwardRequest = async (req: any, res: any, path: string, method: string = 'GET') => {
  try {
    const isMultipart = req.headers['content-type']?.includes('multipart/form-data');
    
    // Build URL with query params
    let url = `${USER_SERVICE_URL}/api/v1${path}`;
    const queryParams = new URLSearchParams();
    
    // Forward all query params from request
    if (req.query && Object.keys(req.query).length > 0) {
      Object.keys(req.query).forEach(key => {
        const value = req.query[key];
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    
    // Append query string if there are params
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }
    
    const config: any = {
      method,
      url,
      headers: {
        'Authorization': req.headers.authorization,
      },
      timeout: 30000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    };

    // Preserve Content-Type for multipart/form-data
    if (isMultipart) {
      // For multipart/form-data, rebuild FormData from parsed fields and files
      const formData = new FormData();
      
      // Add all text fields from req.body
      if (req.body) {
        Object.keys(req.body).forEach(key => {
          // Skip avatarUrl field as it's handled separately as file
          if (key !== 'avatarUrl' && req.body[key] !== undefined && req.body[key] !== null) {
            formData.append(key, String(req.body[key]));
          }
        });
      }
      
      // Add file if exists (field name 'avatarUrl' matches frontend and backend)
      if (req.file) {
        formData.append('avatarUrl', req.file.buffer, {
          filename: req.file.originalname,
          contentType: req.file.mimetype,
        });
      } else if (req.files && req.files.avatarUrl) {
        // Handle multiple files
        const file = Array.isArray(req.files.avatarUrl) ? req.files.avatarUrl[0] : req.files.avatarUrl;
        formData.append('avatarUrl', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        });
      } else if (req.body && req.body.avatarUrl && typeof req.body.avatarUrl === 'string') {
        // If avatarUrl is a string (URL), append it as text field
        formData.append('avatarUrl', req.body.avatarUrl);
      }
      
      config.data = formData;
      config.headers = {
        ...config.headers,
        ...formData.getHeaders(),
      };
    } else {
      // For JSON requests
      config.headers['Content-Type'] = 'application/json';
      if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        config.data = req.body;
      }
    }

    if (req.user) {
      config.headers['X-User-ID'] = req.user.id;
      config.headers['X-User-Email'] = req.user.email;
      config.headers['X-User-Roles'] = JSON.stringify(req.user.roles);
      config.headers['X-User-Permissions'] = JSON.stringify(req.user.permissions);
    }

    console.log(`🔍 Proxying to user-service: ${method} ${path}${isMultipart ? ' (multipart/form-data)' : ''}`);
    const response = await axios(config);
    
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error(`User service proxy error for ${path}:`, error.message);
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
        message: 'User service is currently unavailable',
        timestamp: new Date(),
      });
    }
  }
};

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.post('/',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.USER_CREATE]),
  async (req, res) => {
    await forwardRequest(req, res, '/users', 'POST');
  }
);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users or get users by tenant ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tenantId
 *         required: false
 *         schema:
 *           type: integer
 *         description: Filter users by tenant ID
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       400:
 *         description: Invalid tenantId parameter
 *       404:
 *         description: Tenant not found
 */
router.get('/',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.USER_READ]),
  async (req, res) => {
    await forwardRequest(req, res, '/users', 'GET');
  }
);

/**
 * @swagger
 * /api/users/roles:
 *   get:
 *     summary: Get all roles (with pagination and search)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Search term
 *     responses:
 *       200:
 *         description: Roles retrieved successfully
 */
router.get('/roles',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.ROLE_READ]),
  async (req, res) => {
    await forwardRequest(req, res, '/roles', 'GET');
  }
);

/**
 * @swagger
 * /api/users/{id}/roles-permissions:
 *   get:
 *     summary: Get user roles with permissions
 *     tags: [Users]
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
 *         description: User roles and permissions retrieved successfully
 */
router.get('/:id/roles-permissions',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.USER_READ]),
  async (req, res) => {
    await forwardRequest(req, res, `/users/${req.params.id}/roles-permissions`, 'GET');
  }
);

/**
 * @swagger
 * /api/users/{id}/roles:
 *   get:
 *     summary: Get user roles
 *     tags: [Users]
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
 *         description: User roles retrieved successfully
 */
router.get('/:id/roles',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.USER_READ]),
  async (req, res) => {
    await forwardRequest(req, res, `/users/${req.params.id}/roles`, 'GET');
  }
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
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
 *         description: User retrieved successfully
 */
router.get('/:id',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.USER_READ]),
  async (req, res) => {
    await forwardRequest(req, res, `/users/${req.params.id}`, 'GET');
  }
);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
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
 *         description: User updated successfully
 */
router.put('/:id',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.USER_UPDATE]),
  upload.single('avatarUrl'), // Parse multipart/form-data with file field name 'avatarUrl'
  async (req, res) => {
    await forwardRequest(req, res, `/users/${req.params.id}`, 'PUT');
  }
);

/**
 * @swagger
 * /api/users/{id}/roles/{roleId}:
 *   delete:
 *     summary: Remove GLOBAL role from user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Role removed from user successfully
 *       404:
 *         description: User not found, role not found, or user does not have this GLOBAL role
 */
router.delete('/:id/roles/:roleId',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.USER_UPDATE]),
  async (req, res) => {
    await forwardRequest(req, res, `/users/${req.params.id}/roles/${req.params.roleId}`, 'DELETE');
  }
);

/**
 * @swagger
 * /api/users/{id}/tenants/{tenantId}/roles/{roleId}:
 *   delete:
 *     summary: Remove specific role from user tenant
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Role removed from user tenant successfully
 */
router.delete('/:id/tenants/:tenantId/roles/:roleId',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.USER_UPDATE]),
  async (req, res) => {
    await forwardRequest(req, res, `/users/${req.params.id}/tenants/${req.params.tenantId}/roles/${req.params.roleId}`, 'DELETE');
  }
);

/**
 * @swagger
 * /api/users/{id}/tenants/{tenantId}:
 *   delete:
 *     summary: Remove tenant from user (removes all roles)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tenant removed from user successfully
 *       404:
 *         description: User not found, tenant not found, or user is not assigned to this tenant
 */
router.delete('/:id/tenants/:tenantId',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.USER_UPDATE]),
  async (req, res) => {
    await forwardRequest(req, res, `/users/${req.params.id}/tenants/${req.params.tenantId}`, 'DELETE');
  }
);

/**
 * @swagger
 * /api/users/{id}/logout:
 *   post:
 *     summary: Force logout user
 *     tags: [Users]
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
 *         description: User logged out successfully
 *       404:
 *         description: User not found
 */
router.post('/:id/logout',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.USER_UPDATE]),
  async (req, res) => {
    await forwardRequest(req, res, `/users/${req.params.id}/logout`, 'POST');
  }
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
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
 *         description: User deleted successfully
 */
router.delete('/:id',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.USER_DELETE]),
  async (req, res) => {
    await forwardRequest(req, res, `/users/${req.params.id}`, 'DELETE');
  }
);

export default router;
