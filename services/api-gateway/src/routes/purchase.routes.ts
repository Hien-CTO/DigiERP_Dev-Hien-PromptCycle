import { Router } from 'express';
import { ProxyService } from '../services/proxy.service';

const router = Router();

// Proxy toàn bộ /api/purchase -> purchase-service
router.use('/', ProxyService.proxyToService('purchase-service'));

export default router;

