# Script to ensure admin user (user_id = 7) has an employee record
# This fixes the "User not found in request" error for admin user

param(
    [string]$DB_HOST = "103.245.255.55",
    [int]$DB_PORT = 3306,
    [string]$DB_USERNAME = "erp_user",
    [string]$DB_PASSWORD = "Digi!passw0rd",
    [string]$DB_DATABASE = "DigiERP_LeHuy_Dev2"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Ensure Admin Employee Record" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if mysql command is available
$mysqlCmd = Get-Command mysql -ErrorAction SilentlyContinue
if (-not $mysqlCmd) {
    Write-Host "❌ MySQL client not found. Please install MySQL client or use Docker." -ForegroundColor Red
    Write-Host "   Alternative: Run the SQL script manually in your database tool." -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 Database Configuration:" -ForegroundColor Yellow
Write-Host "   Host: $DB_HOST"
Write-Host "   Port: $DB_PORT"
Write-Host "   Database: $DB_DATABASE"
Write-Host "   Username: $DB_USERNAME"
Write-Host ""

# SQL script to ensure admin employee exists
$sqlScript = @'
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

UPDATE employees
SET 
  employee_code = COALESCE(NULLIF(employee_code, ''), 'ADMIN001'),
  first_name = COALESCE(NULLIF(first_name, ''), 'Admin'),
  last_name = COALESCE(NULLIF(last_name, ''), 'User'),
  is_active = true,
  updated_at = NOW()
WHERE user_id = 7;

SELECT id, employee_code, user_id, first_name, last_name, is_active 
FROM employees 
WHERE user_id = 7;
'@

Write-Host "🚀 Running SQL script..." -ForegroundColor Green
Write-Host ""

try {
    # Execute SQL script
    $env:MYSQL_PWD = $DB_PASSWORD
    $sqlScript | & mysql -h $DB_HOST -P $DB_PORT -u $DB_USERNAME $DB_DATABASE
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Successfully ensured admin employee record exists!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 Next steps:" -ForegroundColor Yellow
        Write-Host "   1. Restart HR service: docker compose restart hr-service" -ForegroundColor White
        Write-Host "   2. Test the API endpoints" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "❌ SQL execution failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error executing SQL: $_" -ForegroundColor Red
    exit 1
} finally {
    $env:MYSQL_PWD = $null
}

Write-Host ""
