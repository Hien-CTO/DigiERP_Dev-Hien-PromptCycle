import { Router } from 'express';
import axios from 'axios';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { ServiceRegistry } from '../services/service-registry';

const router = Router();

// Get USER_SERVICE_URL from ServiceRegistry or fallback to env/default
// This function is called dynamically to ensure ServiceRegistry is initialized
const getUserServiceUrl = (): string => {
  // Try to get from ServiceRegistry first (initialized in app.ts)
  const userService = ServiceRegistry.get('user-service');
  if (userService?.url) {
    return userService.url;
  }
  // Fallback to environment variable or default
  const url = process.env.USER_SERVICE_URL || 'http://localhost:3001';
  return url;
};

// Log initial configuration
console.log('✅ USER_SERVICE_URL will be resolved from ServiceRegistry or env');
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res) => {
  try {
    const userServiceUrl = getUserServiceUrl();
    const loginUrl = `${userServiceUrl}/api/v1/auth/login`;
    console.log('🔐 Proxying login request to:', loginUrl);
    console.log('📦 Request body:', JSON.stringify(req.body));
    
    const response = await axios.post(loginUrl, req.body, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    console.log('Login response status:', response.status);
    
    // **FIX: Forward cookies from user-service to client**
    const setCookieHeaders = response.headers['set-cookie'];
    if (setCookieHeaders) {
      res.setHeader('Set-Cookie', setCookieHeaders);
      console.log('✅ Forwarded cookies to client:', setCookieHeaders);
    }
    
    res.status(response.status).json(response.data);
  } catch (error: any) {
    const userServiceUrl = getUserServiceUrl();
    console.error('❌ Login proxy error:', error.message);
    console.error('📍 Target URL:', `${userServiceUrl}/api/v1/auth/login`);
    console.error('🔍 Error details:', {
      code: error.code,
      response: error.response?.status,
      responseData: error.response?.data,
      message: error.message,
    });
    
    if (error.code === 'ECONNABORTED') {
      res.status(408).json({
        success: false,
        error: 'Request timeout',
        message: 'Login request timed out',
        timestamp: new Date(),
      });
    } else if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(503).json({
        success: false,
        error: 'Service unavailable',
        message: 'Authentication service is currently unavailable',
        timestamp: new Date(),
      });
    }
  }
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid refresh token
 */
router.post('/refresh', async (req, res) => {
  try {
    const userServiceUrl = getUserServiceUrl();
    const refreshUrl = `${userServiceUrl}/api/v1/auth/refresh`;
    console.log('🔄 Proxying refresh request to:', refreshUrl);
    
    // **FIX: Forward cookies from client to user-service**
    const cookies = req.headers.cookie;
    const headers: any = {
      'Content-Type': 'application/json',
    };
    if (cookies) {
      headers['Cookie'] = cookies;
    }
    
    const response = await axios.post(refreshUrl, req.body, {
      headers,
      timeout: 30000,
    });

    console.log('Refresh response status:', response.status);
    
    // **FIX: Forward cookies from user-service to client**
    const setCookieHeaders = response.headers['set-cookie'];
    if (setCookieHeaders) {
      res.setHeader('Set-Cookie', setCookieHeaders);
      console.log('✅ Forwarded refreshed cookies to client');
    }
    
    res.status(response.status).json(response.data);
  } catch (error: any) {
    const userServiceUrl = getUserServiceUrl();
    console.error('❌ Refresh proxy error:', error.message);
    console.error('📍 Target URL:', `${userServiceUrl}/api/v1/auth/refresh`);
    console.error('🔍 Error details:', {
      code: error.code,
      response: error.response?.status,
      responseData: error.response?.data,
      message: error.message,
    });
    
    if (error.code === 'ECONNABORTED') {
      res.status(408).json({
        success: false,
        error: 'Request timeout',
        message: 'Refresh request timed out',
        timestamp: new Date(),
      });
    } else if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(503).json({
        success: false,
        error: 'Service unavailable',
        message: 'Authentication service is currently unavailable',
        timestamp: new Date(),
      });
    }
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/me', async (req, res) => {
  try {
    const userServiceUrl = getUserServiceUrl();
    const meUrl = `${userServiceUrl}/api/v1/auth/me`;
    console.log('👤 Proxying me request to:', meUrl);
    
    // **FIX: Forward cookies from client to user-service**
    const cookies = req.headers.cookie;
    const headers: any = {
      'Authorization': req.headers.authorization,
    };
    if (cookies) {
      headers['Cookie'] = cookies;
    }
    
    const response = await axios.get(meUrl, {
      headers,
      timeout: 30000,
    });

    console.log('Me response status:', response.status);
    res.status(response.status).json(response.data);
  } catch (error: any) {
    const userServiceUrl = getUserServiceUrl();
    console.error('❌ Me proxy error:', error.message);
    console.error('📍 Target URL:', `${userServiceUrl}/api/v1/auth/me`);
    console.error('🔍 Error details:', {
      code: error.code,
      response: error.response?.status,
      responseData: error.response?.data,
      message: error.message,
    });
    
    if (error.code === 'ECONNABORTED') {
      res.status(408).json({
        success: false,
        error: 'Request timeout',
        message: 'Profile request timed out',
        timestamp: new Date(),
      });
    } else if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(503).json({
        success: false,
        error: 'Service unavailable',
        message: 'Authentication service is currently unavailable',
        timestamp: new Date(),
      });
    }
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: User logout
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */
router.post('/logout', async (req, res) => {
  try {
    const userServiceUrl = getUserServiceUrl();
    const logoutUrl = `${userServiceUrl}/api/v1/auth/logout`;
    console.log('🚪 Proxying logout request to:', logoutUrl);
    
    const response = await axios.post(logoutUrl, req.body, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization,
      },
      timeout: 30000,
    });

    console.log('Logout response status:', response.status);
    res.status(response.status).json(response.data);
  } catch (error: any) {
    const userServiceUrl = getUserServiceUrl();
    console.error('❌ Logout proxy error:', error.message);
    console.error('📍 Target URL:', `${userServiceUrl}/api/v1/auth/logout`);
    console.error('🔍 Error details:', {
      code: error.code,
      response: error.response?.status,
      responseData: error.response?.data,
      message: error.message,
    });
    
    if (error.code === 'ECONNABORTED') {
      res.status(408).json({
        success: false,
        error: 'Request timeout',
        message: 'Logout request timed out',
        timestamp: new Date(),
      });
    } else if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(503).json({
        success: false,
        error: 'Service unavailable',
        message: 'Authentication service is currently unavailable',
        timestamp: new Date(),
      });
    }
  }
});

export default router;

