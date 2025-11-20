import { Router } from 'express';
import { ProxyService } from '../services/proxy.service';

const router = Router();

// Proxy toàn bộ /api/inventory* -> inventory-service
router.use('/', ProxyService.proxyToService('inventory-service'));

export default router;

