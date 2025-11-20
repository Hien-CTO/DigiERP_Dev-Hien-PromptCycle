import { Request, Response } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { ServiceRegistry } from './service-registry';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class ProxyService {
  private static proxies: Map<string, any> = new Map();

  static initialize(): void {
    // Initialize proxies for all services
    const services = ServiceRegistry.getAll();
    
    services.forEach(service => {
      const proxyOptions: Options = {
        target: service.url,
        changeOrigin: true,
        timeout: service.timeout || 5000,
        onProxyReq: (proxyReq, req: AuthenticatedRequest) => {
          // Debug log for path rewrite
          console.log(`🔍 Proxy request: ${req.method} ${req.url} -> ${proxyReq.path}`);
          console.log(`🎯 Target: ${service.url}${proxyReq.path}`);
          
          // Forward Authorization header explicitly (important for token-based auth)
          if (req.headers.authorization) {
            proxyReq.setHeader('Authorization', req.headers.authorization);
            console.log(`✅ Forwarded Authorization header`);
          }
          
          // Forward user information to downstream services
          if (req.user) {
            proxyReq.setHeader('X-User-ID', req.user.id);
            proxyReq.setHeader('X-User-Email', req.user.email);
            proxyReq.setHeader('X-User-Username', req.user.username);
            proxyReq.setHeader('X-User-Roles', JSON.stringify(req.user.roles));
            proxyReq.setHeader('X-User-Permissions', JSON.stringify(req.user.permissions));
          }
          
          // Log headers without sensitive information (Authorization token)
          const headers = proxyReq.getHeaders();
          const safeHeaders = { ...headers };
          if (safeHeaders.authorization) {
            const authValue = safeHeaders.authorization as string;
            safeHeaders.authorization = authValue.length > 20 
              ? `${authValue.substring(0, 20)}...` 
              : '***';
          }
          console.log(`📋 Headers: ${JSON.stringify(safeHeaders)}`);
          
          // Forward original IP
          const originalIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
          if (originalIp) {
            proxyReq.setHeader('X-Forwarded-For', originalIp);
          }

          // Remove body-related headers for GET/HEAD to avoid downstream raw-body errors
          if (req.method === 'GET' || req.method === 'HEAD') {
            try {
              proxyReq.removeHeader('content-length');
              proxyReq.removeHeader('content-type');
            } catch {}
          }

          // For POST/PUT/PATCH: re-write parsed JSON body to downstream request
          const methodHasBody = ['POST', 'PUT', 'PATCH'].includes(req.method || '');
          const hasBody = !!(req as any).body && Object.keys((req as any).body).length > 0;
          if (methodHasBody && hasBody) {
            try {
              const bodyData = JSON.stringify((req as any).body);
              proxyReq.setHeader('Content-Type', 'application/json');
              proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
              proxyReq.write(bodyData);
            } catch {}
          } else if (methodHasBody && !hasBody) {
            // No actual body: ensure no stale content-length header remains
            try {
              proxyReq.removeHeader('content-length');
            } catch {}
          }
        },
        onProxyRes: (proxyRes, req, res) => {
          // Add CORS headers
          proxyRes.headers['Access-Control-Allow-Origin'] = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000';
          proxyRes.headers['Access-Control-Allow-Credentials'] = process.env.CORS_CREDENTIALS === 'true' || process.env.CORS_CREDENTIALS !== 'false' ? 'true' : 'false';
          console.log(`📤 Proxy response: ${proxyRes.statusCode} ${req.url}`);
        },
        onError: (err, req, res) => {
          console.log(`❌ Proxy error: ${err.message} for ${req.url}`);
          res.status(500).json({
            success: false,
            error: 'Proxy error',
            message: err.message,
            timestamp: new Date(),
          });
        },
        router: service.name === 'purchase-service' ? (req) => {
          // Custom router for purchase service
          if (req.url?.startsWith('/api/purchase/suppliers')) {
            return 'http://purchase-service:3005';
          }
          if (req.url?.startsWith('/api/purchase/orders')) {
            return 'http://purchase-service:3005';
          }
          if (req.url?.startsWith('/api/purchase/purchase-requests')) {
            return 'http://purchase-service:3005';
          }
          return 'http://purchase-service:3005';
        } : undefined,
        pathRewrite: service.name === 'user-service' ? {
          // Special handling for roles - remove /users prefix first
          '^/api/users/roles': '/api/v1/roles',
          // Remove the service prefix and add /api/v1 prefix for user-service
          [`^/api/${service.name.replace('-service', '')}s`]: `/api/v1/${service.name.replace('-service', '')}s`,
          // Special handling for auth routes - pass through as is
          '^/api/v1/auth': '/api/v1/auth',
        } : service.name === 'product-service' ? {
          // Product service path rewrite - handle all product-related routes
          '^/api/products/categories': '/categories',
          '^/api/products/materials': '/materials',
          '^/api/brands': '/brands',
          '^/api/units': '/units',
          '^/api/formula-products': '/formula-products',
          '^/api/packaging-types': '/packaging-types',
          '^/api/product-prices': '/product-prices',
          '^/api/products': '/products',
        } : service.name === 'inventory-service' ? {
          // Inventory service path rewrite
          '^/api/warehouses': '/warehouses',
          '^/api/inventory-summary': '/inventory-summary',
          '^/api/inventory-detail': '/inventory-detail',
          '^/api/inventory/warehouses': '/warehouses',
          '^/api/inventory/goods-receipts': '/goods-receipts',
          '^/api/inventory/goods-issues': '/goods-issues',
          '^/api/inventory/areas': '/areas',
          '^/api/inventory/inventory-postings': '/inventory-postings',
          '^/api/inventory/inventory-revaluations': '/inventory-revaluations',
          '^/api/inventory/inventory-countings': '/inventory-countings',
          '^/api/inventory/inventory-transfers': '/inventory-transfers',
          '^/api/inventory/inventory-transfer-requests': '/inventory-transfer-requests',
          '^/api/inventory': '/inventory',
        } : service.name === 'financial-service' ? {
          // Financial service path rewrite
          '^/api/financial/reports': '/reports',
          '^/api/financial': '/invoices',
        } : service.name === 'purchase-service' ? {
          '^/api/purchase/suppliers': '/suppliers',
          '^/api/purchase/orders': '/orders',
          '^/api/purchase/purchase-requests': '/purchase-requests',
          '^/api/purchase': '',
        } : service.name === 'sales-service' ? {
          // Sales service path rewrite (more specific rules first)
          '^/api/sales': '',
        } : service.name === 'customer-service' ? {
          // Customer service path rewrite
          '^/api/pricing-policies': '/pricing-policies',
          '^/api/customers': '/customers',
        } : service.name === 'hr-service' ? {
          // HR service path rewrite
          '^/api/hr/employees': '/api/v1/employees',
          '^/api/hr/departments': '/api/v1/departments',
          '^/api/hr/employee-status': '/api/v1/employee-status',
          '^/api/hr/positions': '/api/v1/positions',
          '^/api/hr/contracts': '/api/v1/contracts',
          '^/api/hr/attendance': '/api/v1/attendance',
          '^/api/hr/leave': '/api/v1/leave',
          '^/api/hr': '/api/v1',
        } : {
          // Default: Remove the service prefix from the path completely
          [`^/api/${service.name.replace('-service', '')}s`]: '',
        },
      };

      const proxy = createProxyMiddleware(proxyOptions);
      this.proxies.set(service.name, proxy);
    });

  }

  static getProxy(serviceName: string) {
    return this.proxies.get(serviceName);
  }

  static proxyToService(serviceName: string) {
    return (req: Request, res: Response, next: any) => {
      console.log(`🔍 Proxy request to ${serviceName}: ${req.method} ${req.url}`);
      const proxy = this.getProxy(serviceName);
      if (!proxy) {
        console.log(`❌ Proxy for ${serviceName} not found`);
        res.status(503).json({
          success: false,
          error: 'Service unavailable',
          message: `Proxy for ${serviceName} not found`,
          timestamp: new Date(),
        });
        return;
      }

      console.log(`✅ Proxy found for ${serviceName}, forwarding request`);
      proxy(req, res, next);
    };
  }


  static getServiceHealth(serviceName: string): Promise<boolean> {
    return new Promise((resolve) => {
      const service = ServiceRegistry.get(serviceName);
      if (!service) {
        resolve(false);
        return;
      }

      const http = require('http');
      const url = require('url');
      
      const parsedUrl = url.parse(`${service.url}${service.healthCheckPath || '/health'}`);
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.path,
        method: 'GET',
        timeout: 3000,
      };

      const req = http.request(options, (res: any) => {
        resolve(res.statusCode === 200);
      });

      req.on('error', () => {
        resolve(false);
      });

      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });

      req.end();
    });
  }

  static async getServicesHealth(): Promise<Record<string, boolean>> {
    const services = ServiceRegistry.getAll();
    const healthChecks = await Promise.all(
      services.map(async (service) => ({
        name: service.name,
        healthy: await this.getServiceHealth(service.name),
      }))
    );

    return healthChecks.reduce((acc, { name, healthy }) => {
      acc[name] = healthy;
      return acc;
    }, {} as Record<string, boolean>);
  }
}
