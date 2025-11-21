import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class ExtendAttendanceManagement1735000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Extend attendance_records table with additional fields
    // Check if break_duration_minutes column exists, if not add it
    const table = await queryRunner.getTable('attendance_records');
    const hasBreakDuration = table?.columns.find(col => col.name === 'break_duration_minutes');
    
    if (!hasBreakDuration) {
      await queryRunner.query(`
        ALTER TABLE attendance_records
        ADD COLUMN break_duration_minutes INT DEFAULT 0 COMMENT 'Thời gian nghỉ (phút)' AFTER check_out_time
      `);
    }
    
    // Check and add other columns if they don't exist
    const hasCheckInLocation = table?.columns.find(col => col.name === 'check_in_location');
    if (!hasCheckInLocation) {
      await queryRunner.query(`
        ALTER TABLE attendance_records
        ADD COLUMN check_in_location VARCHAR(255) NULL COMMENT 'Địa điểm check-in (GPS hoặc địa chỉ)' AFTER location,
        ADD COLUMN check_in_latitude DECIMAL(10, 8) NULL COMMENT 'Vĩ độ GPS check-in' AFTER check_in_location,
        ADD COLUMN check_in_longitude DECIMAL(11, 8) NULL COMMENT 'Kinh độ GPS check-in' AFTER check_in_latitude,
        ADD COLUMN check_out_location VARCHAR(255) NULL COMMENT 'Địa điểm check-out (GPS hoặc địa chỉ)' AFTER check_in_longitude,
        ADD COLUMN check_out_latitude DECIMAL(10, 8) NULL COMMENT 'Vĩ độ GPS check-out' AFTER check_out_location,
        ADD COLUMN check_out_longitude DECIMAL(11, 8) NULL COMMENT 'Kinh độ GPS check-out' AFTER check_out_latitude
      `);
    }
    
    const hasLateReason = table?.columns.find(col => col.name === 'late_reason');
    if (!hasLateReason) {
      await queryRunner.query(`
        ALTER TABLE attendance_records
        ADD COLUMN late_reason TEXT NULL COMMENT 'Lý do đi muộn' AFTER early_leave_minutes,
        ADD COLUMN early_leave_reason TEXT NULL COMMENT 'Lý do về sớm' AFTER late_reason,
        ADD COLUMN edit_reason TEXT NULL COMMENT 'Lý do chỉnh sửa' AFTER early_leave_reason,
        ADD COLUMN is_edited TINYINT(1) DEFAULT 0 COMMENT 'Đã được chỉnh sửa' AFTER edit_reason,
        ADD COLUMN edited_at TIMESTAMP NULL COMMENT 'Thời gian chỉnh sửa' AFTER is_edited,
        ADD COLUMN edited_by INT NULL COMMENT 'FK to users.id - Người chỉnh sửa' AFTER edited_at
      `);
    }
    
    const hasSpecialCaseType = table?.columns.find(col => col.name === 'special_case_type');
    if (!hasSpecialCaseType) {
      await queryRunner.query(`
        ALTER TABLE attendance_records
        ADD COLUMN special_case_type ENUM('NORMAL', 'REMOTE_WORK', 'BUSINESS_TRIP', 'HOLIDAY_WORK', 'WEEKEND_WORK') 
          DEFAULT 'NORMAL' COMMENT 'Loại trường hợp đặc biệt' AFTER type,
        ADD COLUMN approval_notes TEXT NULL COMMENT 'Ghi chú khi phê duyệt/từ chối' AFTER rejection_reason
      `);
    }
    
    // Modify columns (these will fail if column doesn't exist, so we need to check)
    await queryRunner.query(`
      ALTER TABLE attendance_records
      MODIFY COLUMN type ENUM('WORK', 'OVERTIME', 'LEAVE', 'HOLIDAY', 'ABSENT', 'SICK', 'REMOTE_WORK', 'BUSINESS_TRIP', 'OTHER') 
        DEFAULT 'WORK',
      MODIFY COLUMN status ENUM('CHECKED_IN', 'COMPLETED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CANCELLED') 
        DEFAULT 'CHECKED_IN'
    `);

    // Add indexes for new fields (only if they don't exist)
    // Refresh table info after adding columns
    const tableAfter = await queryRunner.getTable('attendance_records');
    const existingIndexes = tableAfter?.indices.map(idx => idx.name) || [];
    
    if (!existingIndexes.includes('idx_special_case_type') && tableAfter?.columns.find(col => col.name === 'special_case_type')) {
      try {
        await queryRunner.createIndex(
          'attendance_records',
          new TableIndex({ name: 'idx_special_case_type', columnNames: ['special_case_type'] }),
        );
      } catch (error: any) {
        if (error.code !== 'ER_DUP_KEYNAME') {
          throw error;
        }
      }
    }
    if (!existingIndexes.includes('idx_is_edited') && tableAfter?.columns.find(col => col.name === 'is_edited')) {
      try {
        await queryRunner.createIndex(
          'attendance_records',
          new TableIndex({ name: 'idx_is_edited', columnNames: ['is_edited'] }),
        );
      } catch (error: any) {
        if (error.code !== 'ER_DUP_KEYNAME') {
          throw error;
        }
      }
    }
    if (!existingIndexes.includes('idx_edited_by') && tableAfter?.columns.find(col => col.name === 'edited_by')) {
      try {
        await queryRunner.createIndex(
          'attendance_records',
          new TableIndex({ name: 'idx_edited_by', columnNames: ['edited_by'] }),
        );
      } catch (error: any) {
        if (error.code !== 'ER_DUP_KEYNAME') {
          throw error;
        }
      }
    }

    // Add foreign key for edited_by (only if it doesn't exist)
    const attendanceRecordsTable = await queryRunner.getTable('attendance_records');
    const existingFKs = attendanceRecordsTable?.foreignKeys.map(fk => fk.columnNames[0]) || [];
    if (!existingFKs.includes('edited_by')) {
      try {
        await queryRunner.createForeignKey(
          'attendance_records',
          new TableForeignKey({
            columnNames: ['edited_by'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          }),
        );
      } catch (error: any) {
        if (error.code !== 'ER_FK_DUP_NAME' && error.code !== 'ER_DUP_KEYNAME') {
          throw error;
        }
      }
    }

    // 2. Create attendance_edit_history table for audit trail
    await queryRunner.createTable(
      new Table({
        name: 'attendance_edit_history',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'attendance_record_id', type: 'int', comment: 'FK to attendance_records.id' },
          { name: 'field_name', type: 'varchar', length: '100', comment: 'Tên field được thay đổi' },
          { name: 'old_value', type: 'text', isNullable: true, comment: 'Giá trị cũ' },
          { name: 'new_value', type: 'text', isNullable: true, comment: 'Giá trị mới' },
          { name: 'edit_reason', type: 'text', isNullable: true, comment: 'Lý do chỉnh sửa' },
          { name: 'edited_by', type: 'int', isNullable: true, comment: 'FK to users.id' },
          { name: 'edited_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', comment: 'Thời gian chỉnh sửa' },
        ],
      }),
      true,
    );

    // Check if indexes exist before creating
    const editHistoryTable = await queryRunner.getTable('attendance_edit_history');
    const editHistoryIndexes = editHistoryTable?.indices.map(idx => idx.name) || [];
    
    if (!editHistoryIndexes.includes('idx_attendance_record_id')) {
      try {
        await queryRunner.createIndex(
          'attendance_edit_history',
          new TableIndex({ name: 'idx_attendance_record_id', columnNames: ['attendance_record_id'] }),
        );
      } catch (error: any) {
        if (error.code !== 'ER_DUP_KEYNAME') {
          throw error;
        }
      }
    }
    if (!editHistoryIndexes.includes('idx_edited_by')) {
      try {
        await queryRunner.createIndex('attendance_edit_history', new TableIndex({ name: 'idx_edited_by', columnNames: ['edited_by'] }));
      } catch (error: any) {
        if (error.code !== 'ER_DUP_KEYNAME') {
          throw error;
        }
      }
    }
    if (!editHistoryIndexes.includes('idx_edited_at')) {
      try {
        await queryRunner.createIndex('attendance_edit_history', new TableIndex({ name: 'idx_edited_at', columnNames: ['edited_at'] }));
      } catch (error: any) {
        if (error.code !== 'ER_DUP_KEYNAME') {
          throw error;
        }
      }
    }

    // Add foreign keys for attendance_edit_history (only if they don't exist)
    const editHistoryFKs = editHistoryTable?.foreignKeys.map(fk => fk.columnNames[0]) || [];
    if (!editHistoryFKs.includes('attendance_record_id')) {
      try {
        await queryRunner.createForeignKey(
          'attendance_edit_history',
          new TableForeignKey({
            columnNames: ['attendance_record_id'],
            referencedTableName: 'attendance_records',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        );
      } catch (error: any) {
        if (error.code !== 'ER_FK_DUP_NAME' && error.code !== 'ER_DUP_KEYNAME') {
          throw error;
        }
      }
    }
    if (!editHistoryFKs.includes('edited_by')) {
      try {
        await queryRunner.createForeignKey(
          'attendance_edit_history',
          new TableForeignKey({
            columnNames: ['edited_by'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          }),
        );
      } catch (error: any) {
        if (error.code !== 'ER_FK_DUP_NAME' && error.code !== 'ER_DUP_KEYNAME') {
          throw error;
        }
      }
    }

    // 3. Create attendance_configurations table for rules configuration
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
            name: 'config_type',
            type: 'enum',
            enum: ['GLOBAL', 'DEPARTMENT', 'POSITION'],
            default: "'GLOBAL'",
            comment: 'Loại cấu hình: GLOBAL, DEPARTMENT, POSITION',
          },
          { name: 'department_id', type: 'int', isNullable: true, comment: 'FK to departments.id (nếu config_type = DEPARTMENT)' },
          { name: 'position_id', type: 'int', isNullable: true, comment: 'FK to positions.id (nếu config_type = POSITION)' },
          {
            name: 'standard_working_hours',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 8.0,
            comment: 'Số giờ làm việc tiêu chuẩn mỗi ngày',
          },
          {
            name: 'break_duration_minutes',
            type: 'int',
            default: 60,
            comment: 'Thời gian nghỉ trưa (phút)',
          },
          {
            name: 'late_threshold_time',
            type: 'time',
            default: "'09:00:00'",
            comment: 'Thời gian muộn (mặc định 9:00 AM)',
          },
          {
            name: 'early_leave_threshold_time',
            type: 'time',
            default: "'17:00:00'",
            comment: 'Thời gian về sớm (mặc định 5:00 PM)',
          },
          {
            name: 'earliest_check_in_time',
            type: 'time',
            default: "'06:00:00'",
            comment: 'Thời gian check-in sớm nhất (mặc định 6:00 AM)',
          },
          {
            name: 'latest_check_out_time',
            type: 'time',
            default: "'23:59:59'",
            comment: 'Thời gian check-out muộn nhất',
          },
          {
            name: 'location_validation_enabled',
            type: 'tinyint',
            default: 0,
            comment: 'Bật/tắt validation địa điểm',
          },
          {
            name: 'allowed_location_radius_meters',
            type: 'int',
            default: 100,
            comment: 'Bán kính cho phép (mét)',
          },
          {
            name: 'overtime_calculation_method',
            type: 'enum',
            enum: ['SIMPLE', 'TIERED'],
            default: "'SIMPLE'",
            comment: 'Phương pháp tính overtime',
          },
          {
            name: 'overtime_rate_multiplier',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 1.5,
            comment: 'Hệ số nhân cho overtime (1.5 = 150%)',
          },
          {
            name: 'weekend_overtime_rate_multiplier',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 2.0,
            comment: 'Hệ số nhân cho overtime cuối tuần',
          },
          {
            name: 'holiday_overtime_rate_multiplier',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 3.0,
            comment: 'Hệ số nhân cho overtime ngày lễ',
          },
          { name: 'is_active', type: 'tinyint', default: 1 },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
          { name: 'created_by', type: 'int', isNullable: true },
          { name: 'updated_by', type: 'int', isNullable: true },
        ],
      }),
      true,
    );

    // Check if indexes exist before creating
    const configTable = await queryRunner.getTable('attendance_configurations');
    const configIndexes = configTable?.indices.map(idx => idx.name) || [];
    
    if (!configIndexes.includes('idx_config_type')) {
      try {
        await queryRunner.createIndex(
          'attendance_configurations',
          new TableIndex({ name: 'idx_config_type', columnNames: ['config_type'] }),
        );
      } catch (error: any) {
        if (error.code !== 'ER_DUP_KEYNAME') {
          throw error;
        }
      }
    }
    if (!configIndexes.includes('idx_department_id')) {
      try {
        await queryRunner.createIndex(
          'attendance_configurations',
          new TableIndex({ name: 'idx_department_id', columnNames: ['department_id'] }),
        );
      } catch (error: any) {
        if (error.code !== 'ER_DUP_KEYNAME') {
          throw error;
        }
      }
    }
    if (!configIndexes.includes('idx_position_id')) {
      try {
        await queryRunner.createIndex('attendance_configurations', new TableIndex({ name: 'idx_position_id', columnNames: ['position_id'] }));
      } catch (error: any) {
        if (error.code !== 'ER_DUP_KEYNAME') {
          throw error;
        }
      }
    }
    if (!configIndexes.includes('idx_is_active')) {
      try {
        await queryRunner.createIndex('attendance_configurations', new TableIndex({ name: 'idx_is_active', columnNames: ['is_active'] }));
      } catch (error: any) {
        if (error.code !== 'ER_DUP_KEYNAME') {
          throw error;
        }
      }
    }

    // Add foreign keys for attendance_configurations (only if they don't exist)
    const configFKs = configTable?.foreignKeys.map(fk => fk.columnNames[0]) || [];
    if (!configFKs.includes('department_id')) {
      try {
        await queryRunner.createForeignKey(
          'attendance_configurations',
          new TableForeignKey({
            columnNames: ['department_id'],
            referencedTableName: 'departments',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        );
      } catch (error: any) {
        if (error.code !== 'ER_FK_DUP_NAME' && error.code !== 'ER_DUP_KEYNAME') {
          throw error;
        }
      }
    }
    if (!configFKs.includes('position_id')) {
      try {
        await queryRunner.createForeignKey(
          'attendance_configurations',
          new TableForeignKey({
            columnNames: ['position_id'],
            referencedTableName: 'positions',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        );
      } catch (error: any) {
        if (error.code !== 'ER_FK_DUP_NAME' && error.code !== 'ER_DUP_KEYNAME') {
          throw error;
        }
      }
    }

    // 4. Create attendance_locations table for allowed locations
    await queryRunner.createTable(
      new Table({
        name: 'attendance_locations',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'name', type: 'varchar', length: '200', comment: 'Tên địa điểm' },
          { name: 'address', type: 'text', isNullable: true, comment: 'Địa chỉ' },
          { name: 'latitude', type: 'decimal', precision: 10, scale: 8, comment: 'Vĩ độ GPS' },
          { name: 'longitude', type: 'decimal', precision: 11, scale: 8, comment: 'Kinh độ GPS' },
          {
            name: 'radius_meters',
            type: 'int',
            default: 100,
            comment: 'Bán kính cho phép (mét)',
          },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'is_active', type: 'tinyint', default: 1 },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
          { name: 'created_by', type: 'int', isNullable: true },
          { name: 'updated_by', type: 'int', isNullable: true },
        ],
      }),
      true,
    );

    // Check if indexes exist before creating for attendance_locations
    const locationTable = await queryRunner.getTable('attendance_locations');
    const locationIndexes = locationTable?.indices.map(idx => idx.name) || [];
    
    if (!locationIndexes.includes('idx_name')) {
      try {
        await queryRunner.createIndex('attendance_locations', new TableIndex({ name: 'idx_name', columnNames: ['name'] }));
      } catch (error: any) {
        if (error.code !== 'ER_DUP_KEYNAME') {
          throw error;
        }
      }
    }
    if (!locationIndexes.includes('idx_is_active')) {
      try {
        await queryRunner.createIndex('attendance_locations', new TableIndex({ name: 'idx_is_active', columnNames: ['is_active'] }));
      } catch (error: any) {
        if (error.code !== 'ER_DUP_KEYNAME') {
          throw error;
        }
      }
    }

    // 5. Insert default attendance types if not exists
    await queryRunner.query(`
      INSERT INTO cat_attendance_types (code, name, description, is_active, sort_order, created_at, updated_at)
      VALUES 
        ('NORMAL', 'Chấm công bình thường', 'Chấm công làm việc bình thường', 1, 1, NOW(), NOW()),
        ('REMOTE_WORK', 'Làm việc từ xa', 'Chấm công khi làm việc từ xa', 1, 2, NOW(), NOW()),
        ('BUSINESS_TRIP', 'Công tác', 'Chấm công khi đi công tác', 1, 3, NOW(), NOW()),
        ('HOLIDAY_WORK', 'Làm việc ngày lễ', 'Chấm công khi làm việc vào ngày lễ', 1, 4, NOW(), NOW()),
        ('WEEKEND_WORK', 'Làm việc cuối tuần', 'Chấm công khi làm việc cuối tuần', 1, 5, NOW(), NOW()),
        ('OVERTIME', 'Làm thêm giờ', 'Chấm công làm thêm giờ', 1, 6, NOW(), NOW())
      ON DUPLICATE KEY UPDATE 
        name = VALUES(name),
        description = VALUES(description),
        updated_at = NOW()
    `);

    // 6. Insert default global attendance configuration
    await queryRunner.query(`
      INSERT INTO attendance_configurations 
        (config_type, standard_working_hours, break_duration_minutes, late_threshold_time, 
         early_leave_threshold_time, earliest_check_in_time, latest_check_out_time,
         location_validation_enabled, allowed_location_radius_meters, 
         overtime_calculation_method, overtime_rate_multiplier, 
         weekend_overtime_rate_multiplier, holiday_overtime_rate_multiplier,
         is_active, created_at, updated_at)
      VALUES 
        ('GLOBAL', 8.0, 60, '09:00:00', '17:00:00', '06:00:00', '23:59:59',
         0, 100, 'SIMPLE', 1.5, 2.0, 3.0, 1, NOW(), NOW())
      ON DUPLICATE KEY UPDATE updated_at = NOW()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.dropTable('attendance_locations', true);
    await queryRunner.dropTable('attendance_configurations', true);
    await queryRunner.dropTable('attendance_edit_history', true);

    // Revert attendance_records changes
    await queryRunner.query(`
      ALTER TABLE attendance_records
      DROP COLUMN check_in_location,
      DROP COLUMN check_in_latitude,
      DROP COLUMN check_in_longitude,
      DROP COLUMN check_out_location,
      DROP COLUMN check_out_latitude,
      DROP COLUMN check_out_longitude,
      DROP COLUMN late_reason,
      DROP COLUMN early_leave_reason,
      DROP COLUMN edit_reason,
      DROP COLUMN is_edited,
      DROP COLUMN edited_at,
      DROP COLUMN edited_by,
      DROP COLUMN special_case_type,
      DROP COLUMN approval_notes,
      MODIFY COLUMN type ENUM('WORK', 'OVERTIME', 'LEAVE', 'HOLIDAY', 'ABSENT', 'SICK', 'OTHER') DEFAULT 'WORK',
      MODIFY COLUMN status ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED') DEFAULT 'PENDING'
    `);
  }
}

