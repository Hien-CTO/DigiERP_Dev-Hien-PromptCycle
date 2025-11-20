-- =====================================================
-- Migration: Create HR Management Tables
-- Version: 006
-- Epic: EPIC-008 - HR Management
-- Date: November 2025
-- Description: Create all tables for HR Management module
-- =====================================================

USE Hien_DigiERP_LeHuy_Dev2;

-- =====================================================
-- Step 1: Create leave_types table (reference data first)
-- =====================================================

CREATE TABLE IF NOT EXISTS leave_types (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    requires_balance BOOLEAN NOT NULL DEFAULT TRUE,
    requires_approval BOOLEAN NOT NULL DEFAULT TRUE,
    requires_medical_certificate BOOLEAN NOT NULL DEFAULT FALSE,
    max_days_per_request INT NULL COMMENT 'NULL for unlimited',
    is_paid BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_leave_types_code (code),
    INDEX idx_leave_types_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Leave types catalog';

-- Insert default leave types
INSERT INTO leave_types (code, name, description, requires_balance, requires_approval, requires_medical_certificate, max_days_per_request, is_paid, sort_order) VALUES
('ANNUAL', 'Nghỉ phép năm', 'Nghỉ phép có lương hàng năm', TRUE, TRUE, FALSE, NULL, TRUE, 1),
('SICK', 'Nghỉ ốm', 'Nghỉ ốm có lương, cần giấy bác sĩ nếu > 3 ngày', TRUE, TRUE, TRUE, NULL, TRUE, 2),
('UNPAID', 'Nghỉ không lương', 'Nghỉ phép không lương', FALSE, TRUE, FALSE, NULL, FALSE, 3),
('MATERNITY', 'Nghỉ thai sản', 'Nghỉ thai sản cho nữ (6 tháng)', TRUE, TRUE, TRUE, 180, TRUE, 4),
('PATERNITY', 'Nghỉ khi vợ sinh', 'Nghỉ khi vợ sinh cho nam (5-10 ngày)', TRUE, TRUE, FALSE, 10, TRUE, 5),
('OTHER', 'Nghỉ khác', 'Các loại nghỉ phép khác', FALSE, TRUE, FALSE, NULL, FALSE, 6)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- =====================================================
-- Step 2: Create departments table
-- =====================================================

CREATE TABLE IF NOT EXISTS departments (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    department_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    parent_department_id INT NULL,
    manager_id INT NULL COMMENT 'Employee ID of department manager',
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_by INT NULL,
    FOREIGN KEY (parent_department_id) REFERENCES departments(id) ON DELETE SET NULL,
    INDEX idx_departments_code (department_code),
    INDEX idx_departments_parent (parent_department_id),
    INDEX idx_departments_manager (manager_id),
    INDEX idx_departments_status (status),
    CONSTRAINT chk_departments_no_self_ref CHECK (parent_department_id != id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Department management with hierarchical structure';

-- =====================================================
-- Step 3: Create positions table
-- =====================================================

CREATE TABLE IF NOT EXISTS positions (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    position_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    level INT NOT NULL DEFAULT 1 COMMENT 'Position level 1-10',
    department_id INT NULL COMMENT 'NULL for company-wide positions',
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_by INT NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    INDEX idx_positions_code (position_code),
    INDEX idx_positions_level (level),
    INDEX idx_positions_department (department_id),
    INDEX idx_positions_status (status),
    CONSTRAINT chk_positions_level CHECK (level >= 1 AND level <= 10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Position and job role management';

-- =====================================================
-- Step 4: Create employees table
-- =====================================================

CREATE TABLE IF NOT EXISTS employees (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    employee_code VARCHAR(50) NOT NULL UNIQUE,
    user_id INT NULL UNIQUE COMMENT 'Link to users table - one-to-one relationship',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200) GENERATED ALWAYS AS (CONCAT(first_name, ' ', last_name)) STORED,
    date_of_birth DATE NOT NULL,
    id_number VARCHAR(20) NOT NULL UNIQUE COMMENT 'CMND/CCCD',
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    address TEXT NULL,
    photo_url VARCHAR(500) NULL,
    emergency_contact_name VARCHAR(100) NULL,
    emergency_contact_phone VARCHAR(20) NULL,
    bank_account VARCHAR(50) NULL,
    bank_name VARCHAR(100) NULL,
    tax_code VARCHAR(20) NULL,
    department_id INT NULL,
    position_id INT NULL,
    status ENUM('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED') NOT NULL DEFAULT 'ACTIVE',
    employment_start_date DATE NULL,
    employment_end_date DATE NULL,
    termination_reason TEXT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_by INT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE SET NULL,
    INDEX idx_employees_code (employee_code),
    INDEX idx_employees_user (user_id),
    INDEX idx_employees_email (email),
    INDEX idx_employees_id_number (id_number),
    INDEX idx_employees_status (status),
    INDEX idx_employees_department (department_id),
    INDEX idx_employees_position (position_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Employee information and profile management';

-- =====================================================
-- Step 5: Add foreign key for departments.manager_id
-- =====================================================

ALTER TABLE departments
ADD FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL;

-- =====================================================
-- Step 6: Create employee_contracts table
-- =====================================================

CREATE TABLE IF NOT EXISTS employee_contracts (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    contract_number VARCHAR(50) NOT NULL UNIQUE,
    employee_id INT NOT NULL,
    contract_type ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NULL COMMENT 'NULL for indefinite contracts',
    contract_value DECIMAL(15,2) NULL,
    auto_renewal BOOLEAN NOT NULL DEFAULT FALSE,
    terms_conditions TEXT NULL,
    status ENUM('DRAFT', 'ACTIVE', 'EXPIRED', 'RENEWED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    renewed_from_contract_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_by INT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (renewed_from_contract_id) REFERENCES employee_contracts(id) ON DELETE SET NULL,
    INDEX idx_contracts_number (contract_number),
    INDEX idx_contracts_employee (employee_id),
    INDEX idx_contracts_type (contract_type),
    INDEX idx_contracts_status (status),
    INDEX idx_contracts_dates (start_date, end_date),
    CONSTRAINT chk_contracts_dates CHECK (end_date IS NULL OR end_date >= start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Employee contract management';

-- =====================================================
-- Step 7: Create attendance_records table
-- =====================================================

CREATE TABLE IF NOT EXISTS attendance_records (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    check_in_time TIME NULL,
    check_out_time TIME NULL,
    break_duration_minutes INT NULL DEFAULT 0,
    working_hours DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN check_in_time IS NOT NULL AND check_out_time IS NOT NULL 
            THEN TIMESTAMPDIFF(MINUTE, check_in_time, check_out_time) / 60.0 - COALESCE(break_duration_minutes, 0) / 60.0
            ELSE 0
        END
    ) STORED,
    overtime_hours DECIMAL(5,2) GENERATED ALWAYS AS (
        GREATEST(0, working_hours - 8.0)
    ) STORED,
    is_late BOOLEAN GENERATED ALWAYS AS (
        check_in_time > '09:00:00'
    ) STORED,
    is_early_leave BOOLEAN GENERATED ALWAYS AS (
        check_out_time < '17:00:00' AND check_out_time IS NOT NULL
    ) STORED,
    is_missing BOOLEAN GENERATED ALWAYS AS (
        check_in_time IS NULL OR check_out_time IS NULL
    ) STORED,
    location VARCHAR(255) NULL COMMENT 'GPS location if available',
    late_reason TEXT NULL,
    early_leave_reason TEXT NULL,
    missing_reason TEXT NULL,
    status ENUM('CHECKED_IN', 'COMPLETED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'CHECKED_IN',
    approved_by INT NULL,
    approved_at TIMESTAMP NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES employees(id) ON DELETE SET NULL,
    UNIQUE KEY uk_attendance_employee_date (employee_id, attendance_date),
    INDEX idx_attendance_employee (employee_id),
    INDEX idx_attendance_date (attendance_date),
    INDEX idx_attendance_status (status),
    CONSTRAINT chk_attendance_times CHECK (check_out_time IS NULL OR check_out_time >= check_in_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Daily attendance tracking with check-in/check-out';

-- =====================================================
-- Step 8: Create leave_requests table
-- =====================================================

CREATE TABLE IF NOT EXISTS leave_requests (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    request_number VARCHAR(50) NOT NULL UNIQUE,
    employee_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    leave_days INT GENERATED ALWAYS AS (DATEDIFF(end_date, start_date) + 1) STORED,
    reason TEXT NOT NULL,
    medical_certificate_url VARCHAR(500) NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'TAKEN') NOT NULL DEFAULT 'PENDING',
    approved_by INT NULL,
    approved_at TIMESTAMP NULL,
    rejected_by INT NULL,
    rejected_at TIMESTAMP NULL,
    rejection_reason TEXT NULL,
    cancelled_by INT NULL,
    cancelled_at TIMESTAMP NULL,
    cancellation_reason TEXT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (approved_by) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (rejected_by) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (cancelled_by) REFERENCES employees(id) ON DELETE SET NULL,
    INDEX idx_leave_requests_number (request_number),
    INDEX idx_leave_requests_employee (employee_id),
    INDEX idx_leave_requests_type (leave_type_id),
    INDEX idx_leave_requests_status (status),
    INDEX idx_leave_requests_dates (start_date, end_date),
    CONSTRAINT chk_leave_requests_dates CHECK (end_date >= start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Leave request management';

-- =====================================================
-- Step 9: Create leave_balances table
-- =====================================================

CREATE TABLE IF NOT EXISTS leave_balances (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    balance_year YEAR NOT NULL,
    initial_balance DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT 'Balance at start of year',
    used_balance DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT 'Days used',
    current_balance DECIMAL(5,2) GENERATED ALWAYS AS (initial_balance - used_balance) STORED,
    carried_forward DECIMAL(5,2) NULL DEFAULT 0.00 COMMENT 'Balance from previous year',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE RESTRICT,
    UNIQUE KEY uk_leave_balance (employee_id, leave_type_id, balance_year),
    INDEX idx_leave_balances_employee (employee_id),
    INDEX idx_leave_balances_type (leave_type_id),
    INDEX idx_leave_balances_year (balance_year),
    CONSTRAINT chk_leave_balances_used CHECK (used_balance >= 0),
    CONSTRAINT chk_leave_balances_current CHECK (current_balance >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Employee leave balance tracking';

-- =====================================================
-- Step 10: Alter users table - add employee_id field
-- =====================================================

ALTER TABLE users
ADD COLUMN IF NOT EXISTS employee_id INT NULL UNIQUE AFTER id,
ADD FOREIGN KEY IF NOT EXISTS fk_users_employee (employee_id) REFERENCES employees(id) ON DELETE SET NULL,
ADD INDEX IF NOT EXISTS idx_users_employee (employee_id);

-- =====================================================
-- Migration Complete
-- =====================================================

SELECT 'HR Management tables created successfully!' AS result;

