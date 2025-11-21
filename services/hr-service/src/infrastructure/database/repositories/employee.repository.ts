import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../entities/employee.entity';

@Injectable()
export class EmployeeRepository {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async findById(id: number): Promise<Employee | null> {
    return await this.employeeRepository.findOne({
      where: { id },
      relations: ['department', 'position', 'manager', 'status', 'contractType'],
    });
  }

  async findByUserId(userId: number): Promise<Employee | null> {
    return await this.employeeRepository.findOne({
      where: { user_id: userId },
      relations: ['department', 'position', 'manager', 'status', 'contractType'],
    });
  }

  async findByEmployeeCode(employeeCode: string): Promise<Employee | null> {
    return await this.employeeRepository.findOne({
      where: { employee_code: employeeCode },
      relations: ['department', 'position', 'manager', 'status', 'contractType'],
    });
  }

  async findAll(
    page: number = 1, 
    limit: number = 10, 
    search?: string,
    departmentId?: number,
    statusId?: number,
  ): Promise<{ employees: Employee[]; total: number }> {
    const queryBuilder = this.employeeRepository.createQueryBuilder('employee')
      .leftJoinAndSelect('employee.department', 'department')
      .leftJoinAndSelect('employee.position', 'position')
      .leftJoinAndSelect('employee.manager', 'manager')
      .leftJoinAndSelect('employee.status', 'status')
      .leftJoinAndSelect('employee.contractType', 'contractType');

    if (search) {
      queryBuilder.where(
        '(employee.employee_code LIKE :search OR employee.first_name LIKE :search OR employee.last_name LIKE :search OR employee.full_name LIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (departmentId) {
      queryBuilder.andWhere('employee.department_id = :departmentId', { departmentId });
    }

    if (statusId) {
      queryBuilder.andWhere('employee.status_id = :statusId', { statusId });
    }

    const [employees, total] = await queryBuilder
      .orderBy('employee.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { employees, total };
  }

  async countActive(): Promise<number> {
    return await this.employeeRepository.count({
      where: { is_active: true },
    });
  }

  async create(employeeData: Partial<Employee>): Promise<Employee> {
    const employee = this.employeeRepository.create(employeeData);
    return await this.employeeRepository.save(employee);
  }

  async update(id: number, employeeData: Partial<Employee>): Promise<Employee | null> {
    await this.employeeRepository.update(id, employeeData);
    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.employeeRepository.delete(id);
    return result.affected > 0;
  }
}

