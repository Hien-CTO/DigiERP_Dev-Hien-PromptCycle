import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceConfiguration } from '../entities/attendance-configuration.entity';

@Injectable()
export class AttendanceConfigurationRepository {
  constructor(
    @InjectRepository(AttendanceConfiguration)
    private readonly repository: Repository<AttendanceConfiguration>,
  ) {}

  async findGlobal(): Promise<AttendanceConfiguration | null> {
    return await this.repository.findOne({
      where: {
        config_type: 'GLOBAL',
        is_active: true,
      },
    });
  }

  async findByDepartment(departmentId: number): Promise<AttendanceConfiguration | null> {
    return await this.repository.findOne({
      where: {
        config_type: 'DEPARTMENT',
        department_id: departmentId,
        is_active: true,
      },
    });
  }

  async findByPosition(positionId: number): Promise<AttendanceConfiguration | null> {
    return await this.repository.findOne({
      where: {
        config_type: 'POSITION',
        position_id: positionId,
        is_active: true,
      },
    });
  }

  /**
   * Get configuration for employee (priority: POSITION > DEPARTMENT > GLOBAL)
   */
  async getConfigurationForEmployee(
    departmentId?: number,
    positionId?: number,
  ): Promise<AttendanceConfiguration | null> {
    // Try POSITION first
    if (positionId) {
      const positionConfig = await this.findByPosition(positionId);
      if (positionConfig) return positionConfig;
    }

    // Try DEPARTMENT
    if (departmentId) {
      const departmentConfig = await this.findByDepartment(departmentId);
      if (departmentConfig) return departmentConfig;
    }

    // Fallback to GLOBAL
    return await this.findGlobal();
  }

  async create(configData: Partial<AttendanceConfiguration>): Promise<AttendanceConfiguration> {
    const config = this.repository.create(configData);
    return await this.repository.save(config);
  }

  async update(id: number, configData: Partial<AttendanceConfiguration>): Promise<AttendanceConfiguration | null> {
    await this.repository.update(id, configData);
    return await this.repository.findOne({ where: { id } });
  }
}

