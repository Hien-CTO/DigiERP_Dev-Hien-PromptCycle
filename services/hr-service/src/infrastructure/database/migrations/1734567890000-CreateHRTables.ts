import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateHRTables1734567890000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create cat_employee_status table
    await queryRunner.createTable(
      new Table({
        name: 'cat_employee_status',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'code', type: 'varchar', length: '20', isUnique: true },
          { name: 'name', type: 'varchar', length: '100' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'is_active', type: 'tinyint', default: 1 },
          { name: 'sort_order', type: 'int', default: 0 },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
          { name: 'created_by', type: 'int', isNullable: true },
          { name: 'updated_by', type: 'int', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('cat_employee_status', new TableIndex({ name: 'idx_code', columnNames: ['code'] }));
    await queryRunner.createIndex('cat_employee_status', new TableIndex({ name: 'idx_name', columnNames: ['name'] }));
    await queryRunner.createIndex('cat_employee_status', new TableIndex({ name: 'idx_is_active', columnNames: ['is_active'] }));

    // 2. Create cat_contract_types table
    await queryRunner.createTable(
      new Table({
        name: 'cat_contract_types',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'code', type: 'varchar', length: '20', isUnique: true },
          { name: 'name', type: 'varchar', length: '100' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'is_active', type: 'tinyint', default: 1 },
          { name: 'sort_order', type: 'int', default: 0 },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
          { name: 'created_by', type: 'int', isNullable: true },
          { name: 'updated_by', type: 'int', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('cat_contract_types', new TableIndex({ name: 'idx_code', columnNames: ['code'] }));
    await queryRunner.createIndex('cat_contract_types', new TableIndex({ name: 'idx_name', columnNames: ['name'] }));
    await queryRunner.createIndex('cat_contract_types', new TableIndex({ name: 'idx_is_active', columnNames: ['is_active'] }));

    // 3. Create cat_leave_types table
    await queryRunner.createTable(
      new Table({
        name: 'cat_leave_types',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'code', type: 'varchar', length: '20', isUnique: true },
          { name: 'name', type: 'varchar', length: '100' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'is_paid', type: 'tinyint', default: 1 },
          { name: 'max_days_per_year', type: 'int', isNullable: true },
          { name: 'requires_approval', type: 'tinyint', default: 1 },
          { name: 'is_active', type: 'tinyint', default: 1 },
          { name: 'sort_order', type: 'int', default: 0 },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
          { name: 'created_by', type: 'int', isNullable: true },
          { name: 'updated_by', type: 'int', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('cat_leave_types', new TableIndex({ name: 'idx_code', columnNames: ['code'] }));
    await queryRunner.createIndex('cat_leave_types', new TableIndex({ name: 'idx_name', columnNames: ['name'] }));
    await queryRunner.createIndex('cat_leave_types', new TableIndex({ name: 'idx_is_active', columnNames: ['is_active'] }));

    // 4. Create cat_attendance_types table
    await queryRunner.createTable(
      new Table({
        name: 'cat_attendance_types',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'code', type: 'varchar', length: '20', isUnique: true },
          { name: 'name', type: 'varchar', length: '100' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'is_active', type: 'tinyint', default: 1 },
          { name: 'sort_order', type: 'int', default: 0 },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
          { name: 'created_by', type: 'int', isNullable: true },
          { name: 'updated_by', type: 'int', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('cat_attendance_types', new TableIndex({ name: 'idx_code', columnNames: ['code'] }));
    await queryRunner.createIndex('cat_attendance_types', new TableIndex({ name: 'idx_name', columnNames: ['name'] }));
    await queryRunner.createIndex('cat_attendance_types', new TableIndex({ name: 'idx_is_active', columnNames: ['is_active'] }));

    // 5. Create departments table
    await queryRunner.createTable(
      new Table({
        name: 'departments',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'code', type: 'varchar', length: '20', isUnique: true },
          { name: 'name', type: 'varchar', length: '200' },
          { name: 'display_name', type: 'varchar', length: '200' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'parent_id', type: 'int', isNullable: true },
          { name: 'manager_id', type: 'int', isNullable: true },
          { name: 'budget', type: 'decimal', precision: 15, scale: 2, default: 0 },
          { name: 'is_active', type: 'tinyint', default: 1 },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
          { name: 'created_by', type: 'int', isNullable: true },
          { name: 'updated_by', type: 'int', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('departments', new TableIndex({ name: 'idx_code', columnNames: ['code'] }));
    await queryRunner.createIndex('departments', new TableIndex({ name: 'idx_name', columnNames: ['name'] }));
    await queryRunner.createIndex('departments', new TableIndex({ name: 'idx_parent_id', columnNames: ['parent_id'] }));
    await queryRunner.createIndex('departments', new TableIndex({ name: 'idx_manager_id', columnNames: ['manager_id'] }));
    await queryRunner.createIndex('departments', new TableIndex({ name: 'idx_is_active', columnNames: ['is_active'] }));

    // Add self-referencing FK for departments.parent_id
    await queryRunner.createForeignKey(
      'departments',
      new TableForeignKey({
        columnNames: ['parent_id'],
        referencedTableName: 'departments',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // 6. Create positions table
    await queryRunner.createTable(
      new Table({
        name: 'positions',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'code', type: 'varchar', length: '20', isUnique: true },
          { name: 'name', type: 'varchar', length: '200' },
          { name: 'display_name', type: 'varchar', length: '200' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'level', type: 'int', default: 1, comment: 'Cấp bậc: 1=Junior, 2=Middle, 3=Senior, 4=Lead, 5=Manager' },
          { name: 'requirements', type: 'text', isNullable: true, comment: 'Yêu cầu công việc' },
          { name: 'is_active', type: 'tinyint', default: 1 },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
          { name: 'created_by', type: 'int', isNullable: true },
          { name: 'updated_by', type: 'int', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('positions', new TableIndex({ name: 'idx_code', columnNames: ['code'] }));
    await queryRunner.createIndex('positions', new TableIndex({ name: 'idx_name', columnNames: ['name'] }));
    await queryRunner.createIndex('positions', new TableIndex({ name: 'idx_level', columnNames: ['level'] }));
    await queryRunner.createIndex('positions', new TableIndex({ name: 'idx_is_active', columnNames: ['is_active'] }));

    // 7. Create employees table
    await queryRunner.createTable(
      new Table({
        name: 'employees',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'employee_code', type: 'varchar', length: '50', isUnique: true, comment: 'Mã nhân viên' },
          { name: 'user_id', type: 'int', isNullable: true, comment: 'FK to users.id' },
          { name: 'first_name', type: 'varchar', length: '100' },
          { name: 'last_name', type: 'varchar', length: '100' },
          {
            name: 'full_name',
            type: 'varchar',
            length: '200',
            generatedType: 'STORED',
            asExpression: "CONCAT(first_name, ' ', last_name)",
          },
          { name: 'gender', type: 'enum', enum: ['MALE', 'FEMALE', 'OTHER'], isNullable: true },
          { name: 'date_of_birth', type: 'date', isNullable: true },
          { name: 'place_of_birth', type: 'varchar', length: '200', isNullable: true },
          { name: 'id_card_number', type: 'varchar', length: '20', isNullable: true, isUnique: true },
          { name: 'id_card_issued_date', type: 'date', isNullable: true },
          { name: 'id_card_issued_place', type: 'varchar', length: '200', isNullable: true },
          { name: 'permanent_address', type: 'text', isNullable: true, comment: 'Địa chỉ thường trú' },
          { name: 'temporary_address', type: 'text', isNullable: true, comment: 'Địa chỉ tạm trú' },
          { name: 'city', type: 'varchar', length: '100', isNullable: true },
          { name: 'province', type: 'varchar', length: '100', isNullable: true },
          { name: 'country', type: 'varchar', length: '100', default: "'Vietnam'" },
          { name: 'postal_code', type: 'varchar', length: '20', isNullable: true },
          { name: 'phone', type: 'varchar', length: '20', isNullable: true },
          { name: 'email', type: 'varchar', length: '255', isNullable: true },
          { name: 'emergency_contact_name', type: 'varchar', length: '200', isNullable: true },
          { name: 'emergency_contact_phone', type: 'varchar', length: '20', isNullable: true },
          { name: 'emergency_contact_relationship', type: 'varchar', length: '100', isNullable: true },
          { name: 'department_id', type: 'int', isNullable: true, comment: 'FK to departments.id' },
          { name: 'position_id', type: 'int', isNullable: true, comment: 'FK to positions.id' },
          { name: 'manager_id', type: 'int', isNullable: true, comment: 'FK to employees.id' },
          { name: 'hire_date', type: 'date', comment: 'Ngày vào làm' },
          { name: 'probation_end_date', type: 'date', isNullable: true, comment: 'Ngày kết thúc thử việc' },
          { name: 'resignation_date', type: 'date', isNullable: true, comment: 'Ngày nghỉ việc' },
          { name: 'status_id', type: 'int', isNullable: true, comment: 'FK to cat_employee_status.id' },
          { name: 'contract_type_id', type: 'int', isNullable: true, comment: 'FK to cat_contract_types.id' },
          { name: 'base_salary', type: 'decimal', precision: 15, scale: 2, default: 0 },
          { name: 'currency', type: 'varchar', length: '3', default: "'VND'" },
          { name: 'avatar_url', type: 'text', isNullable: true },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'is_active', type: 'tinyint', default: 1 },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
          { name: 'created_by', type: 'int', isNullable: true },
          { name: 'updated_by', type: 'int', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('employees', new TableIndex({ name: 'idx_employee_code', columnNames: ['employee_code'] }));
    await queryRunner.createIndex('employees', new TableIndex({ name: 'idx_user_id', columnNames: ['user_id'] }));
    await queryRunner.createIndex('employees', new TableIndex({ name: 'idx_department_id', columnNames: ['department_id'] }));
    await queryRunner.createIndex('employees', new TableIndex({ name: 'idx_position_id', columnNames: ['position_id'] }));
    await queryRunner.createIndex('employees', new TableIndex({ name: 'idx_manager_id', columnNames: ['manager_id'] }));
    await queryRunner.createIndex('employees', new TableIndex({ name: 'idx_status_id', columnNames: ['status_id'] }));
    await queryRunner.createIndex('employees', new TableIndex({ name: 'idx_hire_date', columnNames: ['hire_date'] }));
    await queryRunner.createIndex('employees', new TableIndex({ name: 'idx_is_active', columnNames: ['is_active'] }));
    await queryRunner.createIndex('employees', new TableIndex({ name: 'idx_full_name', columnNames: ['full_name'] }));

    // Add FKs for employees
    await queryRunner.createForeignKey(
      'employees',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'employees',
      new TableForeignKey({
        columnNames: ['department_id'],
        referencedTableName: 'departments',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'employees',
      new TableForeignKey({
        columnNames: ['position_id'],
        referencedTableName: 'positions',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'employees',
      new TableForeignKey({
        columnNames: ['manager_id'],
        referencedTableName: 'employees',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'employees',
      new TableForeignKey({
        columnNames: ['status_id'],
        referencedTableName: 'cat_employee_status',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'employees',
      new TableForeignKey({
        columnNames: ['contract_type_id'],
        referencedTableName: 'cat_contract_types',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // 8. Create contract_legal table
    await queryRunner.createTable(
      new Table({
        name: 'contract_legal',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'contract_number', type: 'varchar', length: '50', isUnique: true, comment: 'Số hợp đồng' },
          { name: 'employee_id', type: 'int', comment: 'FK to employees.id' },
          { name: 'contract_type_id', type: 'int', comment: 'FK to cat_contract_types.id' },
          { name: 'start_date', type: 'date', comment: 'Ngày bắt đầu' },
          { name: 'end_date', type: 'date', isNullable: true, comment: 'Ngày kết thúc' },
          { name: 'is_indefinite', type: 'tinyint', default: 0, comment: 'Hợp đồng không xác định thời hạn' },
          { name: 'base_salary', type: 'decimal', precision: 15, scale: 2, default: 0 },
          { name: 'allowances', type: 'decimal', precision: 15, scale: 2, default: 0, comment: 'Phụ cấp' },
          { name: 'bonus', type: 'decimal', precision: 15, scale: 2, default: 0, comment: 'Thưởng' },
          { name: 'currency', type: 'varchar', length: '3', default: "'VND'" },
          { name: 'working_hours_per_week', type: 'int', default: 40 },
          { name: 'probation_period_days', type: 'int', default: 0 },
          { name: 'signed_date', type: 'date', isNullable: true },
          { name: 'signed_by_employee', type: 'tinyint', default: 0 },
          { name: 'signed_by_company', type: 'tinyint', default: 0 },
          { name: 'company_representative', type: 'varchar', length: '200', isNullable: true, comment: 'Người đại diện công ty ký' },
          { name: 'contract_file_url', type: 'text', isNullable: true, comment: 'Link file hợp đồng' },
          {
            name: 'status',
            type: 'enum',
            enum: ['DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED', 'CANCELLED'],
            default: "'DRAFT'",
          },
          { name: 'terms_conditions', type: 'text', isNullable: true, comment: 'Điều khoản và điều kiện' },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
          { name: 'created_by', type: 'int', isNullable: true },
          { name: 'updated_by', type: 'int', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('contract_legal', new TableIndex({ name: 'idx_contract_number', columnNames: ['contract_number'] }));
    await queryRunner.createIndex('contract_legal', new TableIndex({ name: 'idx_employee_id', columnNames: ['employee_id'] }));
    await queryRunner.createIndex('contract_legal', new TableIndex({ name: 'idx_contract_type_id', columnNames: ['contract_type_id'] }));
    await queryRunner.createIndex('contract_legal', new TableIndex({ name: 'idx_start_date', columnNames: ['start_date'] }));
    await queryRunner.createIndex('contract_legal', new TableIndex({ name: 'idx_end_date', columnNames: ['end_date'] }));
    await queryRunner.createIndex('contract_legal', new TableIndex({ name: 'idx_status', columnNames: ['status'] }));

    await queryRunner.createForeignKey(
      'contract_legal',
      new TableForeignKey({
        columnNames: ['employee_id'],
        referencedTableName: 'employees',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'contract_legal',
      new TableForeignKey({
        columnNames: ['contract_type_id'],
        referencedTableName: 'cat_contract_types',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    // 9. Create attendance_records table
    await queryRunner.createTable(
      new Table({
        name: 'attendance_records',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'employee_id', type: 'int', comment: 'FK to employees.id' },
          { name: 'attendance_date', type: 'date', comment: 'Ngày chấm công' },
          { name: 'attendance_type_id', type: 'int', isNullable: true, comment: 'FK to cat_attendance_types.id' },
          { name: 'check_in_time', type: 'datetime', isNullable: true },
          { name: 'check_out_time', type: 'datetime', isNullable: true },
          { name: 'break_duration_minutes', type: 'int', default: 0, comment: 'Thời gian nghỉ (phút)' },
          { name: 'working_hours', type: 'decimal', precision: 5, scale: 2, isNullable: true, comment: 'Số giờ làm việc' },
          { name: 'overtime_hours', type: 'decimal', precision: 5, scale: 2, default: 0, comment: 'Số giờ làm thêm' },
          { name: 'late_minutes', type: 'int', default: 0, comment: 'Số phút đi muộn' },
          { name: 'early_leave_minutes', type: 'int', default: 0, comment: 'Số phút về sớm' },
          {
            name: 'type',
            type: 'enum',
            enum: ['WORK', 'OVERTIME', 'LEAVE', 'HOLIDAY', 'ABSENT', 'SICK', 'OTHER'],
            default: "'WORK'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
            default: "'PENDING'",
          },
          { name: 'approved_by', type: 'int', isNullable: true, comment: 'FK to users.id' },
          { name: 'approved_at', type: 'timestamp', isNullable: true },
          { name: 'rejection_reason', type: 'text', isNullable: true },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'location', type: 'varchar', length: '255', isNullable: true, comment: 'Địa điểm chấm công' },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
          { name: 'created_by', type: 'int', isNullable: true },
          { name: 'updated_by', type: 'int', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('attendance_records', new TableIndex({ name: 'idx_employee_id', columnNames: ['employee_id'] }));
    await queryRunner.createIndex('attendance_records', new TableIndex({ name: 'idx_attendance_date', columnNames: ['attendance_date'] }));
    await queryRunner.createIndex('attendance_records', new TableIndex({ name: 'idx_type', columnNames: ['type'] }));
    await queryRunner.createIndex('attendance_records', new TableIndex({ name: 'idx_status', columnNames: ['status'] }));
    await queryRunner.createIndex('attendance_records', new TableIndex({ name: 'idx_approved_by', columnNames: ['approved_by'] }));
    await queryRunner.createIndex('attendance_records', new TableIndex({ name: 'uk_employee_date', columnNames: ['employee_id', 'attendance_date'], isUnique: true }));

    await queryRunner.createForeignKey(
      'attendance_records',
      new TableForeignKey({
        columnNames: ['employee_id'],
        referencedTableName: 'employees',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'attendance_records',
      new TableForeignKey({
        columnNames: ['attendance_type_id'],
        referencedTableName: 'cat_attendance_types',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // 10. Create leave_requests table
    await queryRunner.createTable(
      new Table({
        name: 'leave_requests',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'request_number', type: 'varchar', length: '50', isUnique: true, comment: 'Số đơn nghỉ phép' },
          { name: 'employee_id', type: 'int', comment: 'FK to employees.id' },
          { name: 'leave_type_id', type: 'int', comment: 'FK to cat_leave_types.id' },
          { name: 'start_date', type: 'date', comment: 'Ngày bắt đầu' },
          { name: 'end_date', type: 'date', comment: 'Ngày kết thúc' },
          { name: 'total_days', type: 'decimal', precision: 5, scale: 2, comment: 'Tổng số ngày nghỉ' },
          { name: 'is_half_day', type: 'tinyint', default: 0, comment: 'Nghỉ nửa ngày' },
          { name: 'half_day_type', type: 'enum', enum: ['MORNING', 'AFTERNOON'], isNullable: true, comment: 'Nửa ngày sáng hay chiều' },
          { name: 'reason', type: 'text', comment: 'Lý do' },
          { name: 'approver_id', type: 'int', isNullable: true, comment: 'FK to employees.id - Người duyệt' },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
            default: "'PENDING'",
          },
          { name: 'approved_at', type: 'timestamp', isNullable: true },
          { name: 'rejected_at', type: 'timestamp', isNullable: true },
          { name: 'rejection_reason', type: 'text', isNullable: true },
          { name: 'attachment_url', type: 'text', isNullable: true },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
          { name: 'created_by', type: 'int', isNullable: true },
          { name: 'updated_by', type: 'int', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('leave_requests', new TableIndex({ name: 'idx_request_number', columnNames: ['request_number'] }));
    await queryRunner.createIndex('leave_requests', new TableIndex({ name: 'idx_employee_id', columnNames: ['employee_id'] }));
    await queryRunner.createIndex('leave_requests', new TableIndex({ name: 'idx_leave_type_id', columnNames: ['leave_type_id'] }));
    await queryRunner.createIndex('leave_requests', new TableIndex({ name: 'idx_start_date', columnNames: ['start_date'] }));
    await queryRunner.createIndex('leave_requests', new TableIndex({ name: 'idx_end_date', columnNames: ['end_date'] }));
    await queryRunner.createIndex('leave_requests', new TableIndex({ name: 'idx_status', columnNames: ['status'] }));
    await queryRunner.createIndex('leave_requests', new TableIndex({ name: 'idx_approver_id', columnNames: ['approver_id'] }));

    await queryRunner.createForeignKey(
      'leave_requests',
      new TableForeignKey({
        columnNames: ['employee_id'],
        referencedTableName: 'employees',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'leave_requests',
      new TableForeignKey({
        columnNames: ['approver_id'],
        referencedTableName: 'employees',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'leave_requests',
      new TableForeignKey({
        columnNames: ['leave_type_id'],
        referencedTableName: 'cat_leave_types',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.dropTable('leave_requests', true);
    await queryRunner.dropTable('attendance_records', true);
    await queryRunner.dropTable('contract_legal', true);
    await queryRunner.dropTable('employees', true);
    await queryRunner.dropTable('positions', true);
    await queryRunner.dropTable('departments', true);
    await queryRunner.dropTable('cat_attendance_types', true);
    await queryRunner.dropTable('cat_leave_types', true);
    await queryRunner.dropTable('cat_contract_types', true);
    await queryRunner.dropTable('cat_employee_status', true);
  }
}

