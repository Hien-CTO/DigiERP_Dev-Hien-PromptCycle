import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '@/infrastructure/database/entities/department.entity';

@ApiTags('Departments')
@ApiBearerAuth()
@Controller('departments')
export class DepartmentController {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all departments' })
  async findAll() {
    const departments = await this.departmentRepository.find({
      where: { is_active: true },
      order: { name: 'ASC' },
    });
    return { departments };
  }
}

