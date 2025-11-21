# Script kiểm tra cấu trúc build output của NestJS
# Chạy sau khi build để xem file nào được tạo ra ở đâu

Write-Host "=== Kiểm tra cấu trúc thư mục dist ===" -ForegroundColor Cyan

$distPath = Join-Path $PSScriptRoot "dist"

if (Test-Path $distPath) {
    Write-Host "`nThư mục dist tồn tại" -ForegroundColor Green
    
    # Kiểm tra cấu trúc thư mục
    Write-Host "`nCấu trúc thư mục dist:" -ForegroundColor Yellow
    Get-ChildItem -Path $distPath -Recurse -Directory | ForEach-Object {
        Write-Host "  [DIR] $($_.FullName.Replace($PSScriptRoot, '.'))"
    }
    
    # Kiểm tra file main.js
    Write-Host "`nKiểm tra file main.js:" -ForegroundColor Yellow
    $mainJs1 = Join-Path $distPath "main.js"
    $mainJs2 = Join-Path $distPath "src" "main.js"
    
    if (Test-Path $mainJs1) {
        Write-Host "  ✓ Tìm thấy: dist/main.js" -ForegroundColor Green
        Write-Host "    Size: $((Get-Item $mainJs1).Length) bytes"
    } else {
        Write-Host "  ✗ Không tìm thấy: dist/main.js" -ForegroundColor Red
    }
    
    if (Test-Path $mainJs2) {
        Write-Host "  ✓ Tìm thấy: dist/src/main.js" -ForegroundColor Green
        Write-Host "    Size: $((Get-Item $mainJs2).Length) bytes"
    } else {
        Write-Host "  ✗ Không tìm thấy: dist/src/main.js" -ForegroundColor Red
    }
    
    # Liệt kê tất cả file .js trong dist
    Write-Host "`nTất cả file .js trong dist:" -ForegroundColor Yellow
    Get-ChildItem -Path $distPath -Recurse -File -Filter "*.js" | ForEach-Object {
        $relativePath = $_.FullName.Replace($PSScriptRoot, '.')
        Write-Host "  $relativePath ($($_.Length) bytes)"
    }
    
} else {
    Write-Host "`n✗ Thư mục dist không tồn tại. Cần chạy 'npm run build' trước!" -ForegroundColor Red
}

Write-Host "`n=== Kiểm tra package.json scripts ===" -ForegroundColor Cyan
$packageJson = Join-Path $PSScriptRoot "package.json"
if (Test-Path $packageJson) {
    $pkg = Get-Content $packageJson | ConvertFrom-Json
    Write-Host "  start:prod = $($pkg.scripts.'start:prod')" -ForegroundColor Yellow
}

Write-Host "`n=== Kiểm tra nest-cli.json ===" -ForegroundColor Cyan
$nestCliJson = Join-Path $PSScriptRoot "nest-cli.json"
if (Test-Path $nestCliJson) {
    $nestCli = Get-Content $nestCliJson | ConvertFrom-Json
    Write-Host "  sourceRoot = $($nestCli.sourceRoot)" -ForegroundColor Yellow
}

Write-Host "`n=== Kiểm tra tsconfig.json ===" -ForegroundColor Cyan
$tsConfigJson = Join-Path $PSScriptRoot "tsconfig.json"
if (Test-Path $tsConfigJson) {
    $tsConfig = Get-Content $tsConfigJson | ConvertFrom-Json
    Write-Host "  outDir = $($tsConfig.compilerOptions.outDir)" -ForegroundColor Yellow
}

Write-Host "`n=== Kiểm tra version NestJS CLI ===" -ForegroundColor Cyan
try {
    $nestVersion = npx nest --version 2>&1
    Write-Host "  NestJS CLI version: $nestVersion" -ForegroundColor Yellow
} catch {
    Write-Host "  Không thể kiểm tra version NestJS CLI" -ForegroundColor Red
}

Write-Host "`n=== Hoàn tất ===" -ForegroundColor Cyan

