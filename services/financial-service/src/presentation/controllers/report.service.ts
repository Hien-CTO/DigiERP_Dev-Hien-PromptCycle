import { Injectable } from '@nestjs/common';
import { GetSalesOverviewUseCase } from '../../application/use-cases/report/get-sales-overview.use-case';
import { GetInvoiceSummaryUseCase } from '../../application/use-cases/report/get-invoice-summary.use-case';
import { SalesOverviewRequestDto, SalesOverviewResponseDto, InvoiceSummaryRequestDto, InvoiceSummaryResponseDto } from '../../application/dtos/report.dto';

@Injectable()
export class ReportService {
  constructor(
    private readonly getSalesOverviewUseCase: GetSalesOverviewUseCase,
    private readonly getInvoiceSummaryUseCase: GetInvoiceSummaryUseCase,
  ) {}

  async getSalesOverview(request: SalesOverviewRequestDto): Promise<SalesOverviewResponseDto> {
    return await this.getSalesOverviewUseCase.execute(request);
  }

  async getInvoiceSummary(request: InvoiceSummaryRequestDto): Promise<InvoiceSummaryResponseDto> {
    return await this.getInvoiceSummaryUseCase.execute();
  }
}
