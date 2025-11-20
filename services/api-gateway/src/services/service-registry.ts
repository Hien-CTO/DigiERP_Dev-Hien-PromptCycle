import { ServiceConfig } from '../types';

export class ServiceRegistry {
  private static services: Map<string, ServiceConfig> = new Map();

  static register(service: ServiceConfig): void {
    this.services.set(service.name, service);
  }

  static get(name: string): ServiceConfig | undefined {
    return this.services.get(name);
  }

  static getAll(): ServiceConfig[] {
    return Array.from(this.services.values());
  }

  static initialize(): void {
    // Register all microservices
    this.register({
      name: 'user-service',
      url: process.env.USER_SERVICE_URL || 'http://localhost:3001',
      healthCheckPath: '/api/v1/health',
      timeout: 5000,
    });

    this.register({
      name: 'product-service',
      url: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002',
      healthCheckPath: '/health',
      timeout: 5000,
    });

    this.register({
      name: 'sales-service',
      url: process.env.SALES_SERVICE_URL || 'http://localhost:3003',
      healthCheckPath: '/orders/health',
      timeout: 5000,
    });

    this.register({
      name: 'inventory-service',
      url: process.env.INVENTORY_SERVICE_URL || 'http://localhost:3004',
      healthCheckPath: undefined, // Disable health check
      timeout: 5000,
    });

    this.register({
      name: 'purchase-service',
      url: process.env.PURCHASE_SERVICE_URL || 'http://localhost:3005',
      healthCheckPath: undefined, // Disable health check
      timeout: 5000,
    });

    this.register({
      name: 'financial-service',
      url: process.env.FINANCIAL_SERVICE_URL || 'http://localhost:3007',
      healthCheckPath: undefined, // Disable health check
      timeout: 5000,
    });

    this.register({
      name: 'customer-service',
      url: process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3006',
      healthCheckPath: undefined, // Disable health check
      timeout: 5000,
    });

    this.register({
      name: 'hr-service',
      url: process.env.HR_SERVICE_URL || 'http://localhost:3008',
      healthCheckPath: '/api/v1/health',
      timeout: 5000,
    });
  }
}
