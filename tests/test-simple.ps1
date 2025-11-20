#!/usr/bin/env pwsh

Write-Host "🚀 API Gateway Test" -ForegroundColor Green

# Get token
$loginResponse = Invoke-WebRequest -Uri "http://localhost:4000/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"usernameOrEmail":"admin","password":"admin123"}'
$loginJson = $loginResponse.Content | ConvertFrom-Json
$token = $loginJson.accessToken

Write-Host "✅ Token obtained" -ForegroundColor Green

# Test APIs
$tests = @(
    @{Name="Users"; Url="http://localhost:4000/api/users?page=1&limit=10"},
    @{Name="Roles"; Url="http://localhost:4000/api/users/roles?page=1&limit=10"},
    @{Name="Products"; Url="http://localhost:4000/api/products?page=1&limit=10"},
    @{Name="Categories"; Url="http://localhost:4000/api/products/categories?page=1&limit=10"},
    @{Name="Sales Orders"; Url="http://localhost:4000/api/sales/orders?page=1&limit=10"},
    @{Name="Warehouses"; Url="http://localhost:4000/api/inventory/warehouses?page=1&limit=10"},
    @{Name="Suppliers"; Url="http://localhost:4000/api/purchase/suppliers?page=1&limit=10"},
    @{Name="Invoices"; Url="http://localhost:4000/api/financial/invoices?page=1&limit=10"},
    @{Name="Reports"; Url="http://localhost:4000/api/financial/reports/sales-overview"}
)

$passed = 0
$total = $tests.Count

foreach ($test in $tests) {
    try {
        $response = Invoke-WebRequest -Uri $test.Url -Headers @{"Authorization"="Bearer $token"}
        Write-Host "✅ $($test.Name): $($response.StatusCode)" -ForegroundColor Green
        $passed++
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "❌ $($test.Name): $statusCode" -ForegroundColor Red
    }
}

$rate = [math]::Round(($passed / $total) * 100, 1)
Write-Host "`nResults: $passed/$total passed ($rate%)" -ForegroundColor $(if ($rate -ge 80) { "Green" } else { "Yellow" })






