import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  @Get()
  @ApiOperation({ summary: 'Get all purchase orders' })
  @ApiResponse({ status: 200, description: 'List of purchase orders' })
  async findAll(): Promise<any> {
    return {
      message: 'Purchase orders endpoint is working!',
      data: [],
      total: 0,
      page: 1,
      limit: 10
    };
  }
}
