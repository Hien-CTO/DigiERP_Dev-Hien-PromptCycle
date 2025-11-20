import { Injectable } from '@nestjs/common';
import { AreaRepository } from '../../../infrastructure/database/repositories/area.repository';

@Injectable()
export class DeleteAreaUseCase {
  constructor(private readonly areaRepository: AreaRepository) {}

  async execute(id: number): Promise<void> {
    // Check if area exists
    const existingArea = await this.areaRepository.findById(id);
    if (!existingArea) {
      throw new Error('Area not found');
    }

    // TODO: Check if area has any inventory before deletion
    // This would require additional repository methods to check dependencies

    await this.areaRepository.delete(id);
  }
}
