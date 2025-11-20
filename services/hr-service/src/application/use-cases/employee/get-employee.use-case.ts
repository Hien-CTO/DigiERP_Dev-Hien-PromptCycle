import { Injectable, NotFoundException } from '@nestjs/common';
import { EmployeeRepository } from '@/infrastructure/database/repositories/employee.repository';
import { Employee } from '@/infrastructure/database/entities/employee.entity';

@Injectable()
export class GetEmployeeUseCase {
  constructor(private readonly employeeRepository: EmployeeRepository) {}

  async execute(id: number): Promise<Employee> {
    const employee = await this.employeeRepository.findById(id);
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return employee;
  }
}

