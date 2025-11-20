import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from '../../infrastructure/database/entities/unit.entity';
import { CreateUnitDto, UpdateUnitDto, UnitResponseDto, UnitType } from '../dtos/unit.dto';

@Injectable()
export class UnitService {
  constructor(
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
  ) {}

  async create(createUnitDto: CreateUnitDto): Promise<UnitResponseDto> {
    // Check if unit with same code already exists
    const existingUnit = await this.unitRepository.findOne({
      where: { code: createUnitDto.code },
    });

    if (existingUnit) {
      throw new ConflictException(`Unit with code ${createUnitDto.code} already exists`);
    }

    const now = new Date();
    const unit = this.unitRepository.create({
      ...createUnitDto,
      created_at: now,
      updated_at: now,
    });
    const savedUnit = await this.unitRepository.save(unit);
    return this.mapToResponseDto(savedUnit);
  }

  async findAll(options: {
    page: number;
    limit: number;
    search?: string;
    type?: string;
    isActive?: boolean;
  }): Promise<{ units: UnitResponseDto[]; total: number; page: number; limit: number; totalPages: number }> {
    const safePage = Math.max(options.page ?? 1, 1);
    const safeLimit = Math.max(options.limit ?? 10, 1);
    const { search, type, isActive } = options;
    const queryBuilder = this.unitRepository.createQueryBuilder('unit');

    if (search) {
      queryBuilder.where(
        '(unit.name LIKE :search OR unit.code LIKE :search OR unit.symbol LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (type) {
      queryBuilder.andWhere('unit.type = :type', { type });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('unit.is_active = :isActive', { isActive });
    }

    const [units, total] = await queryBuilder
      .orderBy('unit.name', 'ASC')
      .skip((safePage - 1) * safeLimit)
      .take(safeLimit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / safeLimit);

    return {
      units: units.map(unit => this.mapToResponseDto(unit)),
      total,
      page: safePage,
      limit: safeLimit,
      totalPages,
    };
  }

  async findOne(id: number): Promise<UnitResponseDto> {
    const unit = await this.unitRepository.findOne({ where: { id } });
    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }
    return this.mapToResponseDto(unit);
  }

  async update(id: number, updateUnitDto: UpdateUnitDto): Promise<UnitResponseDto> {
    const unit = await this.unitRepository.findOne({ where: { id } });
    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }

    // Check if new code conflicts with existing units
    if (updateUnitDto.code && updateUnitDto.code !== unit.code) {
      const existingUnit = await this.unitRepository.findOne({
        where: { code: updateUnitDto.code },
      });
      if (existingUnit) {
        throw new ConflictException(`Unit with code ${updateUnitDto.code} already exists`);
      }
    }

    Object.assign(unit, {
      ...updateUnitDto,
      updated_at: new Date(),
    });
    const updatedUnit = await this.unitRepository.save(unit);
    return this.mapToResponseDto(updatedUnit);
  }

  async remove(id: number): Promise<void> {
    const unit = await this.unitRepository.findOne({ where: { id } });
    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }

    await this.unitRepository.remove(unit);
  }

  async findByType(type: UnitType): Promise<UnitResponseDto[]> {
    const units = await this.unitRepository.find({
      where: { type, is_active: true },
      order: { name: 'ASC' },
    });
    return units.map(unit => this.mapToResponseDto(unit));
  }

  private mapToResponseDto(unit: Unit): UnitResponseDto {
    return {
      id: unit.id,
      code: unit.code,
      name: unit.name,
      symbol: unit.symbol,
      type: unit.type as UnitType,
      is_active: unit.is_active,
      created_at: unit.created_at,
      updated_at: unit.updated_at,
      created_by: unit.created_by,
      updated_by: unit.updated_by,
    };
  }
}
