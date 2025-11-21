-- Script to create employee record for admin user (user_id = 7)
-- This ensures admin user has an employee record for HR features

-- Check if employee with user_id = 7 already exists
-- If not, create one

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
  (SELECT id FROM departments LIMIT 1), -- Use first department if exists
  (SELECT id FROM positions LIMIT 1), -- Use first position if exists
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
  employee_code = COALESCE(employee_code, 'ADMIN001'),
  first_name = COALESCE(first_name, 'Admin'),
  last_name = COALESCE(last_name, 'User'),
  is_active = true,
  updated_at = NOW()
WHERE user_id = 7;

