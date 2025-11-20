import { Router } from 'express';
import { ProxyService } from '../services/proxy.service';

const router = Router();

// Proxy toàn bộ /api/customers -> customer-service (/customers)
router.use('/', ProxyService.proxyToService('customer-service'));

export default router;

