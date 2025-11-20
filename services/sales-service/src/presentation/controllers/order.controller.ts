import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RbacGuard } from '../guards/rbac.guard';
import { Permissions } from '../decorators/permissions.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Public } from '../decorators/public.decorator';

import { CreateOrderUseCase } from '../../application/use-cases/order/create-order.use-case';
import { GetOrderUseCase } from '../../application/use-cases/order/get-order.use-case';
import { GetOrdersUseCase } from '../../application/use-cases/order/get-orders.use-case';
import { UpdateOrderUseCase } from '../../application/use-cases/order/update-order.use-case';
import { DeleteOrderUseCase } from '../../application/use-cases/order/delete-order.use-case';

import {
  CreateSalesOrderDto,
  UpdateSalesOrderDto,
  SalesOrderResponseDto,
  SalesOrderListResponseDto,
} from '../../application/dtos/sales-order.dto';

@ApiTags('Orders')
@Controller('orders')
// @UseGuards(JwtAuthGuard, RbacGuard)
// @ApiBearerAuth()
export class OrderController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
    private readonly getOrdersUseCase: GetOrdersUseCase,
    private readonly updateOrderUseCase: UpdateOrderUseCase,
    private readonly deleteOrderUseCase: DeleteOrderUseCase,
  ) {}

  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async health(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
    };
  }

  @Post()
  @Permissions('order:create')
  @ApiOperation({ summary: 'Create a new sales order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(
    @Body() createOrderDto: CreateSalesOrderDto,
    @CurrentUser() user: any,
  ): Promise<SalesOrderResponseDto> {
    const order = await this.createOrderUseCase.execute(createOrderDto, user.id);
    return this.toResponseDto(order);
  }

  @Get()
  // @Permissions('order:read')
  @ApiOperation({ summary: 'Get all sales orders' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('search') search?: string,
  ): Promise<SalesOrderListResponseDto> {
    const result = await this.getOrdersUseCase.execute(page, limit, search);
    return {
      orders: result.orders.map(order => this.toResponseDto(order)),
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    };
  }

  @Get(':id')
  @Permissions('order:read')
  @ApiOperation({ summary: 'Get sales order by ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SalesOrderResponseDto> {
    const order = await this.getOrderUseCase.execute(id);
    return this.toResponseDto(order);
  }

  @Put(':id')
  @Permissions('order:update')
  @ApiOperation({ summary: 'Update sales order' })
  @ApiResponse({ status: 200, description: 'Order updated successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateSalesOrderDto,
    @CurrentUser() user: any,
  ): Promise<SalesOrderResponseDto> {
    const order = await this.updateOrderUseCase.execute(id, updateOrderDto, user.id);
    return this.toResponseDto(order);
  }

  @Delete(':id')
  @Permissions('order:delete')
  @ApiOperation({ summary: 'Delete sales order' })
  @ApiResponse({ status: 200, description: 'Order deleted successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.deleteOrderUseCase.execute(id);
    return { message: 'Order deleted successfully' };
  }

  private toResponseDto(order: any): SalesOrderResponseDto {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      warehouseId: order.warehouseId,
      status: order.status,
      paymentStatus: order.paymentStatus,
      subtotal: order.subtotal,
      taxAmount: order.taxAmount,
      discountAmount: order.discountAmount,
      shippingAmount: order.shippingAmount,
      totalAmount: order.totalAmount,
      currency: order.currency,
      notes: order.notes,
      internalNotes: order.internalNotes,
      orderDate: order.orderDate,
      requiredDate: order.requiredDate,
      shippedDate: order.shippedDate,
      deliveredDate: order.deliveredDate,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      shippingMethod: order.shippingMethod,
      paymentMethod: order.paymentMethod,
      trackingNumber: order.trackingNumber,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      createdBy: order.createdBy,
      updatedBy: order.updatedBy,
      items: [], // Items would be loaded separately if needed
    };
  }
}
