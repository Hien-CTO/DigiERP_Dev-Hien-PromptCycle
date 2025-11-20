import { Injectable } from '@nestjs/common';
import { EmployeeRepository } from '@/infrastructure/database/repositories/employee.repository';
import { Employee } from '@/infrastructure/database/entities/employee.entity';

@Injectable()
export class GetEmployeesUseCase {
  constructor(private readonly employeeRepository: EmployeeRepository) {}

  async execute(
    page: number = 1, 
    limit: number = 10, 
    search?: string,
    departmentId?: number,
    statusId?: number,
  ): Promise<{ employees: Employee[]; total: number; page: number; limit: number }> {
    const result = await this.employeeRepository.findAll(page, limit, search, departmentId, statusId);
    return {
      ...result,
      page,
      limit,
    };
  }
}

