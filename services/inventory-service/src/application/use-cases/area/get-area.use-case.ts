import { Injectable } from '@nestjs/common';
import { AreaRepository } from '../../../infrastructure/database/repositories/area.repository';
import { Area } from '../../../domain/entities/area.entity';

@Injectable()
export class GetAreaUseCase {
  constructor(private readonly areaRepository: AreaRepository) {}

  async execute(id: number): Promise<Area> {
    const area = await this.areaRepository.findById(id);
    if (!area) {
      throw new Error('Area not found');
    }
    return area;
  }
}
