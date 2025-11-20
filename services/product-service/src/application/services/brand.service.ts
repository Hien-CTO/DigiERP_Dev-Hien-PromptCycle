import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from '../../infrastructure/database/entities/brand.entity';
import { CreateBrandDto, UpdateBrandDto, BrandResponseDto } from '../dtos/brand.dto';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}

  async create(createBrandDto: CreateBrandDto): Promise<BrandResponseDto> {
    // Check if brand with same code already exists
    const existingBrand = await this.brandRepository.findOne({
      where: { code: createBrandDto.code },
    });

    if (existingBrand) {
      throw new ConflictException(`Brand with code ${createBrandDto.code} already exists`);
    }

    const brand = this.brandRepository.create(createBrandDto);
    const savedBrand = await this.brandRepository.save(brand);
    return this.mapToResponseDto(savedBrand);
  }

  async findAll(options: {
    page: number;
    limit: number;
    search?: string;
    isActive?: boolean;
  }): Promise<{ brands: BrandResponseDto[]; total: number; page: number; limit: number; totalPages: number }> {
    const safePage = Math.max(options.page ?? 1, 1);
    const safeLimit = Math.max(options.limit ?? 10, 1);
    const { search, isActive } = options;
    const queryBuilder = this.brandRepository.createQueryBuilder('brand');

    if (search) {
      queryBuilder.where(
        '(brand.name LIKE :search OR brand.code LIKE :search OR brand.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('brand.is_active = :isActive', { isActive });
    }

    const [brands, total] = await queryBuilder
      .orderBy('brand.name', 'ASC')
      .skip((safePage - 1) * safeLimit)
      .take(safeLimit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / safeLimit);

    return {
      brands: brands.map(brand => this.mapToResponseDto(brand)),
      total,
      page: safePage,
      limit: safeLimit,
      totalPages,
    };
  }

  async findOne(id: number): Promise<BrandResponseDto> {
    const brand = await this.brandRepository.findOne({ where: { id } });
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }
    return this.mapToResponseDto(brand);
  }

  async update(id: number, updateBrandDto: UpdateBrandDto): Promise<BrandResponseDto> {
    const brand = await this.brandRepository.findOne({ where: { id } });
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }

    // Check if new code conflicts with existing brands
    if (updateBrandDto.code && updateBrandDto.code !== brand.code) {
      const existingBrand = await this.brandRepository.findOne({
        where: { code: updateBrandDto.code },
      });
      if (existingBrand) {
        throw new ConflictException(`Brand with code ${updateBrandDto.code} already exists`);
      }
    }

    Object.assign(brand, {
      ...updateBrandDto,
      updated_at: new Date(),
    });
    const updatedBrand = await this.brandRepository.save(brand);
    return this.mapToResponseDto(updatedBrand);
  }

  async remove(id: number): Promise<void> {
    const brand = await this.brandRepository.findOne({ where: { id } });
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }

    await this.brandRepository.remove(brand);
  }

  async activate(id: number): Promise<BrandResponseDto> {
    const brand = await this.brandRepository.findOne({ where: { id } });
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }

    brand.is_active = true;
    const updatedBrand = await this.brandRepository.save(brand);
    return this.mapToResponseDto(updatedBrand);
  }

  async deactivate(id: number): Promise<BrandResponseDto> {
    const brand = await this.brandRepository.findOne({ where: { id } });
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }

    brand.is_active = false;
    const updatedBrand = await this.brandRepository.save(brand);
    return this.mapToResponseDto(updatedBrand);
  }

  private mapToResponseDto(brand: Brand): BrandResponseDto {
    return {
      id: brand.id,
      code: brand.code,
      name: brand.name,
      description: brand.description,
      logo_url: brand.logo_url,
      website: brand.website,
      is_active: brand.is_active,
      created_at: brand.created_at,
      updated_at: brand.updated_at,
      created_by: brand.created_by,
      updated_by: brand.updated_by,
    };
  }
}
