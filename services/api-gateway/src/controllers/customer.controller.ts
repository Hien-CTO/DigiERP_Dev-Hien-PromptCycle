import { Request, Response } from 'express';
import { ProxyService } from '../services/proxy.service';
import { ReportAggregationService } from '../services/report-aggregation.service';
import axios from 'axios';

export class CustomerController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly reportAggregationService: ReportAggregationService,
  ) {}

  // Proxy all customer group operations
  async getCustomerGroups(req: Request, res: Response) {
    return ProxyService.proxyToService('customer-service')(req, res, () => {});
  }

  async createCustomerGroup(req: Request, res: Response) {
    return ProxyService.proxyToService('customer-service')(req, res, () => {});
  }

  async getCustomerGroup(req: Request, res: Response) {
    return ProxyService.proxyToService('customer-service')(req, res, () => {});
  }

  async updateCustomerGroup(req: Request, res: Response) {
    return ProxyService.proxyToService('customer-service')(req, res, () => {});
  }

  async deleteCustomerGroup(req: Request, res: Response) {
    return ProxyService.proxyToService('customer-service')(req, res, () => {});
  }

  // Proxy all customer operations
  async getCustomers(req: Request, res: Response) {
    return ProxyService.proxyToService('customer-service')(req, res, () => {});
  }

  async createCustomer(req: Request, res: Response) {
    return ProxyService.proxyToService('customer-service')(req, res, () => {});
  }

  async getCustomer(req: Request, res: Response) {
    return ProxyService.proxyToService('customer-service')(req, res, () => {});
  }

  async updateCustomer(req: Request, res: Response) {
    return ProxyService.proxyToService('customer-service')(req, res, () => {});
  }

  async deleteCustomer(req: Request, res: Response) {
    return ProxyService.proxyToService('customer-service')(req, res, () => {});
  }

  // 360° Customer View - Data Aggregation
  async getCustomerSummary(req: Request, res: Response) {
    try {
      const customerId = req.params.id;
      
      // Get customer basic information
      const customerResponse = await axios.get(`http://localhost:3006/customers/${customerId}`);
      const customer = customerResponse.data;

      // Get recent orders from sales service
      let recentOrders = [];
      let totalOrders = 0;
      let totalValue = 0;
      let lastOrderDate = null;
      
      try {
        const ordersResponse = await axios.get(`http://localhost:3003/orders?customerId=${customerId}&limit=5`);
        recentOrders = ordersResponse.data.orders || [];
        totalOrders = ordersResponse.data.total || 0;
        totalValue = ordersResponse.data.totalValue || 0;
        
        if (recentOrders.length > 0) {
          lastOrderDate = recentOrders[0].created_at;
        }
      } catch (error: any) {
        console.warn('Failed to fetch orders:', error.message);
      }

      // Get unpaid invoices from financial service
      let currentDebt = 0;
      let unpaidInvoices = [];
      
      try {
        const invoicesResponse = await axios.get(`http://localhost:3007/invoices?customerId=${customerId}&status=unpaid`);
        unpaidInvoices = invoicesResponse.data.invoices || [];
        currentDebt = unpaidInvoices.reduce((sum: number, invoice: any) => sum + (invoice.total_amount || 0), 0);
      } catch (error: any) {
        console.warn('Failed to fetch invoices:', error.message);
      }

      // Aggregate all data
      const customerSummary = {
        customer: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: customer.address,
          contactPerson: customer.contactPerson,
          salesRep: customer.salesRep,
          creditLimit: customer.creditLimit,
          customerGroup: customer.customerGroup,
        },
        financial: {
          creditLimit: customer.creditLimit,
          currentDebt: currentDebt,
          availableCredit: Math.max(0, customer.creditLimit - currentDebt),
          unpaidInvoices: unpaidInvoices,
        },
        orders: {
          recentOrders: recentOrders,
          totalOrders: totalOrders,
          totalValue: totalValue,
          lastOrderDate: lastOrderDate,
        },
        summary: {
          totalOrders: totalOrders,
          totalValue: totalValue,
          currentDebt: currentDebt,
          creditUtilization: customer.creditLimit > 0 ? (currentDebt / customer.creditLimit) * 100 : 0,
        }
      };

      res.status(200).json(customerSummary);
    } catch (error: any) {
      console.error('Error fetching customer summary:', error);
      res.status(500).json({
        error: 'Failed to fetch customer summary',
        message: error.message,
      });
    }
  }

  // Search customers endpoint
  async searchCustomers(req: Request, res: Response) {
    return ProxyService.proxyToService('customer-service')(req, res, () => {});
  }
}