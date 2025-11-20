import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Area as AreaEntity } from '../entities/area.entity';
import { AreaRepository as IAreaRepository } from '../../../domain/repositories/area.repository.interface';
import { Area } from '../../../domain/entities/area.entity';

@Injectable()
export class AreaRepository implements IAreaRepository {
  constructor(
    @InjectRepository(AreaEntity)
    private readonly areaRepo: Repository<AreaEntity>,
  ) {}

  async findById(id: number): Promise<Area | null> {
    const area = await this.areaRepo.findOne({ where: { id } });
    return area ? this.toDomain(area) : null;
  }

  async findAll(page: number = 1, limit: number = 10, search?: string, warehouseId?: number): Promise<{ areas: Area[]; total: number }> {
    const queryBuilder = this.areaRepo.createQueryBuilder('area');

    if (search) {
      queryBuilder.where(
        '(area.name LIKE :search OR area.code LIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (warehouseId) {
      queryBuilder.andWhere('area.warehouse_id = :warehouseId', { warehouseId });
    }

    const [areas, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('area.created_at', 'DESC')
      .getManyAndCount();

    return {
      areas: areas.map(area => this.toDomain(area)),
      total,
    };
  }

  async findByCode(code: string): Promise<Area | null> {
    const area = await this.areaRepo.findOne({ where: { code } });
    return area ? this.toDomain(area) : null;
  }

  async findByWarehouse(warehouseId: number): Promise<Area[]> {
    const areas = await this.areaRepo.find({ where: { warehouse_id: warehouseId } });
    return areas.map(area => this.toDomain(area));
  }

  async create(area: Partial<Area>): Promise<Area> {
    const newArea = this.areaRepo.create(area);
    const savedArea = await this.areaRepo.save(newArea);
    return this.toDomain(savedArea);
  }

  async update(id: number, area: Partial<Area>): Promise<Area> {
    await this.areaRepo.update(id, area);
    const updatedArea = await this.areaRepo.findOne({ where: { id } });
    return this.toDomain(updatedArea!);
  }

  async delete(id: number): Promise<void> {
    await this.areaRepo.delete(id);
  }

  async findByType(type: string): Promise<Area[]> {
    const areas = await this.areaRepo.find({ where: { type } });
    return areas.map(area => this.toDomain(area));
  }

  async findByStatus(status: string): Promise<Area[]> {
    const areas = await this.areaRepo.find({ where: { status } });
    return areas.map(area => this.toDomain(area));
  }

  private toDomain(area: AreaEntity): Area {
    return {
      id: area.id,
      name: area.name,
      code: area.code,
      description: area.description,
      warehouseId: area.warehouse_id,
      type: area.type as any,
      status: area.status as any,
      capacity: area.capacity,
      currentUtilization: Number(area.current_utilization),
      temperature: Number(area.temperature),
      humidity: Number(area.humidity),
      notes: area.notes,
      createdAt: area.created_at,
      updatedAt: area.updated_at,
      createdBy: area.created_by,
      updatedBy: area.updated_by,
    };
  }
}
