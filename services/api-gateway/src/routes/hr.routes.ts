import { Router } from 'express';
import { ProxyService } from '../services/proxy.service';

const router = Router();

/**
 * HR Service Routes
 * All HR-related endpoints are proxied to hr-service
 * RBAC is handled by the service itself or by API Gateway auth middleware
 */

// Proxy all HR routes to hr-service
router.use('/', ProxyService.proxyToService('hr-service'));

export default router;

