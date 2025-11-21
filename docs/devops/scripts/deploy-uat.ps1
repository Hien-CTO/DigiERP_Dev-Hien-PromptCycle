# DigiERP UAT Deployment Script
# This script builds and deploys the DigiERP system to UAT environment

param(
    [switch]$BuildOnly,
    [switch]$SkipMigrations,
    [string]$Service = ""
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DigiERP UAT Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.uat exists
if (-not (Test-Path ".env.uat")) {
    Write-Host "❌ Error: .env.uat file not found!" -ForegroundColor Red
    Write-Host "Please copy env.uat.example to .env.uat and update with actual values." -ForegroundColor Yellow
    exit 1
}

# Load environment variables from .env.uat
$envContent = Get-Content ".env.uat" | Where-Object { $_ -match '^\s*[^#]' -and $_ -match '=' }
foreach ($line in $envContent) {
    if ($line -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}

Write-Host "📋 Environment: UAT" -ForegroundColor Green
Write-Host "📋 Database: $env:DB_DATABASE" -ForegroundColor Green
Write-Host ""

# Step 1: Run migrations (if not skipped)
if (-not $SkipMigrations) {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Step 1: Running Database Migrations" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    
    Write-Host "⚠️  Note: Please ensure database migrations are run before deployment." -ForegroundColor Yellow
    Write-Host "   You can run migrations manually using:" -ForegroundColor Yellow
    Write-Host "   cd services/hr-service && npm run migration:run" -ForegroundColor Yellow
    Write-Host ""
    
    $runMigrations = Read-Host "Do you want to run migrations now? (y/N)"
    if ($runMigrations -eq "y" -or $runMigrations -eq "Y") {
        Write-Host "Running migrations for hr-service..." -ForegroundColor Yellow
        Push-Location "services/hr-service"
        try {
            npm run migration:run
            if ($LASTEXITCODE -ne 0) {
                Write-Host "❌ Migration failed!" -ForegroundColor Red
                exit 1
            }
            Write-Host "✅ Migrations completed successfully" -ForegroundColor Green
        } finally {
            Pop-Location
        }
    }
    Write-Host ""
}

# Step 2: Build Docker images
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 2: Building Docker Images" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($Service -ne "") {
    Write-Host "Building service: $Service" -ForegroundColor Yellow
    docker compose -f docker-compose.uat.yml build $Service
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed for $Service!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Building all services..." -ForegroundColor Yellow
    docker compose -f docker-compose.uat.yml build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Docker images built successfully" -ForegroundColor Green
Write-Host ""

if ($BuildOnly) {
    Write-Host "Build only mode - skipping deployment" -ForegroundColor Yellow
    exit 0
}

# Step 3: Stop existing containers
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 3: Stopping Existing Containers" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "Stopping existing UAT containers..." -ForegroundColor Yellow
docker compose -f docker-compose.uat.yml down
Write-Host "✅ Containers stopped" -ForegroundColor Green
Write-Host ""

# Step 4: Start services
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 4: Starting Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "Starting UAT services..." -ForegroundColor Yellow
docker compose -f docker-compose.uat.yml up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start services!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Services started" -ForegroundColor Green
Write-Host ""

# Step 5: Wait for services to be healthy
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 5: Waiting for Services to be Healthy" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$maxWait = 120 # seconds
$waitInterval = 5 # seconds
$elapsed = 0

Write-Host "Waiting for services to be ready (max $maxWait seconds)..." -ForegroundColor Yellow

while ($elapsed -lt $maxWait) {
    $hrServiceHealthy = docker compose -f docker-compose.uat.yml ps hr-service | Select-String "healthy|Up"
    $apiGatewayHealthy = docker compose -f docker-compose.uat.yml ps api-gateway | Select-String "healthy|Up"
    
    if ($hrServiceHealthy -and $apiGatewayHealthy) {
        Write-Host "✅ All services are healthy!" -ForegroundColor Green
        break
    }
    
    Start-Sleep -Seconds $waitInterval
    $elapsed += $waitInterval
    Write-Host "  Waiting... ($elapsed/$maxWait seconds)" -ForegroundColor Gray
}

if ($elapsed -ge $maxWait) {
    Write-Host "⚠️  Warning: Services may not be fully healthy yet" -ForegroundColor Yellow
}

Write-Host ""

# Step 6: Show service status
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 6: Service Status" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

docker compose -f docker-compose.uat.yml ps
Write-Host ""

# Step 7: Show logs
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 7: Recent Logs" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "HR Service logs (last 20 lines):" -ForegroundColor Yellow
docker compose -f docker-compose.uat.yml logs --tail=20 hr-service
Write-Host ""

Write-Host "API Gateway logs (last 20 lines):" -ForegroundColor Yellow
docker compose -f docker-compose.uat.yml logs --tail=20 api-gateway
Write-Host ""

# Final summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployment Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Deployment completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Services:" -ForegroundColor Yellow
Write-Host "  - HR Service: http://localhost:$env:HR_SERVICE_PORT" -ForegroundColor White
Write-Host "  - API Gateway: http://localhost:$env:API_GATEWAY_PORT" -ForegroundColor White
Write-Host "  - Admin Panel: http://localhost:$env:ADMIN_PANEL_PORT" -ForegroundColor White
Write-Host ""
Write-Host "API Endpoints:" -ForegroundColor Yellow
Write-Host "  - Attendance API: http://localhost:$env:API_GATEWAY_PORT/api/hr/attendance" -ForegroundColor White
Write-Host "  - Health Check: http://localhost:$env:HR_SERVICE_PORT/api/v1/health" -ForegroundColor White
Write-Host ""
Write-Host "To view logs:" -ForegroundColor Yellow
Write-Host "  docker compose -f docker-compose.uat.yml logs -f [service-name]" -ForegroundColor White
Write-Host ""
Write-Host "To stop services:" -ForegroundColor Yellow
Write-Host "  docker compose -f docker-compose.uat.yml down" -ForegroundColor White
Write-Host ""

