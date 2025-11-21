# Script to run SQL migration
# Database connection from env.example

$DB_HOST = "103.245.255.55"
$DB_PORT = "3306"
$DB_USERNAME = "erp_user"
$DB_PASSWORD = "Digi!passw0rd"
$DB_DATABASE = "DigiERP_LeHuy_Dev2"
$SQL_FILE = "src\infrastructure\database\migrations\1735000000000-ExtendAttendanceManagement.sql"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Running Migration: ExtendAttendanceManagement" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Database: $DB_DATABASE" -ForegroundColor Yellow
Write-Host "Host: $DB_HOST" -ForegroundColor Yellow
Write-Host "SQL File: $SQL_FILE" -ForegroundColor Yellow
Write-Host ""

# Check if mysql command is available
$mysqlPath = Get-Command mysql -ErrorAction SilentlyContinue
if (-not $mysqlPath) {
    Write-Host "❌ MySQL command not found. Please install MySQL client or add it to PATH." -ForegroundColor Red
    Write-Host "Alternative: You can run the SQL file manually using MySQL Workbench or phpMyAdmin" -ForegroundColor Yellow
    exit 1
}

# Read SQL file content
if (-not (Test-Path $SQL_FILE)) {
    Write-Host "❌ SQL file not found: $SQL_FILE" -ForegroundColor Red
    exit 1
}

Write-Host "✅ SQL file found. Executing migration..." -ForegroundColor Green
Write-Host ""

# Run SQL file
$env:MYSQL_PWD = $DB_PASSWORD
Get-Content $SQL_FILE | mysql -h $DB_HOST -P $DB_PORT -u $DB_USERNAME $DB_DATABASE

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Migration failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}

