import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RbacGuard } from '../guards/rbac.guard';
import { Permissions } from '../decorators/permissions.decorator';

import { GetInventoryDetailUseCase } from '../../application/use-cases/inventory-detail/get-inventory-detail.use-case';
import { GetInventoryDetailQueryDto, InventoryDetailResponseDto } from '../../application/dtos/inventory-detail.dto';

@ApiTags('Inventory Detail')
@Controller('inventory-detail')
// @UseGuards(JwtAuthGuard, RbacGuard)
// @ApiBearerAuth()
export class InventoryDetailController {
  constructor(
    private readonly getInventoryDetailUseCase: GetInventoryDetailUseCase,
  ) {}

  @Get()
  // @Permissions('inventory:read')
  @ApiOperation({ summary: 'Get inventory detail by product and warehouse' })
  @ApiResponse({ status: 200, description: 'Inventory detail retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product or warehouse not found' })
  async getInventoryDetail(
    @Query('productId', ParseIntPipe) productId: number,
    @Query('warehouseId', ParseIntPipe) warehouseId: number,
    @Query('search') search?: string,
    @Query('expiryDateFrom') expiryDateFrom?: string,
    @Query('expiryDateTo') expiryDateTo?: string,
  ): Promise<InventoryDetailResponseDto> {
    const query: GetInventoryDetailQueryDto = {
      productId,
      warehouseId,
      search,
      expiryDateFrom,
      expiryDateTo,
    };
    return this.getInventoryDetailUseCase.execute(query);
  }
}



