import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

/**
 * Migration: Update Attendance Management Schema
 * 
 * This migration updates attendance_records table and creates attendance_configurations table
 * to support enhanced attendance management features including:
 * - Late/Early leave tracking with reasons
 * - Separate approval_status field
 * - Edit tracking with reasons
 * - Attendance configuration rules
 * 
 * Related Feature: FEAT-008-005 - Attendance Management (Chấm Công)
 * Related Epic: EPIC-008 - HR Management
 */
export class UpdateAttendanceManagementSchema20251119200000 implements MigrationInterface {
  name = 'UpdateAttendanceManagementSchema20251119200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Update attendance_records table - Add missing columns
    console.log('Updating attendance_records table...');

    // Add late (boolean) column
    await queryRunner.addColumn(
      'attendance_records',
      new TableColumn({
        name: 'late',
        type: 'boolean',
        default: false,
        comment: 'Có đi muộn không',
      }),
    );

    // Add late_reason column
    await queryRunner.addColumn(
      'attendance_records',
      new TableColumn({
        name: 'late_reason',
        type: 'text',
        isNullable: true,
        comment: 'Lý do đi muộn',
      }),
    );

    // Add early_leave (boolean) column
    await queryRunner.addColumn(
      'attendance_records',
      new TableColumn({
        name: 'early_leave',
        type: 'boolean',
        default: false,
        comment: 'Có về sớm không',
      }),
    );

    // Add early_leave_reason column
    await queryRunner.addColumn(
      'attendance_records',
      new TableColumn({
        name: 'early_leave_reason',
        type: 'text',
        isNullable: true,
        comment: 'Lý do về sớm',
      }),
    );

    // Add approval_status column (separate from status)
    await queryRunner.addColumn(
      'attendance_records',
      new TableColumn({
        name: 'approval_status',
        type: 'enum',
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: "'PENDING'",
        comment: 'Trạng thái phê duyệt',
      }),
    );

    // Add rejected_by column
    await queryRunner.addColumn(
      'attendance_records',
      new TableColumn({
        name: 'rejected_by',
        type: 'int',
        isNullable: true,
        comment: 'FK to users.id - Người từ chối',
      }),
    );

    // Add rejected_at column
    await queryRunner.addColumn(
      'attendance_records',
      new TableColumn({
        name: 'rejected_at',
        type: 'timestamp',
        isNullable: true,
        comment: 'Thời gian từ chối',
      }),
    );

    // Add edit_reason column
    await queryRunner.addColumn(
      'attendance_records',
      new TableColumn({
        name: 'edit_reason',
        type: 'text',
        isNullable: true,
        comment: 'Lý do chỉnh sửa',
      }),
    );

    // Update status enum to include CHECKED_IN, COMPLETED
    // Note: MySQL doesn't support ALTER ENUM directly, so we need to use MODIFY
    await queryRunner.query(`
      ALTER TABLE attendance_records 
      MODIFY COLUMN status ENUM('CHECKED_IN', 'COMPLETED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED') 
      DEFAULT 'CHECKED_IN' 
      COMMENT 'Trạng thái chấm công'
    `);

    // Update type enum to match requirements
    await queryRunner.query(`
      ALTER TABLE attendance_records 
      MODIFY COLUMN type ENUM('NORMAL', 'OVERTIME', 'HOLIDAY', 'WEEKEND') 
      DEFAULT 'NORMAL' 
      COMMENT 'Loại chấm công'
    `);

    // Change break_duration_minutes to break_time (DECIMAL in hours)
    // First add new column
    await queryRunner.addColumn(
      'attendance_records',
      new TableColumn({
        name: 'break_time',
        type: 'decimal',
        precision: 4,
        scale: 2,
        default: 1.0,
        comment: 'Thời gian nghỉ (giờ)',
      }),
    );

    // Migrate data: convert minutes to hours
    await queryRunner.query(`
      UPDATE attendance_records 
      SET break_time = break_duration_minutes / 60.0 
      WHERE break_duration_minutes IS NOT NULL
    `);

    // Drop old column (after data migration)
    await queryRunner.dropColumn('attendance_records', 'break_duration_minutes');

    // Make check_in_time NOT NULL (required for attendance record)
    await queryRunner.query(`
      ALTER TABLE attendance_records 
      MODIFY COLUMN check_in_time datetime NOT NULL 
      COMMENT 'Thời gian check-in'
    `);

    // Add indexes for new columns
    await queryRunner.createIndex(
      'attendance_records',
      new TableIndex({
        name: 'idx_late',
        columnNames: ['late'],
      }),
    );

    await queryRunner.createIndex(
      'attendance_records',
      new TableIndex({
        name: 'idx_early_leave',
        columnNames: ['early_leave'],
      }),
    );

