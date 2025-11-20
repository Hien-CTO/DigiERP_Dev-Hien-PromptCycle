import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RbacGuard } from '../guards/rbac.guard';
import { Permissions } from '../decorators/permissions.decorator';

import { GetInventorySummaryUseCase } from '../../application/use-cases/inventory-summary/get-inventory-summary.use-case';
import { GetInventorySummaryQueryDto, InventorySummaryResponseDto } from '../../application/dtos/inventory-summary.dto';

@ApiTags('Inventory Summary')
@Controller('inventory-summary')
// @UseGuards(JwtAuthGuard, RbacGuard)
// @ApiBearerAuth()
export class InventorySummaryController {
  constructor(
    private readonly getInventorySummaryUseCase: GetInventorySummaryUseCase,
  ) {}

  @Get()
  // @Permissions('inventory:read')
  @ApiOperation({ summary: 'Get inventory summary report' })
  @ApiResponse({ status: 200, description: 'Inventory summary retrieved successfully' })
  async getInventorySummary(
    @Query() query: GetInventorySummaryQueryDto,
  ): Promise<InventorySummaryResponseDto> {
    return this.getInventorySummaryUseCase.execute(query);
  }
}

