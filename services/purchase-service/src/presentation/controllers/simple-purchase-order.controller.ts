import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Simple Purchase Orders')
@Controller('orders')
export class SimplePurchaseOrderController {
  @Get()
  @ApiOperation({ summary: 'Get all purchase orders (simple)' })
  @ApiResponse({ status: 200, description: 'Purchase orders retrieved successfully' })
  async findAll(): Promise<any[]> {
    return [
      {
        id: 'po-1',
        order_number: 'PO-2024-001',
        supplier_id: 'supplier-1',
        status: 'DRAFT',
        total_amount: 1000,
        created_at: new Date(),
      },
      {
        id: 'po-2',
        order_number: 'PO-2024-002',
        supplier_id: 'supplier-2',
        status: 'PENDING',
        total_amount: 2000,
        created_at: new Date(),
      }
    ];
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check for purchase orders' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async health(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
    };
  }
}
