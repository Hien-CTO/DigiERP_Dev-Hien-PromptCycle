-- Script to create employee record for admin user (user_id = 7)
-- Run this SQL script in your database tool (MySQL Workbench, phpMyAdmin, etc.)
-- This fixes the "User not found in request" error for admin user

-- Insert employee record if not exists
INSERT INTO employees (
  employee_code,
  user_id,
  first_name,
  last_name,
  gender,
  phone,
  email,
  department_id,
  position_id,
  hire_date,
  is_active,
  created_at,
  updated_at
)
SELECT 
  'ADMIN001',
  7,
  'Admin',
  'User',
  'MALE',
  '0000000000',
  'admin@digierp.com',
  COALESCE((SELECT id FROM departments LIMIT 1), NULL),
  COALESCE((SELECT id FROM positions LIMIT 1), NULL),
  CURDATE(),
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM employees WHERE user_id = 7
);

-- Update existing employee if user_id = 7 exists but missing fields
UPDATE employees
SET 
  employee_code = COALESCE(NULLIF(employee_code, ''), 'ADMIN001'),
  first_name = COALESCE(NULLIF(first_name, ''), 'Admin'),
  last_name = COALESCE(NULLIF(last_name, ''), 'User'),
  is_active = true,
  updated_at = NOW()
WHERE user_id = 7;

-- Verify the employee was created/updated
SELECT id, employee_code, user_id, first_name, last_name, is_active 
FROM employees 
WHERE user_id = 7;

