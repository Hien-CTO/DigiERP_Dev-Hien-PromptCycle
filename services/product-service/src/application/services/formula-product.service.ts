import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FormulaProduct } from '../../infrastructure/database/entities/formula-product.entity';
import { CreateFormulaProductDto, UpdateFormulaProductDto, FormulaProductResponseDto } from '../dtos/formula-product.dto';

@Injectable()
export class FormulaProductService {
  constructor(
    @InjectRepository(FormulaProduct)
    private readonly formulaProductRepository: Repository<FormulaProduct>,
  ) {}

  async create(createFormulaProductDto: CreateFormulaProductDto): Promise<FormulaProductResponseDto> {
    // Check if formula product with same code already exists
    const existingFormulaProduct = await this.formulaProductRepository.findOne({
      where: { code: createFormulaProductDto.code },
    });

    if (existingFormulaProduct) {
      throw new ConflictException(`FormulaProduct with code ${createFormulaProductDto.code} already exists`);
    }

    const now = new Date();
    const formulaProduct = this.formulaProductRepository.create({
      ...createFormulaProductDto,
      created_at: now,
      updated_at: now,
    });
    const savedFormulaProduct = await this.formulaProductRepository.save(formulaProduct);
    return this.mapToResponseDto(savedFormulaProduct);
  }

  async findAll(options: {
    page: number;
    limit: number;
    search?: string;
    brandId?: number;
    isActive?: boolean;
  }): Promise<{ models: FormulaProductResponseDto[]; total: number; page: number; limit: number; totalPages: number }> {
    const safePage = Math.max(options.page ?? 1, 1);
    const safeLimit = Math.max(options.limit ?? 10, 1);
    const { search, brandId, isActive } = options;
    const queryBuilder = this.formulaProductRepository.createQueryBuilder('formulaProduct');

    if (search) {
      queryBuilder.where(
        '(formulaProduct.name LIKE :search OR formulaProduct.code LIKE :search OR formulaProduct.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (brandId) {
      queryBuilder.andWhere('formulaProduct.brand_id = :brandId', { brandId });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('formulaProduct.is_active = :isActive', { isActive });
    }

    const [formulaProducts, total] = await queryBuilder
      .leftJoinAndSelect('formulaProduct.brand', 'brand')
      .orderBy('formulaProduct.name', 'ASC')
      .skip((safePage - 1) * safeLimit)
      .take(safeLimit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / safeLimit);

    return {
      models: formulaProducts.map(formulaProduct => this.mapToResponseDto(formulaProduct)),
      total,
      page: safePage,
      limit: safeLimit,
      totalPages,
    };
  }

  async findOne(id: number): Promise<FormulaProductResponseDto> {
    const formulaProduct = await this.formulaProductRepository.findOne({ 
      where: { id },
      relations: ['brand'],
    });
    if (!formulaProduct) {
      throw new NotFoundException(`FormulaProduct with ID ${id} not found`);
    }
    return this.mapToResponseDto(formulaProduct);
  }

  async update(id: number, updateFormulaProductDto: UpdateFormulaProductDto): Promise<FormulaProductResponseDto> {
    const formulaProduct = await this.formulaProductRepository.findOne({ where: { id } });
    if (!formulaProduct) {
      throw new NotFoundException(`FormulaProduct with ID ${id} not found`);
    }

    // Check if new code conflicts with existing formula products
    if (updateFormulaProductDto.code && updateFormulaProductDto.code !== formulaProduct.code) {
      const existingFormulaProduct = await this.formulaProductRepository.findOne({
        where: { code: updateFormulaProductDto.code },
      });
      if (existingFormulaProduct) {
        throw new ConflictException(`FormulaProduct with code ${updateFormulaProductDto.code} already exists`);
      }
    }

    Object.assign(formulaProduct, {
      ...updateFormulaProductDto,
      updated_at: new Date(),
    });
    const updatedFormulaProduct = await this.formulaProductRepository.save(formulaProduct);
    // Load relation after update
    const formulaProductWithRelations = await this.formulaProductRepository.findOne({
      where: { id: updatedFormulaProduct.id },
      relations: ['brand'],
    });
    return this.mapToResponseDto(formulaProductWithRelations || updatedFormulaProduct);
  }

  async remove(id: number): Promise<void> {
    const formulaProduct = await this.formulaProductRepository.findOne({ where: { id } });
    if (!formulaProduct) {
      throw new NotFoundException(`FormulaProduct with ID ${id} not found`);
    }

    await this.formulaProductRepository.remove(formulaProduct);
  }

  private mapToResponseDto(formulaProduct: FormulaProduct): FormulaProductResponseDto {
    return {
      id: formulaProduct.id,
      code: formulaProduct.code,
      name: formulaProduct.name,
      description: formulaProduct.description,
      brand_id: formulaProduct.brand_id,
      brand: formulaProduct.brand ? {
        id: formulaProduct.brand.id,
        name: formulaProduct.brand.name,
        code: formulaProduct.brand.code,
      } : undefined,
      is_active: formulaProduct.is_active,
      created_at: formulaProduct.created_at,
      updated_at: formulaProduct.updated_at,
      created_by: formulaProduct.created_by,
      updated_by: formulaProduct.updated_by,
    };
  }
}

