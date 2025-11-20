import { Injectable } from '@nestjs/common';
import { AreaRepository } from '../../../infrastructure/database/repositories/area.repository';
import { CreateAreaDto } from '../../dtos/area.dto';
import { Area } from '../../../domain/entities/area.entity';

@Injectable()
export class CreateAreaUseCase {
  constructor(private readonly areaRepository: AreaRepository) {}

  async execute(createAreaDto: CreateAreaDto, userId: number): Promise<Area> {
    // Check if area code already exists
    const existingArea = await this.areaRepository.findByCode(createAreaDto.code);
    if (existingArea) {
      throw new Error('Area code already exists');
    }

    const area = await this.areaRepository.create({
      ...createAreaDto,
      createdBy: userId,
      updatedBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return area;
  }
}
