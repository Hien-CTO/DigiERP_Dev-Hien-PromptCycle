import { Request, Response } from 'express';
import { ReportAggregationService } from '../services/report-aggregation.service';
import { ApiResponse } from '../types';

export class ReportController {
  private reportAggregationService: ReportAggregationService;

  constructor() {
    this.reportAggregationService = new ReportAggregationService();
  }

  async getSalesOverview(req: Request, res: Response): Promise<void> {
    try {
      const queryParams = req.query;
      const data = await this.reportAggregationService.getSalesOverview(queryParams);
      
      const response: ApiResponse = {
        success: true,
        data,
        message: 'Sales overview retrieved successfully',
        timestamp: new Date(),
      };

      res.json(response);
    } catch (error) {
      console.error('Error in getSalesOverview:', error);
      
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to retrieve sales overview',
        timestamp: new Date(),
      };

      res.status(500).json(response);
    }
  }

  async getProductPerformance(req: Request, res: Response): Promise<void> {
    try {
      const queryParams = req.query;
      const data = await this.reportAggregationService.getProductPerformance(queryParams);
      
      const response: ApiResponse = {
        success: true,
        data,
        message: 'Product performance retrieved successfully',
        timestamp: new Date(),
      };

      res.json(response);
    } catch (error) {
      console.error('Error in getProductPerformance:', error);
      
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to retrieve product performance',
        timestamp: new Date(),
      };

      res.status(500).json(response);
    }
  }

  async getInventoryOverview(req: Request, res: Response): Promise<void> {
    try {
      const queryParams = req.query;
      const data = await this.reportAggregationService.getInventoryOverview(queryParams);
      
      const response: ApiResponse = {
        success: true,
        data,
        message: 'Inventory overview retrieved successfully',
        timestamp: new Date(),
      };

      res.json(response);
    } catch (error) {
      console.error('Error in getInventoryOverview:', error);
      
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to retrieve inventory overview',
        timestamp: new Date(),
      };

      res.status(500).json(response);
    }
  }
}
