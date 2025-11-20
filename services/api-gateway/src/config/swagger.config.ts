import swaggerJsdoc from 'swagger-jsdoc';
import { ServiceRegistry } from '../services/service-registry';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DigiERP API Gateway',
      version: '1.0.0',
      description: `
        # DigiERP API Gateway
        
        This is the main API Gateway for the DigiERP system. It provides a unified entry point for all microservices and includes:
        
        - **Authentication & Authorization**: JWT-based authentication with RBAC
        - **Service Routing**: Intelligent routing to backend microservices
        - **Rate Limiting**: Protection against abuse
        - **Health Monitoring**: Real-time service health checks
        - **Data Aggregation**: Cross-service data aggregation for reports
        
        ## Backend Services
        
        The API Gateway routes requests to the following microservices:
        
        ${ServiceRegistry.getAll().map(service => `
        ### ${service.name.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        - **URL**: \`${service.url}\`
        - **Health Check**: \`${service.url}${service.healthCheckPath || '/health'}\`
        - **Documentation**: \`${service.url}/api/v1/docs\`
        `).join('')}
        
        ## Authentication
        
        Most endpoints require authentication. Include the JWT token in the Authorization header:
        \`\`\`
        Authorization: Bearer <your-jwt-token>
        \`\`\`
        
        ## Rate Limiting
        
        - General endpoints: 100 requests per 15 minutes
        - Report endpoints: 20 requests per 15 minutes
        
        ## Error Responses
        
        All endpoints return consistent error responses:
        \`\`\`json
        {
          "success": false,
          "error": "Error type",
          "message": "Human readable error message",
          "timestamp": "2024-01-01T00:00:00.000Z"
        }
        \`\`\`
      `,
      contact: {
        name: 'DigiERP Team',
        email: 'support@digierp.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.API_GATEWAY_URL || 'http://localhost:4000',
        description: 'API Gateway Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from /api/v1/auth/login',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              example: 'Unauthorized',
            },
            message: {
              type: 'string',
              example: 'Access token is required',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
          },
        },
        HealthCheck: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'API Gateway is healthy',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
            services: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    example: 'user-service',
                  },
                  url: {
                    type: 'string',
                    example: 'http://user-service:3001',
                  },
                  healthy: {
                    type: 'boolean',
                    example: true,
                  },
                },
              },
            },
          },
        },
        ServiceInfo: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'user-service',
            },
            url: {
              type: 'string',
              example: 'http://user-service:3001',
            },
            healthCheckPath: {
              type: 'string',
              example: '/health',
            },
            timeout: {
              type: 'number',
              example: 5000,
            },
            healthy: {
              type: 'boolean',
              example: true,
            },
            documentation: {
              type: 'string',
              example: 'http://user-service:3001/api/docs',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Health',
        description: 'Health check and monitoring endpoints',
      },
      {
        name: 'Authentication',
        description: 'Authentication and authorization endpoints (proxied to User Service)',
      },
      {
        name: 'Users',
        description: 'User management endpoints (proxied to User Service)',
      },
      {
        name: 'Products',
        description: 'Product management endpoints (proxied to Product Service)',
      },
      {
        name: 'Sales',
        description: 'Sales and order management endpoints (proxied to Sales Service)',
      },
      {
        name: 'Inventory',
        description: 'Inventory and warehouse management endpoints (proxied to Inventory Service)',
      },
      {
        name: 'Purchase',
        description: 'Purchase and supplier management endpoints (proxied to Purchase Service)',
      },
      {
        name: 'Financial',
        description: 'Financial and invoice management endpoints (proxied to Financial Service)',
      },
      {
        name: 'Reports',
        description: 'Cross-service reporting and analytics endpoints',
      },
      {
        name: 'RBAC',
        description: 'Role-based access control management endpoints',
      },
    ],
  },
  apis: ['./src/**/*.ts'], // Path to the API files
};

export const swaggerSpec = swaggerJsdoc(options);
