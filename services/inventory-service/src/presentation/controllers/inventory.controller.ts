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

import { GetInventoryUseCase } from '../../application/use-cases/inventory/get-inventory.use-case';
import { InventoryResponseDto } from '../../application/dtos/inventory.dto';

@ApiTags('Inventory')
@Controller('inventory')
// @UseGuards(JwtAuthGuard, RbacGuard)
// @ApiBearerAuth()
export class InventoryController {
  constructor(
    private readonly getInventoryUseCase: GetInventoryUseCase,
  ) {}

  @Get()
  // @Permissions('inventory:read')
  @ApiOperation({ summary: 'Get inventory by product and warehouse' })
  @ApiResponse({ status: 200, description: 'Inventory retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Inventory not found' })
  async getInventory(
    @Query('productId', ParseIntPipe) productId: number,
    @Query('warehouseId', ParseIntPipe) warehouseId: number,
  ): Promise<InventoryResponseDto> {
    const inventory = await this.getInventoryUseCase.execute(productId, warehouseId);
    return this.toResponseDto(inventory);
  }

  private toResponseDto(inventory: any): InventoryResponseDto {
    return {
      id: inventory.id,
      productId: inventory.productId,
      warehouseId: inventory.warehouseId,
      quantityOnHand: inventory.quantityOnHand,
      quantityReserved: inventory.quantityReserved,
      quantityAvailable: inventory.quantityAvailable,
      reorderPoint: inventory.reorderPoint,
      reorderQuantity: inventory.reorderQuantity,
      unitCost: inventory.unitCost,
      status: inventory.status,
      notes: inventory.notes,
      createdAt: inventory.createdAt,
      updatedAt: inventory.updatedAt,
      createdBy: inventory.createdBy,
      updatedBy: inventory.updatedBy,
    };
  }
}
