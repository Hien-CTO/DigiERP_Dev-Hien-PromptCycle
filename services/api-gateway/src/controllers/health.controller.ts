import { Request, Response } from 'express';
import { ProxyService } from '../services/proxy.service';
import { ServiceRegistry } from '../services/service-registry';

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Get API Gateway health status
 *     description: Returns the health status of the API Gateway and all registered microservices
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: All services are healthy
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/HealthCheck'
 *                 - type: object
 *                   properties:
 *                     success:
 *                       example: true
 *                     message:
 *                       example: "API Gateway is healthy"
 *       503:
 *         description: Some services are unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/HealthCheck'
 *                 - type: object
 *                   properties:
 *                     success:
 *                       example: false
 *                     message:
 *                       example: "Some services are unhealthy"
 */
export class HealthController {
  async getHealth(req: Request, res: Response): Promise<void> {
    try {
      const servicesHealth = await ProxyService.getServicesHealth();
      const allHealthy = Object.values(servicesHealth).every(healthy => healthy);
      
      res.status(allHealthy ? 200 : 503).json({
        success: allHealthy,
        message: allHealthy ? 'API Gateway is healthy' : 'Some services are unhealthy',
        timestamp: new Date(),
        services: ServiceRegistry.getAll().map(service => ({
          name: service.name,
          url: service.url,
          healthy: servicesHealth[service.name] || false,
        })),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to check service health',
        timestamp: new Date(),
      });
    }
  }
}
