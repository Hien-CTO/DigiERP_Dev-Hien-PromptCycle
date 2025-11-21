import { AppDataSource } from './src/infrastructure/database/config/data-source';
import { Employee } from './src/infrastructure/database/entities/employee.entity';
import { Department } from './src/infrastructure/database/entities/department.entity';
import { Position } from './src/infrastructure/database/entities/position.entity';

async function createAdminEmployee() {
  try {
    console.log('🔌 Connecting to database...');
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    console.log('✅ Connected to database');

    const employeeRepository = AppDataSource.getRepository(Employee);
    const departmentRepository = AppDataSource.getRepository(Department);
    const positionRepository = AppDataSource.getRepository(Position);

    // Check if employee with user_id = 7 already exists
    console.log('🔍 Checking if admin employee exists...');
    const existingEmployee = await employeeRepository.findOne({
      where: { user_id: 7 },
    });

    if (existingEmployee) {
      console.log('✅ Admin employee record already exists!');
      console.log(`   ID: ${existingEmployee.id}`);
      console.log(`   Code: ${existingEmployee.employee_code}`);
      console.log(`   Name: ${existingEmployee.first_name} ${existingEmployee.last_name}`);
      
      // Update if needed
      let updated = false;
      if (!existingEmployee.employee_code || existingEmployee.employee_code === '') {
        existingEmployee.employee_code = 'ADMIN001';
        updated = true;
      }
      if (!existingEmployee.first_name || existingEmployee.first_name === '') {
        existingEmployee.first_name = 'Admin';
        updated = true;
      }
      if (!existingEmployee.last_name || existingEmployee.last_name === '') {
        existingEmployee.last_name = 'User';
        updated = true;
      }
      if (!existingEmployee.is_active) {
        existingEmployee.is_active = true;
        updated = true;
      }
      
      if (updated) {
        existingEmployee.updated_at = new Date();
        await employeeRepository.save(existingEmployee);
        console.log('✅ Updated admin employee record');
      }
      
      await AppDataSource.destroy();
      return;
    }

    // Get first department and position (if any exist)
    console.log('🔍 Getting department and position...');
    const departments = await departmentRepository.find({ take: 1 });
    const positions = await positionRepository.find({ take: 1 });
    const department = departments.length > 0 ? departments[0] : null;
    const position = positions.length > 0 ? positions[0] : null;

    if (!department) {
      console.warn('⚠️  No department found. Employee will be created without department.');
    }
    if (!position) {
      console.warn('⚠️  No position found. Employee will be created without position.');
    }

    // Create employee record for admin
    console.log('➕ Creating admin employee record...');
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
    console.log('✅ Successfully created admin employee record!');
    console.log(`   ID: ${saved.id}`);
    console.log(`   Code: ${saved.employee_code}`);
    console.log(`   Name: ${saved.first_name} ${saved.last_name}`);
    console.log(`   User ID: ${saved.user_id}`);

    await AppDataSource.destroy();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error creating admin employee:', error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
}

createAdminEmployee();

