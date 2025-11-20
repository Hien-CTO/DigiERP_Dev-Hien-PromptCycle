import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PackagingType } from '../../infrastructure/database/entities/packaging-type.entity';
import { CreatePackagingTypeDto, UpdatePackagingTypeDto, PackagingTypeResponseDto } from '../dtos/packaging-type.dto';

@Injectable()
export class PackagingTypeService {
  constructor(
    @InjectRepository(PackagingType)
    private readonly packagingTypeRepository: Repository<PackagingType>,
  ) {}

  async create(createPackagingTypeDto: CreatePackagingTypeDto): Promise<PackagingTypeResponseDto> {
    // Check if packaging type with same name already exists
    const existingPackagingType = await this.packagingTypeRepository.findOne({
      where: { name: createPackagingTypeDto.name },
    });

    if (existingPackagingType) {
      throw new ConflictException(`PackagingType with name ${createPackagingTypeDto.name} already exists`);
    }

    const now = new Date();
    const packagingType = this.packagingTypeRepository.create({
      name: createPackagingTypeDto.name,
      display_name: createPackagingTypeDto.displayName,
      description: createPackagingTypeDto.description,
      is_active: createPackagingTypeDto.isActive ?? true,
      sort_order: createPackagingTypeDto.sortOrder ?? 0,
      created_at: now,
      updated_at: now,
    });

    const savedPackagingType = await this.packagingTypeRepository.save(packagingType);
    return this.mapToResponseDto(savedPackagingType);
  }

  async findAll(options: {
    page: number;
    limit: number;
    search?: string;
    isActive?: boolean;
  }): Promise<{ packagingTypes: PackagingTypeResponseDto[]; total: number; page: number; limit: number; totalPages: number }> {
    const safePage = Math.max(options.page ?? 1, 1);
    const safeLimit = Math.max(options.limit ?? 10, 1);
    const { search, isActive } = options;
    const queryBuilder = this.packagingTypeRepository.createQueryBuilder('packagingType');

    if (search) {
      queryBuilder.where(
        '(packagingType.name LIKE :search OR packagingType.display_name LIKE :search OR packagingType.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('packagingType.is_active = :isActive', { isActive });
    }

    const [packagingTypes, total] = await queryBuilder
      .orderBy('packagingType.sort_order', 'ASC')
      .addOrderBy('packagingType.name', 'ASC')
      .skip((safePage - 1) * safeLimit)
      .take(safeLimit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / safeLimit);

    return {
      packagingTypes: packagingTypes.map(pt => this.mapToResponseDto(pt)),
      total,
      page: safePage,
      limit: safeLimit,
      totalPages,
    };
  }

  async findOne(id: number): Promise<PackagingTypeResponseDto> {
    const packagingType = await this.packagingTypeRepository.findOne({ where: { id } });
    if (!packagingType) {
      throw new NotFoundException(`PackagingType with ID ${id} not found`);
    }
    return this.mapToResponseDto(packagingType);
  }

  async update(id: number, updatePackagingTypeDto: UpdatePackagingTypeDto): Promise<PackagingTypeResponseDto> {
    const packagingType = await this.packagingTypeRepository.findOne({ where: { id } });
    if (!packagingType) {
      throw new NotFoundException(`PackagingType with ID ${id} not found`);
    }

    // Check if new name conflicts with existing packaging types
    if (updatePackagingTypeDto.name && updatePackagingTypeDto.name !== packagingType.name) {
      const existingPackagingType = await this.packagingTypeRepository.findOne({
        where: { name: updatePackagingTypeDto.name },
      });
      if (existingPackagingType) {
        throw new ConflictException(`PackagingType with name ${updatePackagingTypeDto.name} already exists`);
      }
    }

    const updateData: Partial<PackagingType> = {};
    if (updatePackagingTypeDto.name !== undefined) updateData.name = updatePackagingTypeDto.name;
    if (updatePackagingTypeDto.displayName !== undefined) updateData.display_name = updatePackagingTypeDto.displayName;
    if (updatePackagingTypeDto.description !== undefined) updateData.description = updatePackagingTypeDto.description;
    if (updatePackagingTypeDto.isActive !== undefined) updateData.is_active = updatePackagingTypeDto.isActive;
    if (updatePackagingTypeDto.sortOrder !== undefined) updateData.sort_order = updatePackagingTypeDto.sortOrder;
    updateData.updated_at = new Date();

    Object.assign(packagingType, updateData);
    const updatedPackagingType = await this.packagingTypeRepository.save(packagingType);
    return this.mapToResponseDto(updatedPackagingType);
  }

  async remove(id: number): Promise<void> {
    const packagingType = await this.packagingTypeRepository.findOne({ where: { id } });
    if (!packagingType) {
      throw new NotFoundException(`PackagingType with ID ${id} not found`);
    }

    // Soft delete by setting is_active to false
    packagingType.is_active = false;
    await this.packagingTypeRepository.save(packagingType);
  }

  private mapToResponseDto(packagingType: PackagingType): PackagingTypeResponseDto {
    return {
      id: packagingType.id,
      name: packagingType.name,
      displayName: packagingType.display_name,
      description: packagingType.description,
      isActive: packagingType.is_active,
      sortOrder: packagingType.sort_order,
      createdAt: packagingType.created_at,
      updatedAt: packagingType.updated_at,
    };
  }
}


