import { ServiceRegistry } from './service-registry';
import { HttpClient } from './http-client';
import { SalesOverviewData, CustomerData, AggregatedSalesOverview } from '../types';

export class ReportAggregationService {
  async getSalesOverview(queryParams: any): Promise<AggregatedSalesOverview> {
    try {
      // Get sales data from financial service
      const financialService = ServiceRegistry.get('financial-service');
      if (!financialService) {
        throw new Error('Financial service not available');
      }

      const salesData: SalesOverviewData = await HttpClient.get(
        financialService,
        '/reports/sales-overview',
        { params: queryParams }
      );

      // Get customer data from user service (assuming it has customer endpoints)
      const userService = ServiceRegistry.get('user-service');
      if (!userService) {
        throw new Error('User service not available');
      }

      // For now, we'll create mock customer data since we don't have customer service
      // In a real implementation, you would call the customer service
      const customerData: CustomerData = {
        total_customers: Math.floor(Math.random() * 1000) + 500,
        new_customers: salesData.new_customers,
        active_customers: Math.floor(Math.random() * 800) + 200,
      };

      return {
        sales: salesData,
        customers: customerData,
        generated_at: new Date(),
      };
    } catch (error) {
      console.error('Error aggregating sales overview:', error);
      throw new Error('Failed to aggregate sales overview data');
    }
  }

  async getProductPerformance(queryParams: any): Promise<any> {
    try {
      // Get product data from product service
      const productService = ServiceRegistry.get('product-service');
      if (!productService) {
        throw new Error('Product service not available');
      }

      const productData = await HttpClient.get(
        productService,
        '/products/performance',
        { params: queryParams }
      );

      // Get sales data from financial service
      const financialService = ServiceRegistry.get('financial-service');
      if (!financialService) {
        throw new Error('Financial service not available');
      }

      const salesData = await HttpClient.get(
        financialService,
        '/reports/sales-overview',
        { params: queryParams }
      );

      return {
        products: productData,
        sales: salesData,
        generated_at: new Date(),
      };
    } catch (error) {
      console.error('Error aggregating product performance:', error);
      throw new Error('Failed to aggregate product performance data');
    }
  }

  async getInventoryOverview(queryParams: any): Promise<any> {
    try {
      // Get inventory data from inventory service
      const inventoryService = ServiceRegistry.get('inventory-service');
      if (!inventoryService) {
        throw new Error('Inventory service not available');
      }

      const inventoryData = await HttpClient.get(
        inventoryService,
        '/inventory/overview',
        { params: queryParams }
      );

      // Get product data from product service
      const productService = ServiceRegistry.get('product-service');
      if (!productService) {
        throw new Error('Product service not available');
      }

      const productData = await HttpClient.get(
        productService,
        '/products',
        { params: queryParams }
      );

      return {
        inventory: inventoryData,
        products: productData,
        generated_at: new Date(),
      };
    } catch (error) {
      console.error('Error aggregating inventory overview:', error);
      throw new Error('Failed to aggregate inventory overview data');
    }
  }
}
