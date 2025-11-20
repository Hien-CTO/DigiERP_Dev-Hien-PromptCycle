import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeRepository } from '@/infrastructure/database/repositories/employee.repository';
import { CreateEmployeeUseCase } from '@/application/use-cases/employee/create-employee.use-case';
import { GetEmployeeUseCase } from '@/application/use-cases/employee/get-employee.use-case';
import { GetEmployeesUseCase } from '@/application/use-cases/employee/get-employees.use-case';
import { CreateEmployeeDto, EmployeeResponseDto } from '@/application/dtos/employee.dto';
import { Department } from '@/infrastructure/database/entities/department.entity';

@ApiTags('Employees')
@ApiBearerAuth()
@Controller('employees')
export class EmployeeController {
  constructor(
    private readonly createEmployeeUseCase: CreateEmployeeUseCase,
    private readonly getEmployeeUseCase: GetEmployeeUseCase,
    private readonly getEmployeesUseCase: GetEmployeesUseCase,
    private readonly employeeRepository: EmployeeRepository,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new employee' })
  async create(@Body() createEmployeeDto: CreateEmployeeDto) {
    // TODO: Get current user from JWT token
    const createdBy = 1; // Temporary
    return await this.createEmployeeUseCase.execute(createEmployeeDto, createdBy);
  }

  @Get()
  @ApiOperation({ summary: 'Get all employees' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'departmentId', required: false, type: Number })
  @ApiQuery({ name: 'statusId', required: false, type: Number })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('departmentId') departmentId?: string,
    @Query('statusId') statusId?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const deptId = departmentId ? parseInt(departmentId, 10) : undefined;
    const statId = statusId ? parseInt(statusId, 10) : undefined;
    return await this.getEmployeesUseCase.execute(pageNum, limitNum, search, deptId, statId);
  }

  @Get('stats/summary')
  @ApiOperation({ summary: 'Get employee statistics' })
  async getStats() {
    const activeCount = await this.employeeRepository.countActive();
    const totalDepartments = await this.departmentRepository.count({
      where: { is_active: true },
    });
    return { activeEmployees: activeCount, totalDepartments };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.getEmployeeUseCase.execute(id);
  }
}

