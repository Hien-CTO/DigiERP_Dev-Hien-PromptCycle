import { Injectable, NotFoundException, BadRequestException, ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateSupplierUseCase } from '../../application/use-cases/supplier/create-supplier.use-case';
import { GetSupplierUseCase } from '../../application/use-cases/supplier/get-supplier.use-case';
import { UpdateSupplierUseCase } from '../../application/use-cases/supplier/update-supplier.use-case';
import { DeleteSupplierUseCase } from '../../application/use-cases/supplier/delete-supplier.use-case';
import { GetAllSuppliersUseCase } from '../../application/use-cases/supplier/get-all-suppliers.use-case';
import { GetActiveSuppliersUseCase } from '../../application/use-cases/supplier/get-active-suppliers.use-case';
import { CreateSupplierDto, UpdateSupplierDto, SupplierResponseDto, SupplierPaginationResponseDto, SupplierSearchQueryDto } from '../../application/dtos/supplier.dto';
import {
  SupplierDomainError,
  SupplierNameAlreadyExistsError,
  SupplierNotFoundError,
  SupplierTaxCodeAlreadyExistsError,
} from '../../application/errors/supplier.errors';

@Injectable()
export class SupplierService {
  private readonly logger = new Logger(SupplierService.name);

  constructor(
    private readonly createSupplierUseCase: CreateSupplierUseCase,
    private readonly getSupplierUseCase: GetSupplierUseCase,
    private readonly updateSupplierUseCase: UpdateSupplierUseCase,
    private readonly deleteSupplierUseCase: DeleteSupplierUseCase,
    private readonly getAllSuppliersUseCase: GetAllSuppliersUseCase,
    private readonly getActiveSuppliersUseCase: GetActiveSuppliersUseCase,
  ) {}

  async create(createSupplierDto: CreateSupplierDto, userId: string): Promise<SupplierResponseDto> {
    try {
      const supplier = await this.createSupplierUseCase.execute(createSupplierDto);
      return this.toResponseDto(supplier);
    } catch (error) {
      this.handleDomainError(error, 'create');
    }
  }

  async findAll(query: SupplierSearchQueryDto): Promise<SupplierPaginationResponseDto> {
    const { page = 1, limit = 10, search, is_active } = query;
    const result = await this.getAllSuppliersUseCase.execute({
      page,
      limit,
      search,
      isActive: typeof is_active === 'boolean' ? is_active : undefined,
    });
    return {
      data: result.data.map(supplier => this.toResponseDto(supplier)),
      total: result.total,
      page,
      limit,
    };
  }

  async findActiveSuppliers(): Promise<SupplierResponseDto[]> {
    const suppliers = await this.getActiveSuppliersUseCase.execute();
    return suppliers.map(supplier => this.toResponseDto(supplier));
  }

  async findOne(id: string): Promise<SupplierResponseDto> {
    try {
      const supplier = await this.getSupplierUseCase.execute(id);
      if (!supplier) {
        throw new NotFoundException('Supplier not found');
      }
      return this.toResponseDto(supplier);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleDomainError(error, 'findOne');
    }
  }

  async update(id: string, updateSupplierDto: UpdateSupplierDto, userId: string): Promise<SupplierResponseDto> {
    try {
      const supplier = await this.updateSupplierUseCase.execute(id, updateSupplierDto);
      return this.toResponseDto(supplier);
    } catch (error) {
      this.handleDomainError(error, 'update');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.deleteSupplierUseCase.execute(id);
    } catch (error) {
      this.handleDomainError(error, 'remove');
    }
  }

  private toResponseDto(supplier: any): SupplierResponseDto {
    return {
      id: supplier.id,
      name: supplier.name,
      contact_person: supplier.contactPerson,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      tax_code: supplier.taxCode,
      payment_terms: supplier.paymentTerms,
      bank_name: supplier.bankName,
      bank_account_name: supplier.bankAccountName,
      bank_account_number: supplier.bankAccountNumber,
      credit_limit: supplier.creditLimit,
      is_active: supplier.isActive,
      notes: supplier.notes,
      created_at: supplier.createdAt,
      updated_at: supplier.updatedAt,
    };
  }

  private handleDomainError(error: unknown, context: string): never {
    if (error instanceof SupplierNameAlreadyExistsError || error instanceof SupplierTaxCodeAlreadyExistsError) {
      throw new ConflictException({
        message: error.message,
        code: error.code,
      });
    }

    if (error instanceof SupplierNotFoundError) {
      throw new NotFoundException({
        message: error.message,
        code: error.code,
      });
    }

    if (error instanceof SupplierDomainError) {
      // Fallback for other domain errors
      throw new BadRequestException({
        message: error.message,
        code: error.code,
      });
    }

    if (error instanceof BadRequestException || error instanceof ConflictException || error instanceof NotFoundException) {
      throw error;
    }

    this.logger.error(`Unexpected error in SupplierService.${context}`, error instanceof Error ? error.stack : String(error));
    throw new InternalServerErrorException('Unexpected supplier service error');
  }
}
