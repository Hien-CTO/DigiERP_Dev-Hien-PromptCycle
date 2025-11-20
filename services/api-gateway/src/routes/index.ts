import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import roleRoutes from './role.routes';
import permissionRoutes from './permission.routes';
import tenantRoutes from './tenant.routes';
import healthRoutes from './health.routes';
import productRoutes from './product.routes';
import customerRoutes from './customer.routes';
import inventoryRoutes from './inventory.routes';
import purchaseRoutes from './purchase.routes';
import hrRoutes from './hr.routes';

const router = Router();

/**
 * Main route aggregator
 * All routes are mounted here with their respective prefixes
 */

// Health check (no /api prefix)
router.use('/health', healthRoutes);

// Proxy static files (uploads) to user-service
// This must be before other routes to ensure it catches /uploads requests
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
router.use('/uploads', createProxyMiddleware({
  target: USER_SERVICE_URL,
  changeOrigin: true,
  // No pathRewrite needed - keep the path as is
  // This will proxy /uploads/avatars/file.jpg to http://localhost:3001/uploads/avatars/file.jpg
  onProxyReq: (proxyReq, req, res) => {
    // Log for debugging
    console.log(`📁 Proxy static file: ${req.method} ${req.url} -> ${USER_SERVICE_URL}${req.url}`);
    // Set proper headers for static files
    proxyReq.setHeader('Accept', '*/*');
  },
  onProxyRes: (proxyRes, req, res) => {
    // Log response
    console.log(`✅ Proxy response: ${proxyRes.statusCode} for ${req.url}`);
    // Set CORS headers for static files
    proxyRes.headers['access-control-allow-origin'] = '*';
    proxyRes.headers['access-control-allow-methods'] = 'GET, HEAD, OPTIONS';
  },
  onError: (err, req, res) => {
    console.error(`❌ Proxy error for ${req.url}:`, err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to proxy static file', message: err.message });
    }
  },
}));

// Authentication routes (public + protected)
router.use('/api/auth', authRoutes);

// User management routes (protected)
router.use('/api/users', userRoutes);
router.use('/api/roles', roleRoutes);
router.use('/api/permissions', permissionRoutes);
router.use('/api/tenants', tenantRoutes);

// TODO: Add other service routes as needed
// Product service routes - all product-related endpoints
router.use('/api/products', productRoutes);
router.use('/api/brands', productRoutes);
router.use('/api/units', productRoutes);
router.use('/api/formula-products', productRoutes);
router.use('/api/packaging-types', productRoutes);
router.use('/api/product-prices', productRoutes);
router.use('/api/customers', customerRoutes);
router.use('/api/pricing-policies', customerRoutes);
router.use('/api/inventory', inventoryRoutes);
router.use('/api/inventory-summary', inventoryRoutes);
router.use('/api/inventory-detail', inventoryRoutes);
router.use('/api/warehouses', inventoryRoutes);
router.use('/api/purchase', purchaseRoutes);
router.use('/api/hr', hrRoutes);
// router.use('/api/sales', salesRoutes);
// router.use('/api/financial', financialRoutes);

export default router;

