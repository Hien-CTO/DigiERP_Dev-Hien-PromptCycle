import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReportService } from './report.service';
import { SalesOverviewRequestDto, SalesOverviewResponseDto, InvoiceSummaryRequestDto, InvoiceSummaryResponseDto } from '../../application/dtos/report.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RbacGuard } from '../guards/rbac.guard';
import { Permissions } from '../decorators/permissions.decorator';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard, RbacGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('sales-overview')
  @ApiOperation({ summary: 'Get sales overview report' })
  @ApiResponse({ status: 200, description: 'Sales overview retrieved successfully', type: SalesOverviewResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Permissions('report:read')
  async getSalesOverview(@Query() query: SalesOverviewRequestDto): Promise<SalesOverviewResponseDto> {
    return await this.reportService.getSalesOverview(query);
  }

  @Get('invoice-summary')
  @ApiOperation({ summary: 'Get invoice summary report' })
  @ApiResponse({ status: 200, description: 'Invoice summary retrieved successfully', type: InvoiceSummaryResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Permissions('report:read')
  async getInvoiceSummary(@Query() query: InvoiceSummaryRequestDto): Promise<InvoiceSummaryResponseDto> {
    return await this.reportService.getInvoiceSummary(query);
  }
}
