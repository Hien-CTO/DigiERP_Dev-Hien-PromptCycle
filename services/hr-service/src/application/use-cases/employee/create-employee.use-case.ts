import { Injectable, ConflictException } from '@nestjs/common';
import { EmployeeRepository } from '@/infrastructure/database/repositories/employee.repository';
import { CreateEmployeeDto } from '@/application/dtos/employee.dto';
import { Employee } from '@/infrastructure/database/entities/employee.entity';

@Injectable()
export class CreateEmployeeUseCase {
  constructor(private readonly employeeRepository: EmployeeRepository) {}

  async execute(createEmployeeDto: CreateEmployeeDto, createdBy: number): Promise<Employee> {
    // Check if employee code already exists
    const existingEmployee = await this.employeeRepository.findByEmployeeCode(createEmployeeDto.employee_code);
    if (existingEmployee) {
      throw new ConflictException(`Employee with code ${createEmployeeDto.employee_code} already exists`);
    }

    // Check if ID card number already exists (if provided)
    if (createEmployeeDto.id_card_number) {
      // This would require a separate method, but for now we'll skip this check
    }

    const employee = await this.employeeRepository.create({
      ...createEmployeeDto,
      hire_date: new Date(createEmployeeDto.hire_date),
      probation_end_date: createEmployeeDto.probation_end_date ? new Date(createEmployeeDto.probation_end_date) : null,
      date_of_birth: createEmployeeDto.date_of_birth ? new Date(createEmployeeDto.date_of_birth) : null,
      id_card_issued_date: createEmployeeDto.id_card_issued_date ? new Date(createEmployeeDto.id_card_issued_date) : null,
      created_by: createdBy,
      updated_by: createdBy,
      is_active: true,
    });

    return await this.employeeRepository.findById(employee.id);
  }
}

