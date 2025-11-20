import { Injectable } from '@nestjs/common';
import { AreaRepository } from '../../../infrastructure/database/repositories/area.repository';
import { UpdateAreaDto } from '../../dtos/area.dto';
import { Area } from '../../../domain/entities/area.entity';

@Injectable()
export class UpdateAreaUseCase {
  constructor(private readonly areaRepository: AreaRepository) {}

  async execute(
    id: number,
    updateAreaDto: UpdateAreaDto,
    userId: number,
  ): Promise<Area> {
    // Check if area exists
    const existingArea = await this.areaRepository.findById(id);
    if (!existingArea) {
      throw new Error('Area not found');
    }

    // Check if new code already exists (if code is being updated)
    if (updateAreaDto.code && updateAreaDto.code !== existingArea.code) {
      const areaWithCode = await this.areaRepository.findByCode(updateAreaDto.code);
      if (areaWithCode) {
        throw new Error('Area code already exists');
      }
    }

    const updatedArea = await this.areaRepository.update(id, {
      ...updateAreaDto,
      updatedBy: userId,
      updatedAt: new Date(),
    });

    return updatedArea;
  }
}
