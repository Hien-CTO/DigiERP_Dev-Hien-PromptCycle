import { Request, Response } from 'express';
import { ServiceRegistry } from '../services/service-registry';

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Get list of registered services
 *     description: Returns information about all registered microservices
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: List of registered services
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ServiceInfo'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-01T00:00:00.000Z"
 */
export class ServicesController {
  async getServices(req: Request, res: Response): Promise<void> {
    try {
      const services = ServiceRegistry.getAll().map(service => ({
        name: service.name,
        url: service.url,
        healthCheckPath: service.healthCheckPath || '/health',
        timeout: service.timeout || 5000,
        documentation: `${service.url}/api/v1/docs`,
      }));

      res.json({
        success: true,
        data: services,
        timestamp: new Date(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to get services information',
        timestamp: new Date(),
      });
    }
  }
}
