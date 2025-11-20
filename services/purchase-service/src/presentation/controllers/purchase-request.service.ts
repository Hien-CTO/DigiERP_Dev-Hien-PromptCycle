import { Injectable } from '@nestjs/common';
import { CreatePurchaseRequestUseCase } from '../../application/use-cases/purchase-request/create-purchase-request.use-case';
import { GetPurchaseRequestUseCase } from '../../application/use-cases/purchase-request/get-purchase-request.use-case';
import { GetAllPurchaseRequestsUseCase } from '../../application/use-cases/purchase-request/get-all-purchase-requests.use-case';
import { UpdatePurchaseRequestUseCase } from '../../application/use-cases/purchase-request/update-purchase-request.use-case';
import { DeletePurchaseRequestUseCase } from '../../application/use-cases/purchase-request/delete-purchase-request.use-case';
import { SubmitPurchaseRequestUseCase } from '../../application/use-cases/purchase-request/submit-purchase-request.use-case';
import { ApprovePurchaseRequestUseCase } from '../../application/use-cases/purchase-request/approve-purchase-request.use-case';
import { RejectPurchaseRequestUseCase } from '../../application/use-cases/purchase-request/reject-purchase-request.use-case';
import { ConvertToPurchaseOrderUseCase } from '../../application/use-cases/purchase-request/convert-to-purchase-order.use-case';
import {
  CreatePurchaseRequestDto,
  UpdatePurchaseRequestDto,
  PurchaseRequestResponseDto,
  RejectPurchaseRequestDto,
  ConvertToPurchaseOrderDto,
} from '../../application/dtos/purchase-request.dto';
import { PurchaseOrderResponseDto } from '../../application/dtos/purchase-order.dto';

@Injectable()
export class PurchaseRequestService {
  constructor(
    private readonly createPurchaseRequestUseCase: CreatePurchaseRequestUseCase,
    private readonly getPurchaseRequestUseCase: GetPurchaseRequestUseCase,
    private readonly getAllPurchaseRequestsUseCase: GetAllPurchaseRequestsUseCase,
    private readonly updatePurchaseRequestUseCase: UpdatePurchaseRequestUseCase,
    private readonly deletePurchaseRequestUseCase: DeletePurchaseRequestUseCase,
    private readonly submitPurchaseRequestUseCase: SubmitPurchaseRequestUseCase,
    private readonly approvePurchaseRequestUseCase: ApprovePurchaseRequestUseCase,
    private readonly rejectPurchaseRequestUseCase: RejectPurchaseRequestUseCase,
    private readonly convertToPurchaseOrderUseCase: ConvertToPurchaseOrderUseCase,
  ) {}

  async create(
    dto: CreatePurchaseRequestDto,
    userId: string,
  ): Promise<PurchaseRequestResponseDto> {
    return await this.createPurchaseRequestUseCase.execute(dto, userId);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
    warehouseId?: string,
  ): Promise<{ data: PurchaseRequestResponseDto[]; total: number }> {
    return await this.getAllPurchaseRequestsUseCase.execute(
      page,
      limit,
      search,
      status,
      warehouseId,
    );
  }

  async findOne(id: string): Promise<PurchaseRequestResponseDto> {
    return await this.getPurchaseRequestUseCase.execute(id);
  }

  async update(
    id: string,
    dto: UpdatePurchaseRequestDto,
  ): Promise<PurchaseRequestResponseDto> {
    return await this.updatePurchaseRequestUseCase.execute(id, dto);
  }

  async remove(id: string): Promise<void> {
    return await this.deletePurchaseRequestUseCase.execute(id);
  }

  async submit(id: string): Promise<PurchaseRequestResponseDto> {
    return await this.submitPurchaseRequestUseCase.execute(id);
  }

  async approve(
    id: string,
    approvedBy: string,
  ): Promise<PurchaseRequestResponseDto> {
    return await this.approvePurchaseRequestUseCase.execute(id, approvedBy);
  }

  async reject(
    id: string,
    dto: RejectPurchaseRequestDto,
    rejectedBy: string,
  ): Promise<PurchaseRequestResponseDto> {
    return await this.rejectPurchaseRequestUseCase.execute(id, dto, rejectedBy);
  }

  async convertToPurchaseOrder(
    id: string,
    dto: ConvertToPurchaseOrderDto,
    userId: number,
  ): Promise<PurchaseOrderResponseDto> {
    return await this.convertToPurchaseOrderUseCase.execute(id, dto, userId);
  }
}