    await queryRunner.createIndex(
      'attendance_records',
      new TableIndex({
        name: 'idx_approval_status',
        columnNames: ['approval_status'],
      }),
    );

    await queryRunner.createIndex(
      'attendance_records',
      new TableIndex({
        name: 'idx_rejected_by',
        columnNames: ['rejected_by'],
      }),
    );

    // Add foreign key for rejected_by
    await queryRunner.createForeignKey(
      'attendance_records',
      new TableForeignKey({
        columnNames: ['rejected_by'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'NO ACTION',
      }),
    );

    // Add foreign key for approved_by (if not exists)
    // Check if foreign key already exists first
    const approvedByFkExists = await queryRunner.query(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.TABLE_CONSTRAINTS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'attendance_records' 
      AND CONSTRAINT_NAME LIKE '%approved_by%'
      AND CONSTRAINT_TYPE = 'FOREIGN KEY'
    `);

    if (approvedByFkExists.length === 0) {
      await queryRunner.createForeignKey(
        'attendance_records',
        new TableForeignKey({
          columnNames: ['approved_by'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
          onUpdate: 'NO ACTION',
        }),
      );
    }

    // Add check constraint: check_out_time must be after check_in_time
    await queryRunner.query(`
      ALTER TABLE attendance_records 
      ADD CONSTRAINT chk_checkout_after_checkin 
      CHECK (check_out_time IS NULL OR check_out_time >= check_in_time)
    `);

    // Add check constraint: working_hours must be >= 0 and <= 16
    await queryRunner.query(`
      ALTER TABLE attendance_records 
      ADD CONSTRAINT chk_working_hours_range 
      CHECK (working_hours IS NULL OR (working_hours >= 0 AND working_hours <= 16))
    `);

    // Add check constraint: overtime_hours must be >= 0
    await queryRunner.query(`
      ALTER TABLE attendance_records 
      ADD CONSTRAINT chk_overtime_hours 
      CHECK (overtime_hours >= 0)
    `);

    // Step 2: Create attendance_configurations table
    console.log('Creating attendance_configurations table...');

    await queryRunner.createTable(
      new Table({
        name: 'attendance_configurations',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'department_id',
            type: 'int',
            isNullable: true,
            comment: 'FK to departments.id - null = global rules',
          },
          {
            name: 'position_id',
            type: 'int',
            isNullable: true,
            comment: 'FK to positions.id - position-specific rules',
          },
          {
            name: 'standard_working_hours',
            type: 'decimal',
            precision: 4,
            scale: 2,
            default: 8.0,
            comment: 'Giờ làm việc chuẩn/ngày',
          },
          {
            name: 'break_time',
            type: 'decimal',
            precision: 4,
            scale: 2,
            default: 1.0,
            comment: 'Thời gian nghỉ (giờ)',
          },
          {
            name: 'late_threshold',
            type: 'time',
            default: "'09:00:00'",
            comment: 'Ngưỡng đi muộn',
          },
          {
            name: 'early_leave_threshold',
            type: 'time',
            default: "'17:00:00'",
            comment: 'Ngưỡng về sớm',
          },
          {
            name: 'overtime_rate',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 1.5,
            comment: 'Hệ số tính overtime',
          },
          {
            name: 'weekend_overtime_rate',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 2.0,
            comment: 'Hệ số overtime cuối tuần',
          },
          {
            name: 'holiday_overtime_rate',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 2.5,
            comment: 'Hệ số overtime ngày lễ',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            comment: 'Có active không',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'created_by',
            type: 'int',
            isNullable: true,
            comment: 'FK to users.id',
          },
          {
            name: 'updated_by',
            type: 'int',
            isNullable: true,
            comment: 'FK to users.id',
          },
        ],
      }),
      true,
    );

    // Create indexes for attendance_configurations
    await queryRunner.createIndex(
      'attendance_configurations',
      new TableIndex({
        name: 'idx_department_id',
        columnNames: ['department_id'],
      }),
    );

    await queryRunner.createIndex(
      'attendance_configurations',
      new TableIndex({
        name: 'idx_position_id',
        columnNames: ['position_id'],
      }),
    );

    await queryRunner.createIndex(
      'attendance_configurations',
      new TableIndex({
        name: 'idx_is_active',
        columnNames: ['is_active'],
      }),
    );

    // Note: Cannot create unique index on nullable columns in MySQL
    // Business logic will enforce: only one active config per department/position combination

    // Create foreign keys for attendance_configurations
    await queryRunner.createForeignKey(
      'attendance_configurations',
      new TableForeignKey({
        columnNames: ['department_id'],
        referencedTableName: 'departments',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      }),
    );

    await queryRunner.createForeignKey(
      'attendance_configurations',
      new TableForeignKey({
        columnNames: ['position_id'],
        referencedTableName: 'positions',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      }),
    );

    // Add check constraints for attendance_configurations
    await queryRunner.query(`
      ALTER TABLE attendance_configurations 
      ADD CONSTRAINT chk_standard_working_hours 
      CHECK (standard_working_hours > 0 AND standard_working_hours <= 24)
    `);

    await queryRunner.query(`
      ALTER TABLE attendance_configurations 
      ADD CONSTRAINT chk_break_time 
      CHECK (break_time >= 0 AND break_time <= 8)
    `);

    await queryRunner.query(`
      ALTER TABLE attendance_configurations 
      ADD CONSTRAINT chk_overtime_rate 
      CHECK (overtime_rate > 0)
    `);

    // Step 3: Insert default global configuration
    await queryRunner.query(`
      INSERT INTO attendance_configurations 
      (department_id, position_id, standard_working_hours, break_time, late_threshold, early_leave_threshold, 
       overtime_rate, weekend_overtime_rate, holiday_overtime_rate, is_active, created_at, updated_at)
      VALUES 
      (NULL, NULL, 8.0, 1.0, '09:00:00', '17:00:00', 1.5, 2.0, 2.5, true, NOW(), NOW())
    `);

    console.log('Attendance management schema update completed!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('Rolling back attendance management schema changes...');

    // Drop attendance_configurations table
    await queryRunner.dropTable('attendance_configurations', true);

    // Remove check constraints from attendance_records
    await queryRunner.query(`
      ALTER TABLE attendance_records 
      DROP CHECK chk_overtime_hours
    `);

    await queryRunner.query(`
      ALTER TABLE attendance_records 
      DROP CHECK chk_working_hours_range
    `);

    await queryRunner.query(`
      ALTER TABLE attendance_records 
      DROP CHECK chk_checkout_after_checkin
    `);

    // Drop indexes
    await queryRunner.dropIndex('attendance_records', 'idx_rejected_by');
    await queryRunner.dropIndex('attendance_records', 'idx_approval_status');
    await queryRunner.dropIndex('attendance_records', 'idx_early_leave');
    await queryRunner.dropIndex('attendance_records', 'idx_late');

    // Drop foreign key for rejected_by
    const rejectedByFk = await queryRunner.query(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.TABLE_CONSTRAINTS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'attendance_records' 
      AND CONSTRAINT_NAME LIKE '%rejected_by%'
      AND CONSTRAINT_TYPE = 'FOREIGN KEY'
    `);

    if (rejectedByFk.length > 0) {
      await queryRunner.query(`
        ALTER TABLE attendance_records 
        DROP FOREIGN KEY ${rejectedByFk[0].CONSTRAINT_NAME}
      `);
    }

    // Revert check_in_time to nullable
    await queryRunner.query(`
      ALTER TABLE attendance_records 
      MODIFY COLUMN check_in_time datetime NULL
    `);

    // Add back break_duration_minutes
    await queryRunner.addColumn(
      'attendance_records',
      new TableColumn({
        name: 'break_duration_minutes',
        type: 'int',
        default: 0,
        comment: 'Thời gian nghỉ (phút)',
      }),
    );

    // Migrate data back: convert hours to minutes
    await queryRunner.query(`
      UPDATE attendance_records 
      SET break_duration_minutes = ROUND(break_time * 60) 
      WHERE break_time IS NOT NULL
    `);

    // Drop break_time column
    await queryRunner.dropColumn('attendance_records', 'break_time');

    // Revert enum values
    await queryRunner.query(`
      ALTER TABLE attendance_records 
      MODIFY COLUMN status ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED') 
      DEFAULT 'PENDING'
    `);

    await queryRunner.query(`
      ALTER TABLE attendance_records 
      MODIFY COLUMN type ENUM('WORK', 'OVERTIME', 'LEAVE', 'HOLIDAY', 'ABSENT', 'SICK', 'OTHER') 
      DEFAULT 'WORK'
    `);

    // Drop new columns
    await queryRunner.dropColumn('attendance_records', 'edit_reason');
    await queryRunner.dropColumn('attendance_records', 'rejected_at');
    await queryRunner.dropColumn('attendance_records', 'rejected_by');
    await queryRunner.dropColumn('attendance_records', 'approval_status');
    await queryRunner.dropColumn('attendance_records', 'early_leave_reason');
    await queryRunner.dropColumn('attendance_records', 'early_leave');
    await queryRunner.dropColumn('attendance_records', 'late_reason');
    await queryRunner.dropColumn('attendance_records', 'late');

    console.log('Rollback completed!');
  }
}

