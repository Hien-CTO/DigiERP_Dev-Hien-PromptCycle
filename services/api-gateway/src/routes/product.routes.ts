import { Router } from 'express';
import { ProxyService } from '../services/proxy.service';

const router = Router();

// Proxy toàn bộ /api/products -> product-service (/products)
router.use('/', ProxyService.proxyToService('product-service'));

export default router;