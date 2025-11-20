import { Injectable } from '@nestjs/common';
import { AreaRepository } from '../../../infrastructure/database/repositories/area.repository';
import { Area } from '../../../domain/entities/area.entity';

@Injectable()
export class GetAreasUseCase {
  constructor(private readonly areaRepository: AreaRepository) {}

  async execute(
    page: number = 1,
    limit: number = 10,
    search?: string,
    warehouseId?: number,
  ): Promise<{ areas: Area[]; total: number; page: number; limit: number }> {
    const result = await this.areaRepository.findAll(page, limit, search, warehouseId);
    return {
      ...result,
      page,
      limit,
    };
  }
}
