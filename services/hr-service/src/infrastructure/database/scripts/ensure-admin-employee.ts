import { DataSource } from 'typeorm';
import { Employee } from '../entities/employee.entity';
import { Department } from '../entities/department.entity';
import { Position } from '../entities/position.entity';

/**
 * Script to ensure admin user (user_id = 7) has an employee record
 * Run this script after database migrations
 */
export async function ensureAdminEmployee(dataSource: DataSource): Promise<void> {
  const employeeRepository = dataSource.getRepository(Employee);
  const departmentRepository = dataSource.getRepository(Department);
  const positionRepository = dataSource.getRepository(Position);

  // Check if employee with user_id = 7 already exists
  const existingEmployee = await employeeRepository.findOne({
    where: { user_id: 7 },
  });

  if (existingEmployee) {
    console.log('✅ Admin employee record already exists (ID:', existingEmployee.id, ')');
    return;
  }

  // Get first department and position (or create defaults)
  let department = await departmentRepository.findOne({});
  let position = await positionRepository.findOne({});

  // Create employee record for admin
  const adminEmployee = employeeRepository.create({
    employee_code: 'ADMIN001',
    user_id: 7,
    first_name: 'Admin',
    last_name: 'User',
    gender: 'MALE',
    phone: '0000000000',
    email: 'admin@digierp.com',
    department_id: department?.id || null,
    position_id: position?.id || null,
    hire_date: new Date(),
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  });

  const saved = await employeeRepository.save(adminEmployee);
  console.log('✅ Created admin employee record (ID:', saved.id, ')');
}

