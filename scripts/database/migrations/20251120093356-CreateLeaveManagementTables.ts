import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateLeaveManagementTables20251120093356 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create leave_balances table
    // Tracks leave balance per employee per leave type per year
    await queryRunner.createTable(
      new Table({
        name: 'leave_balances',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'employee_id', type: 'int', comment: 'FK to employees.id' },
          { name: 'leave_type_id', type: 'int', comment: 'FK to cat_leave_types.id' },
          { name: 'year', type: 'int', comment: 'Năm (YYYY)' },
          {
            name: 'entitlement_days',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
            comment: 'Số ngày được cấp phát (tổng entitlement)',
          },
          {
            name: 'used_days',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
            comment: 'Số ngày đã sử dụng',
          },
          {
            name: 'remaining_days',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
            comment: 'Số ngày còn lại (tự động tính: entitlement - used)',
          },
          {
            name: 'carry_over_days',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
            comment: 'Số ngày carry-over từ năm trước',
          },
          {
            name: 'expired_days',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
            comment: 'Số ngày đã hết hạn (không được carry-over)',
          },
          {
            name: 'pending_days',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
            comment: 'Số ngày đang pending (chưa được approve)',
          },
          {
            name: 'last_calculated_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'Thời gian tính toán cuối cùng',
          },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
          { name: 'created_by', type: 'int', isNullable: true },
          { name: 'updated_by', type: 'int', isNullable: true },
        ],
      }),
      true,
    );

    // Indexes for leave_balances
    await queryRunner.createIndex('leave_balances', new TableIndex({ name: 'idx_employee_id', columnNames: ['employee_id'] }));
    await queryRunner.createIndex('leave_balances', new TableIndex({ name: 'idx_leave_type_id', columnNames: ['leave_type_id'] }));
    await queryRunner.createIndex('leave_balances', new TableIndex({ name: 'idx_year', columnNames: ['year'] }));
    await queryRunner.createIndex(
      'leave_balances',
      new TableIndex({ name: 'uk_employee_leave_type_year', columnNames: ['employee_id', 'leave_type_id', 'year'], isUnique: true }),
    );

    // Foreign keys for leave_balances
    await queryRunner.createForeignKey(
      'leave_balances',
      new TableForeignKey({
        columnNames: ['employee_id'],
        referencedTableName: 'employees',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'leave_balances',
      new TableForeignKey({
        columnNames: ['leave_type_id'],
        referencedTableName: 'cat_leave_types',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    // 2. Create leave_entitlements table
    // Tracks leave entitlement history and calculations
    await queryRunner.createTable(
      new Table({
        name: 'leave_entitlements',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'employee_id', type: 'int', comment: 'FK to employees.id' },
          { name: 'leave_type_id', type: 'int', comment: 'FK to cat_leave_types.id' },
          { name: 'year', type: 'int', comment: 'Năm (YYYY)' },
          {
            name: 'entitlement_days',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
            comment: 'Số ngày được cấp phát',
          },
          {
            name: 'granted_date',
            type: 'date',
            comment: 'Ngày được cấp phát',
          },
          {
            name: 'expiration_date',
            type: 'date',
            isNullable: true,
            comment: 'Ngày hết hạn (nếu có)',
          },
          {
            name: 'carry_over_days',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
            comment: 'Số ngày được carry-over từ năm trước',
          },
          {
            name: 'calculation_basis',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'Cơ sở tính toán: CONTRACT_TYPE, TENURE, POSITION, etc.',
          },
          {
            name: 'calculation_details',
            type: 'text',
            isNullable: true,
            comment: 'Chi tiết tính toán (JSON hoặc text)',
          },
          {
            name: 'is_prorated',
            type: 'tinyint',
            default: 0,
            comment: 'Có phải prorated (nhân viên mới vào giữa năm)',
          },
          {
            name: 'prorated_from_date',
            type: 'date',
            isNullable: true,
            comment: 'Ngày bắt đầu tính prorated',
          },
          {
            name: 'prorated_to_date',
            type: 'date',
            isNullable: true,
            comment: 'Ngày kết thúc tính prorated',
          },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
          { name: 'created_by', type: 'int', isNullable: true },
          { name: 'updated_by', type: 'int', isNullable: true },
        ],
      }),
      true,
    );

    // Indexes for leave_entitlements
    await queryRunner.createIndex('leave_entitlements', new TableIndex({ name: 'idx_employee_id', columnNames: ['employee_id'] }));
    await queryRunner.createIndex('leave_entitlements', new TableIndex({ name: 'idx_leave_type_id', columnNames: ['leave_type_id'] }));
    await queryRunner.createIndex('leave_entitlements', new TableIndex({ name: 'idx_year', columnNames: ['year'] }));
    await queryRunner.createIndex('leave_entitlements', new TableIndex({ name: 'idx_granted_date', columnNames: ['granted_date'] }));

    // Foreign keys for leave_entitlements
    await queryRunner.createForeignKey(
      'leave_entitlements',
      new TableForeignKey({
        columnNames: ['employee_id'],
        referencedTableName: 'employees',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'leave_entitlements',
      new TableForeignKey({
        columnNames: ['leave_type_id'],
        referencedTableName: 'cat_leave_types',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    // 3. Extend leave_requests table with additional fields for multi-level approval
    await queryRunner.query(`
      ALTER TABLE leave_requests
      ADD COLUMN hr_approver_id INT NULL COMMENT 'FK to employees.id - HR Manager phê duyệt' AFTER approver_id,
      ADD COLUMN requires_hr_approval TINYINT(1) DEFAULT 0 COMMENT 'Yêu cầu phê duyệt từ HR Manager' AFTER hr_approver_id,
      ADD COLUMN manager_approved_at TIMESTAMP NULL COMMENT 'Thời gian Manager phê duyệt' AFTER requires_hr_approval,
      ADD COLUMN hr_approved_at TIMESTAMP NULL COMMENT 'Thời gian HR Manager phê duyệt' AFTER manager_approved_at,
      ADD COLUMN manager_rejection_reason TEXT NULL COMMENT 'Lý do Manager từ chối' AFTER hr_approved_at,
      ADD COLUMN hr_rejection_reason TEXT NULL COMMENT 'Lý do HR Manager từ chối' AFTER manager_rejection_reason,
      ADD COLUMN manager_notes TEXT NULL COMMENT 'Ghi chú từ Manager' AFTER hr_rejection_reason,
      ADD COLUMN hr_notes TEXT NULL COMMENT 'Ghi chú từ HR Manager' AFTER manager_notes,
      ADD COLUMN is_edited TINYINT(1) DEFAULT 0 COMMENT 'Đã được chỉnh sửa' AFTER hr_notes,
      ADD COLUMN edited_at TIMESTAMP NULL COMMENT 'Thời gian chỉnh sửa' AFTER is_edited,
      ADD COLUMN edited_by INT NULL COMMENT 'FK to users.id - Người chỉnh sửa' AFTER edited_at,
      ADD COLUMN edit_reason TEXT NULL COMMENT 'Lý do chỉnh sửa' AFTER edited_by,
      ADD COLUMN cancellation_reason TEXT NULL COMMENT 'Lý do hủy' AFTER edit_reason,
      ADD COLUMN cancelled_at TIMESTAMP NULL COMMENT 'Thời gian hủy' AFTER cancellation_reason,
      ADD COLUMN cancelled_by INT NULL COMMENT 'FK to users.id - Người hủy' AFTER cancelled_at
    `);

    // Indexes for new columns in leave_requests
    await queryRunner.createIndex('leave_requests', new TableIndex({ name: 'idx_hr_approver_id', columnNames: ['hr_approver_id'] }));
    await queryRunner.createIndex('leave_requests', new TableIndex({ name: 'idx_requires_hr_approval', columnNames: ['requires_hr_approval'] }));
    await queryRunner.createIndex('leave_requests', new TableIndex({ name: 'idx_is_edited', columnNames: ['is_edited'] }));
    await queryRunner.createIndex('leave_requests', new TableIndex({ name: 'idx_edited_by', columnNames: ['edited_by'] }));

    // Foreign keys for new columns in leave_requests
    await queryRunner.createForeignKey(
      'leave_requests',
      new TableForeignKey({
        columnNames: ['hr_approver_id'],
        referencedTableName: 'employees',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'leave_requests',
      new TableForeignKey({
        columnNames: ['edited_by'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'leave_requests',
      new TableForeignKey({
        columnNames: ['cancelled_by'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // 4. Create leave_request_approvals table
    // Tracks approval history for multi-level approval workflow
    await queryRunner.createTable(
      new Table({
        name: 'leave_request_approvals',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'leave_request_id', type: 'int', comment: 'FK to leave_requests.id' },
          {
            name: 'approval_level',
            type: 'enum',
            enum: ['MANAGER', 'HR_MANAGER'],
            comment: 'Cấp độ phê duyệt',
          },
          { name: 'approver_id', type: 'int', comment: 'FK to employees.id - Người phê duyệt' },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'APPROVED', 'REJECTED'],
            default: "'PENDING'",
            comment: 'Trạng thái phê duyệt',
          },
          { name: 'approved_at', type: 'timestamp', isNullable: true, comment: 'Thời gian phê duyệt' },
          { name: 'rejected_at', type: 'timestamp', isNullable: true, comment: 'Thời gian từ chối' },
          { name: 'rejection_reason', type: 'text', isNullable: true, comment: 'Lý do từ chối' },
          { name: 'notes', type: 'text', isNullable: true, comment: 'Ghi chú' },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
          { name: 'created_by', type: 'int', isNullable: true },
          { name: 'updated_by', type: 'int', isNullable: true },
        ],
      }),
      true,
    );

    // Indexes for leave_request_approvals
    await queryRunner.createIndex('leave_request_approvals', new TableIndex({ name: 'idx_leave_request_id', columnNames: ['leave_request_id'] }));
    await queryRunner.createIndex('leave_request_approvals', new TableIndex({ name: 'idx_approval_level', columnNames: ['approval_level'] }));
    await queryRunner.createIndex('leave_request_approvals', new TableIndex({ name: 'idx_approver_id', columnNames: ['approver_id'] }));
    await queryRunner.createIndex('leave_request_approvals', new TableIndex({ name: 'idx_status', columnNames: ['status'] }));

    // Foreign keys for leave_request_approvals
    await queryRunner.createForeignKey(
      'leave_request_approvals',
      new TableForeignKey({
        columnNames: ['leave_request_id'],
        referencedTableName: 'leave_requests',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'leave_request_approvals',
      new TableForeignKey({
        columnNames: ['approver_id'],
        referencedTableName: 'employees',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    // 5. Create leave_request_edit_history table
    // Tracks edit history for leave requests (audit trail)
    await queryRunner.createTable(
      new Table({
        name: 'leave_request_edit_history',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'leave_request_id', type: 'int', comment: 'FK to leave_requests.id' },
          { name: 'edited_by', type: 'int', comment: 'FK to users.id - Người chỉnh sửa' },
          { name: 'edited_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', comment: 'Thời gian chỉnh sửa' },
          { name: 'edit_reason', type: 'text', isNullable: true, comment: 'Lý do chỉnh sửa' },
          {
            name: 'old_values',
            type: 'json',
            isNullable: true,
            comment: 'Giá trị cũ (JSON format)',
          },
          {
            name: 'new_values',
            type: 'json',
            isNullable: true,
            comment: 'Giá trị mới (JSON format)',
          },
          { name: 'changed_fields', type: 'text', isNullable: true, comment: 'Danh sách các trường đã thay đổi' },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    // Indexes for leave_request_edit_history
    await queryRunner.createIndex('leave_request_edit_history', new TableIndex({ name: 'idx_leave_request_id', columnNames: ['leave_request_id'] }));
    await queryRunner.createIndex('leave_request_edit_history', new TableIndex({ name: 'idx_edited_by', columnNames: ['edited_by'] }));
    await queryRunner.createIndex('leave_request_edit_history', new TableIndex({ name: 'idx_edited_at', columnNames: ['edited_at'] }));

    // Foreign keys for leave_request_edit_history
    await queryRunner.createForeignKey(
      'leave_request_edit_history',
      new TableForeignKey({
        columnNames: ['leave_request_id'],
        referencedTableName: 'leave_requests',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'leave_request_edit_history',
      new TableForeignKey({
        columnNames: ['edited_by'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.dropTable('leave_request_edit_history', true);
    await queryRunner.dropTable('leave_request_approvals', true);

    // Drop foreign keys and indexes for leave_requests extensions
    await queryRunner.dropForeignKey('leave_requests', 'FK_leave_requests_cancelled_by');
    await queryRunner.dropForeignKey('leave_requests', 'FK_leave_requests_edited_by');
    await queryRunner.dropForeignKey('leave_requests', 'FK_leave_requests_hr_approver_id');

    await queryRunner.dropIndex('leave_requests', 'idx_edited_by');
    await queryRunner.dropIndex('leave_requests', 'idx_is_edited');
    await queryRunner.dropIndex('leave_requests', 'idx_requires_hr_approval');
    await queryRunner.dropIndex('leave_requests', 'idx_hr_approver_id');

    // Drop columns from leave_requests
    await queryRunner.query(`
      ALTER TABLE leave_requests
      DROP COLUMN cancelled_by,
      DROP COLUMN cancelled_at,
      DROP COLUMN cancellation_reason,
      DROP COLUMN edit_reason,
      DROP COLUMN edited_by,
      DROP COLUMN edited_at,
      DROP COLUMN is_edited,
      DROP COLUMN hr_notes,
      DROP COLUMN manager_notes,
      DROP COLUMN hr_rejection_reason,
      DROP COLUMN manager_rejection_reason,
      DROP COLUMN hr_approved_at,
      DROP COLUMN manager_approved_at,
      DROP COLUMN requires_hr_approval,
      DROP COLUMN hr_approver_id
    `);

    await queryRunner.dropTable('leave_entitlements', true);
    await queryRunner.dropTable('leave_balances', true);
  }
}

