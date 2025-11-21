# Script so sánh build output giữa các máy dev
# Chạy script này trên cả 2 máy để so sánh kết quả

Write-Host "=== THÔNG TIN MÔI TRƯỜNG ===" -ForegroundColor Cyan

# Node version
Write-Host "`nNode.js version:" -ForegroundColor Yellow
node --version

# NPM version
Write-Host "`nNPM version:" -ForegroundColor Yellow
npm --version

# NestJS CLI version
Write-Host "`nNestJS CLI version:" -ForegroundColor Yellow
try {
    npx nest --version 2>&1 | Out-String
} catch {
    Write-Host "  Không thể kiểm tra" -ForegroundColor Red
}

# Kiểm tra package-lock.json để xem version thực tế đã install
Write-Host "`n=== VERSION THỰC TẾ TRONG PACKAGE-LOCK.JSON ===" -ForegroundColor Cyan
$packageLockJson = Join-Path $PSScriptRoot "package-lock.json"
if (Test-Path $packageLockJson) {
    try {
        $lockFile = Get-Content $packageLockJson | ConvertFrom-Json
        $nestCliPkg = $lockFile.packages.'node_modules/@nestjs/cli'
        if ($nestCliPkg) {
            Write-Host "  @nestjs/cli: $($nestCliPkg.version)" -ForegroundColor Yellow
        }
        
        $nestCorePkg = $lockFile.packages.'node_modules/@nestjs/core'
        if ($nestCorePkg) {
            Write-Host "  @nestjs/core: $($nestCorePkg.version)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  Không thể đọc package-lock.json" -ForegroundColor Red
    }
} else {
    Write-Host "  package-lock.json không tồn tại" -ForegroundColor Red
}

# Kiểm tra cấu hình build
Write-Host "`n=== CẤU HÌNH BUILD ===" -ForegroundColor Cyan

# nest-cli.json
Write-Host "`nnest-cli.json:" -ForegroundColor Yellow
$nestCliJson = Join-Path $PSScriptRoot "nest-cli.json"
if (Test-Path $nestCliJson) {
    $nestCli = Get-Content $nestCliJson | ConvertFrom-Json
    Write-Host "  sourceRoot: $($nestCli.sourceRoot)"
    if ($nestCli.compilerOptions) {
        Write-Host "  deleteOutDir: $($nestCli.compilerOptions.deleteOutDir)"
    }
} else {
    Write-Host "  Không tìm thấy nest-cli.json" -ForegroundColor Red
}

# tsconfig.json
Write-Host "`ntsconfig.json:" -ForegroundColor Yellow
$tsConfigJson = Join-Path $PSScriptRoot "tsconfig.json"
if (Test-Path $tsConfigJson) {
    $tsConfig = Get-Content $tsConfigJson | ConvertFrom-Json
    Write-Host "  outDir: $($tsConfig.compilerOptions.outDir)"
    Write-Host "  baseUrl: $($tsConfig.compilerOptions.baseUrl)"
} else {
    Write-Host "  Không tìm thấy tsconfig.json" -ForegroundColor Red
}

# package.json
Write-Host "`npackage.json:" -ForegroundColor Yellow
$packageJson = Join-Path $PSScriptRoot "package.json"
if (Test-Path $packageJson) {
    $pkg = Get-Content $packageJson | ConvertFrom-Json
    Write-Host "  start:prod: $($pkg.scripts.'start:prod')"
}

# Kiểm tra cấu trúc dist sau khi build
Write-Host "`n=== CẤU TRÚC DIST (sau khi build) ===" -ForegroundColor Cyan
Write-Host "  Lưu ý: Cần chạy 'npm run build' trước!" -ForegroundColor Yellow

$distPath = Join-Path $PSScriptRoot "dist"
if (Test-Path $distPath) {
    Write-Host "`nCấu trúc thư mục dist:" -ForegroundColor Yellow
    Get-ChildItem -Path $distPath -Recurse | ForEach-Object {
        $relativePath = $_.FullName.Replace($PSScriptRoot, '.')
        $type = if ($_.PSIsContainer) { "[DIR]" } else { "[FILE]" }
        Write-Host "  $type $relativePath"
    }
    
    # Tìm file main
    Write-Host "`nVị trí file main:" -ForegroundColor Yellow
    $possibleMainPaths = @(
        "dist/main.js",
        "dist/src/main.js",
        "dist/main/main.js"
    )
    
    foreach ($path in $possibleMainPaths) {
        $fullPath = Join-Path $PSScriptRoot $path
        if (Test-Path $fullPath) {
            Write-Host "  ✓ Tìm thấy: $path" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Không có: $path" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "  Thư mục dist chưa được tạo. Chạy 'npm run build' để tạo." -ForegroundColor Red
}

Write-Host "`n=== HOÀN TẤT ===" -ForegroundColor Cyan
Write-Host "Lưu kết quả này và so sánh với máy dev khác!" -ForegroundColor Yellow

