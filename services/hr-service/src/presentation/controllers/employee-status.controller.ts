import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatEmployeeStatus } from '@/infrastructure/database/entities/cat-employee-status.entity';

@ApiTags('Employee Status')
@ApiBearerAuth()
@Controller('employee-status')
export class EmployeeStatusController {
  constructor(
    @InjectRepository(CatEmployeeStatus)
    private readonly statusRepository: Repository<CatEmployeeStatus>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all employee statuses' })
  async findAll() {
    const statuses = await this.statusRepository.find({
      where: { is_active: true },
      order: { sort_order: 'ASC' },
    });
    return { statuses };
  }
}

