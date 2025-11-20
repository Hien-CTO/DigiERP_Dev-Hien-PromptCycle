import { Injectable } from '@nestjs/common';
import { TypeOrmInvoiceRepository } from '../../../infrastructure/database/repositories/invoice.repository';
import { SalesOverviewRequestDto, SalesOverviewResponseDto, ReportPeriod } from '../../dtos/report.dto';

@Injectable()
export class GetSalesOverviewUseCase {
  constructor(private readonly invoiceRepository: TypeOrmInvoiceRepository) {}

  async execute(request: SalesOverviewRequestDto): Promise<SalesOverviewResponseDto> {
    const startDate = request.start_date ? new Date(request.start_date) : this.getDefaultStartDate(request.period);
    const endDate = request.end_date ? new Date(request.end_date) : new Date();
    const currency = request.currency || 'USD';

    // Get sales data from invoices
    const salesData = await this.invoiceRepository.getSalesOverview(startDate, endDate, currency);

    // Calculate metrics
    const totalRevenue = salesData.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const totalOrders = salesData.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get revenue by period
    const revenueByPeriod = this.calculateRevenueByPeriod(salesData, request.period);

    // Get top products
    const topProducts = this.calculateTopProducts(salesData);

    // Calculate revenue growth
    const previousPeriodData = await this.getPreviousPeriodData(startDate, endDate, request.period, currency);
    const previousRevenue = previousPeriodData.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    // Get new customers (this would typically come from customer service)
    const newCustomers = await this.getNewCustomersCount(startDate, endDate);

    return {
      total_revenue: totalRevenue,
      total_orders: totalOrders,
      average_order_value: averageOrderValue,
      new_customers: newCustomers,
      revenue_by_period: revenueByPeriod,
      top_products: topProducts,
      revenue_growth: revenueGrowth,
      currency,
      period: request.period || ReportPeriod.MONTHLY,
      generated_at: new Date(),
    };
  }

  private getDefaultStartDate(period?: ReportPeriod): Date {
    const now = new Date();
    switch (period) {
      case ReportPeriod.DAILY:
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
      case ReportPeriod.WEEKLY:
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 12 * 7);
      case ReportPeriod.MONTHLY:
        return new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());
      case ReportPeriod.QUARTERLY:
        return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      case ReportPeriod.YEARLY:
        return new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
      default:
        return new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());
    }
  }

  private calculateRevenueByPeriod(invoices: any[], period: ReportPeriod): Record<string, number> {
    const revenueByPeriod: Record<string, number> = {};

    invoices.forEach(invoice => {
      let periodKey: string;
      const date = new Date(invoice.invoiceDate);

      switch (period) {
        case ReportPeriod.DAILY:
          periodKey = date.toISOString().split('T')[0];
          break;
        case ReportPeriod.WEEKLY:
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          periodKey = weekStart.toISOString().split('T')[0];
          break;
        case ReportPeriod.MONTHLY:
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case ReportPeriod.QUARTERLY:
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          periodKey = `${date.getFullYear()}-Q${quarter}`;
          break;
        case ReportPeriod.YEARLY:
          periodKey = date.getFullYear().toString();
          break;
        default:
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      revenueByPeriod[periodKey] = (revenueByPeriod[periodKey] || 0) + invoice.totalAmount;
    });

    return revenueByPeriod;
  }

  private calculateTopProducts(invoices: any[]): Array<{
    product_id: string;
    product_name: string;
    quantity_sold: number;
    revenue: number;
  }> {
    const productStats: Record<string, {
      product_id: string;
      product_name: string;
      quantity_sold: number;
      revenue: number;
    }> = {};

    invoices.forEach(invoice => {
      if (invoice.items) {
        invoice.items.forEach((item: any) => {
          if (!productStats[item.productId]) {
            productStats[item.productId] = {
              product_id: item.productId,
              product_name: item.productName,
              quantity_sold: 0,
              revenue: 0,
            };
          }
          productStats[item.productId].quantity_sold += item.quantity;
          productStats[item.productId].revenue += item.totalAmount;
        });
      }
    });

    return Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }

  private async getPreviousPeriodData(
    startDate: Date,
    endDate: Date,
    period: ReportPeriod,
    currency: string,
  ): Promise<any[]> {
    const periodLength = endDate.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodLength);
    const previousEndDate = new Date(startDate);

    return await this.invoiceRepository.getSalesOverview(previousStartDate, previousEndDate, currency);
  }

  private async getNewCustomersCount(startDate: Date, endDate: Date): Promise<number> {
    // This would typically call customer service to get new customers count
    // For now, return a mock value
    return Math.floor(Math.random() * 50) + 10;
  }
}
