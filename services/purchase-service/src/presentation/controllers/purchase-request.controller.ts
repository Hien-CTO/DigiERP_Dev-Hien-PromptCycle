import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PurchaseRequestService } from './purchase-request.service';
import {
  CreatePurchaseRequestDto,
  UpdatePurchaseRequestDto,
  PurchaseRequestResponseDto,
  SubmitPurchaseRequestDto,
  ApprovePurchaseRequestDto,
  RejectPurchaseRequestDto,
  ConvertToPurchaseOrderDto,
} from '../../application/dtos/purchase-request.dto';
import { PurchaseOrderResponseDto } from '../../application/dtos/purchase-order.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RbacGuard } from '../guards/rbac.guard';
import { Permissions } from '../decorators/permissions.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';

@ApiTags('Purchase Requests')
@ApiBearerAuth()
@Controller('purchase-requests')
@UseGuards(JwtAuthGuard, RbacGuard)
export class PurchaseRequestController {
  constructor(private readonly purchaseRequestService: PurchaseRequestService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new purchase request' })
  @ApiResponse({
    status: 201,
    description: 'Purchase request created successfully',
    type: PurchaseRequestResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Permissions('purchase_request:create')
  async create(
    @Body() createPurchaseRequestDto: CreatePurchaseRequestDto,
    @CurrentUser() user: any,
  ): Promise<PurchaseRequestResponseDto> {
    return await this.purchaseRequestService.create(
      createPurchaseRequestDto,
      user.id,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all purchase requests' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by status' })
  @ApiQuery({ name: 'warehouse_id', required: false, type: String, description: 'Filter by warehouse ID' })
  @ApiResponse({
    status: 200,
    description: 'Purchase requests retrieved successfully',
    type: [PurchaseRequestResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Permissions('purchase_request:read')
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('warehouse_id') warehouseId?: string,
  ): Promise<{ data: PurchaseRequestResponseDto[]; total: number }> {
    return await this.purchaseRequestService.findAll(
      page,
      limit,
      search,
      status,
      warehouseId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a purchase request by ID' })
  @ApiResponse({
    status: 200,
    description: 'Purchase request retrieved successfully',
    type: PurchaseRequestResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Purchase request not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Permissions('purchase_request:read')
  async findOne(@Param('id') id: string): Promise<PurchaseRequestResponseDto> {
    return await this.purchaseRequestService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a purchase request' })
  @ApiResponse({
    status: 200,
    description: 'Purchase request updated successfully',
    type: PurchaseRequestResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Purchase request not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Permissions('purchase_request:update')
  async update(
    @Param('id') id: string,
    @Body() updatePurchaseRequestDto: UpdatePurchaseRequestDto,
  ): Promise<PurchaseRequestResponseDto> {
    return await this.purchaseRequestService.update(id, updatePurchaseRequestDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a purchase request' })
  @ApiResponse({ status: 204, description: 'Purchase request deleted successfully' })
  @ApiResponse({ status: 404, description: 'Purchase request not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Permissions('purchase_request:delete')
  async remove(@Param('id') id: string): Promise<void> {
    return await this.purchaseRequestService.remove(id);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit a purchase request for approval' })
  @ApiResponse({
    status: 200,
    description: 'Purchase request submitted successfully',
    type: PurchaseRequestResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Purchase request not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Permissions('purchase_request:submit')
  async submit(
    @Param('id') id: string,
  ): Promise<PurchaseRequestResponseDto> {
    return await this.purchaseRequestService.submit(id);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve a purchase request' })
  @ApiResponse({
    status: 200,
    description: 'Purchase request approved successfully',
    type: PurchaseRequestResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Purchase request not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Permissions('purchase_request:approve')
  async approve(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<PurchaseRequestResponseDto> {
    return await this.purchaseRequestService.approve(id, user.id);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject a purchase request' })
  @ApiResponse({
    status: 200,
    description: 'Purchase request rejected successfully',
    type: PurchaseRequestResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Purchase request not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Permissions('purchase_request:approve')
  async reject(
    @Param('id') id: string,
    @Body() rejectDto: RejectPurchaseRequestDto,
    @CurrentUser() user: any,
  ): Promise<PurchaseRequestResponseDto> {
    return await this.purchaseRequestService.reject(id, rejectDto, user.id);
  }

  @Post(':id/convert-to-order')
  @ApiOperation({ summary: 'Convert an approved purchase request to purchase order' })
  @ApiResponse({
    status: 201,
    description: 'Purchase order created from request successfully',
    type: PurchaseOrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Purchase request not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Permissions('purchase_request:convert', 'purchase_order:create')
  async convertToPurchaseOrder(
    @Param('id') id: string,
    @Body() convertDto: ConvertToPurchaseOrderDto,
    @CurrentUser() user: any,
  ): Promise<PurchaseOrderResponseDto> {
    return await this.purchaseRequestService.convertToPurchaseOrder(
      id,
      convertDto,
      user.id,
    );
  }
}

