# Script to orchestrate end-to-end feature development workflow
# Usage: 
#   .\orchestrate-feature.ps1 -FeatureName "cham-cong" -Description "Tính năng chấm công cho nhân viên"
#   .\orchestrate-feature.ps1 -FeatureName "cham-cong" -StartFromRole "fullstack-developer"
#   .\orchestrate-feature.ps1 -FeatureName "cham-cong" -StartFromStep 4
#   .\orchestrate-feature.ps1 -FeatureName "cham-cong" -StartFromStep 2 -EndAtStep 4
#   .\orchestrate-feature.ps1 -FeatureName "cham-cong" -StartFromRole "business-analyst" -EndAtRole "fullstack-developer"
#
# Keyboard Shortcuts (while script is running):
#   Ctrl+Alt+F : Skip current step
#   Ctrl+Alt+U : Go back to previous step
#   Ctrl+Alt+C : Cancel/Stop workflow
#
# Features:
# - Automatically generates prompts for each step
# - Copies prompts to clipboard for easy pasting into Cursor AI
# - Creates prompt files for reference
# - Tracks progress and creates workflow summary
# - Monitor file changes across entire repository (respects .gitignore)
# - Can start from any step or role
# - Can end at any step or role
# - Keyboard shortcuts for workflow control

param(
    [Parameter(Mandatory=$true)]
    [string]$FeatureName,
    
    [Parameter(Mandatory=$false)]
    [string]$Description = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipSteps,
    
    [Parameter(Mandatory=$false)]
    [string[]]$SkipStepNumbers = @(),
    
    [Parameter(Mandatory=$false)]
    [int]$StartFromStep = 1,
    
    [Parameter(Mandatory=$false)]
    [string]$StartFromRole = "",
    
    [Parameter(Mandatory=$false)]
    [int]$EndAtStep = 0,
    
    [Parameter(Mandatory=$false)]
    [string]$EndAtRole = ""
)

# Workflow steps - Thứ tự mới: product-owner => business-analyst => database-engineer => fullstack-developer => devops => automation-tester => security-tester
$workflow = @(
    @{ 
        Role = "product-owner"; 
        Step = 1; 
        Name = "Product Owner - Define Epic/Features";
        Description = "Xác định epic/feature, tạo user stories và acceptance criteria";
        OutputDir = "docs/product-owner";
        OutputFiles = @("epic-*.md", "epics-and-features.md");
        CanSkip = $true;
        SkipCheckFunction = "Check-IfFeatureExistsInEpic"
    },
    @{ 
        Role = "business-analyst"; 
        Step = 2; 
        Name = "Business Analyst - Analyze Requirements";
        Description = "Phân tích requirements, tạo use cases và business rules";
        OutputDir = "docs/business-analyst";
        OutputFiles = @("use-cases-*.md", "business-rules-*.md");
        CanSkip = $true;
        SkipCheckFunction = "Check-IfBusinessAnalystComplete"
    },
    @{ 
        Role = "database-engineer"; 
        Step = 3; 
        Name = "Database Engineer - Design Schema";
        Description = "Thiết kế database schema và tạo migration scripts";
        OutputDir = "docs/database-engineer";
        OutputFiles = @("schema-*.md", "**/migrations/*.ts");
        CanSkip = $true;
        SkipCheckFunction = "Check-IfDatabaseComplete"
    },
    @{ 
        Role = "fullstack-developer"; 
        Step = 4; 
        Name = "Fullstack Developer - Implement";
        Description = "Implement backend (NestJS) và frontend (Next.js)";
        OutputDir = "";
        OutputFiles = @("services/**/*.ts", "apps/admin-panel/**/*.tsx");
        CanSkip = $false;
        SkipCheckFunction = $null
    },
    @{ 
        Role = "devops"; 
        Step = 5; 
        Name = "DevOps - Deploy";
        Description = "Check Docker configs và docker compose up";
        OutputDir = "";
        OutputFiles = @("deployment-*.md", "docker-compose.yml", "**/Dockerfile");
        CanSkip = $false;
        SkipCheckFunction = $null;
        CanRollback = $true;
        RollbackToStep = 4
    },
    @{ 
        Role = "automation-tester"; 
        Step = 6; 
        Name = "Automation Tester - Write Tests";
        Description = "Viết Playwright E2E tests và chạy test reports";
        OutputDir = "tests";
        OutputFiles = @("e2e/*.e2e-spec.ts", "reports/*.html");
        CanSkip = $false;
        SkipCheckFunction = $null;
        CanRollback = $true;
        RollbackToStep = 4
    },
    @{ 
        Role = "security-tester"; 
        Step = 7; 
        Name = "Security Tester - Security Audit";
        Description = "Security audit và kiểm tra OWASP Top 10";
        OutputDir = "docs/security-tester";
        OutputFiles = @("security-audit-*.md");
        CanSkip = $false;
        SkipCheckFunction = $null
    }
)

# Create workflows directory if not exists
$workflowsDir = "docs/workflows"
if (-not (Test-Path $workflowsDir)) {
    New-Item -ItemType Directory -Path $workflowsDir -Force | Out-Null
    Write-Host "Created directory: $workflowsDir" -ForegroundColor Green
}

# Create workflow summary file
$summaryFile = "$workflowsDir/$FeatureName-workflow-summary.md"
$startTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

$summaryContent = "# Workflow Summary: $FeatureName`n`n"
$summaryContent += "**Feature**: $FeatureName`n"
$summaryContent += "**Description**: $Description`n"
$summaryContent += "**Started**: $startTime`n"
$summaryContent += "**Status**: In Progress`n`n"

# Add workflow range information
if ($actualStartStep -gt 1 -or $actualEndStep -lt $workflow.Count) {
    $summaryContent += "**Workflow Range**: Step $actualStartStep → Step $actualEndStep`n"
    if ($StartFromRole) {
        $summaryContent += "**Start Role**: $StartFromRole`n"
    }
    if ($EndAtRole) {
        $summaryContent += "**End Role**: $EndAtRole`n"
    }
    $summaryContent += "`n"
}

$summaryContent += "## Overview`n`n"
$summaryContent += "Workflow này thực hiện quy trình phát triển tính năng `"$FeatureName`" từ Step $actualStartStep đến Step $actualEndStep qua các role agents.`n`n"
$summaryContent += "## Workflow Steps`n`n"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Orchestrating Feature: $FeatureName" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
if ($Description) {
    Write-Host "Description: $Description" -ForegroundColor Gray
    Write-Host ""
}

# Determine starting step
$actualStartStep = if ($StartFromStep -gt 0) { $StartFromStep } else { 1 }
if ($StartFromRole) {
    # Find step by role name
    $roleStep = $workflow | Where-Object { $_.Role -eq $StartFromRole } | Select-Object -First 1
    if ($roleStep) {
        $actualStartStep = $roleStep.Step
        Write-Host "Starting from role: $StartFromRole (Step $actualStartStep)" -ForegroundColor Cyan
        Write-Host ""
    } else {
        Write-Host "⚠️  Không tìm thấy role '$StartFromRole', sẽ bắt đầu từ step $actualStartStep" -ForegroundColor Yellow
        Write-Host ""
    }
} elseif ($actualStartStep -gt 1) {
    Write-Host "Starting from step: $actualStartStep" -ForegroundColor Cyan
    Write-Host ""
}

# Determine ending step
$actualEndStep = if ($EndAtStep -gt 0) { $EndAtStep } else { $workflow.Count }
if ($EndAtRole) {
    # Find step by role name
    $roleStep = $workflow | Where-Object { $_.Role -eq $EndAtRole } | Select-Object -First 1
    if ($roleStep) {
        $actualEndStep = $roleStep.Step
        Write-Host "Ending at role: $EndAtRole (Step $actualEndStep)" -ForegroundColor Cyan
        Write-Host ""
    } else {
        Write-Host "⚠️  Không tìm thấy role '$EndAtRole', sẽ kết thúc ở step $actualEndStep" -ForegroundColor Yellow
        Write-Host ""
    }
} elseif ($EndAtStep -gt 0) {
    Write-Host "Ending at step: $actualEndStep" -ForegroundColor Cyan
    Write-Host ""
}

# Validate start and end steps
if ($actualStartStep -gt $actualEndStep) {
    Write-Host "⚠️  Lỗi: Start step ($actualStartStep) không thể lớn hơn End step ($actualEndStep)" -ForegroundColor Red
    Write-Host "  → Script sẽ kết thúc" -ForegroundColor Red
    exit 1
}

if ($actualStartStep -gt 0 -and $actualEndStep -gt 0) {
    Write-Host "Workflow range: Step $actualStartStep → Step $actualEndStep" -ForegroundColor Cyan
    Write-Host ""
}

# Global variables for keyboard shortcuts control
$script:skipCurrentStep = $false
$script:goBackToPreviousStep = $false
$script:cancelWorkflow = $false
$script:currentStepNumber = 0
$script:lastKeyCheck = @{
    Skip = $false
    Back = $false
    Cancel = $false
}

# Add Windows API for keyboard state checking (only on Windows)
if ($IsWindows -or $env:OS -like "*Windows*") {
    Add-Type @"
using System;
using System.Runtime.InteropServices;
public class KeyboardHook {
    [DllImport("user32.dll")]
    public static extern short GetAsyncKeyState(int vKey);
    
    public const int VK_CONTROL = 0x11;
    public const int VK_MENU = 0x12;  // Alt key
    public const int VK_F = 0x46;
    public const int VK_U = 0x55;
    public const int VK_C = 0x43;
}
"@
}

# Show keyboard shortcuts
Show-KeyboardShortcuts

Write-Host "⚠️  QUAN TRỌNG: Để keyboard shortcuts hoạt động:" -ForegroundColor Yellow
Write-Host "   1. Terminal window phải được FOCUS (click vào terminal)" -ForegroundColor Yellow
Write-Host "   2. Không chạy trong VS Code/Cursor integrated terminal (dùng standalone PowerShell)" -ForegroundColor Yellow
Write-Host "   3. Nếu không hoạt động, thử chạy PowerShell as Administrator" -ForegroundColor Yellow
Write-Host "   4. ⚠️  Keyboard shortcuts KHÔNG hoạt động khi màn hình bị LOCKED!" -ForegroundColor Red
Write-Host "      → Script vẫn chạy (monitor files, etc.) nhưng không thể detect keyboard" -ForegroundColor Red
Write-Host "      → Phải unlock màn hình để sử dụng keyboard shortcuts" -ForegroundColor Red
Write-Host ""

$completedSteps = @()
$previousStepNumber = 0

# Function to check keyboard shortcuts (with debouncing to avoid multiple triggers)
function Test-KeyboardShortcuts {
    # Only work on Windows
    if (-not ($IsWindows -or $env:OS -like "*Windows*")) {
        return $null
    }
    
    # Note: This function will NOT work when screen is locked
    # GetAsyncKeyState cannot detect keys when Windows is locked
    
    $ctrlPressed = ([KeyboardHook]::GetAsyncKeyState([KeyboardHook]::VK_CONTROL) -band 0x8000) -ne 0
    $altPressed = ([KeyboardHook]::GetAsyncKeyState([KeyboardHook]::VK_MENU) -band 0x8000) -ne 0
    
    if ($ctrlPressed -and $altPressed) {
        # Check for F key (Skip) - only trigger once per key press
        $fPressed = ([KeyboardHook]::GetAsyncKeyState([KeyboardHook]::VK_F) -band 0x8000) -ne 0
        if ($fPressed -and -not $script:lastKeyCheck.Skip) {
            $script:lastKeyCheck.Skip = $true
            Start-Sleep -Milliseconds 200  # Debounce
            return "Skip"
        } elseif (-not $fPressed) {
            $script:lastKeyCheck.Skip = $false
        }
        
        # Check for U key (Back) - only trigger once per key press
        $uPressed = ([KeyboardHook]::GetAsyncKeyState([KeyboardHook]::VK_U) -band 0x8000) -ne 0
        if ($uPressed -and -not $script:lastKeyCheck.Back) {
            $script:lastKeyCheck.Back = $true
            Start-Sleep -Milliseconds 200  # Debounce
            return "Back"
        } elseif (-not $uPressed) {
            $script:lastKeyCheck.Back = $false
        }
        
        # Check for C key (Cancel) - only trigger once per key press
        $cPressed = ([KeyboardHook]::GetAsyncKeyState([KeyboardHook]::VK_C) -band 0x8000) -ne 0
        if ($cPressed -and -not $script:lastKeyCheck.Cancel) {
            $script:lastKeyCheck.Cancel = $true
            Start-Sleep -Milliseconds 200  # Debounce
            return "Cancel"
        } elseif (-not $cPressed) {
            $script:lastKeyCheck.Cancel = $false
        }
    } else {
        # Reset all key states when Ctrl+Alt is released
        $script:lastKeyCheck.Skip = $false
        $script:lastKeyCheck.Back = $false
        $script:lastKeyCheck.Cancel = $false
    }
    
    return $null
}

# Function to display keyboard shortcuts help
function Show-KeyboardShortcuts {
    Write-Host ""
    Write-Host "  ========================================" -ForegroundColor Cyan
    Write-Host "  KEYBOARD SHORTCUTS" -ForegroundColor Cyan
    Write-Host "  ========================================" -ForegroundColor Cyan
    Write-Host "  Ctrl+Alt+F : Skip current step" -ForegroundColor Yellow
    Write-Host "  Ctrl+Alt+U : Go back to previous step" -ForegroundColor Yellow
    Write-Host "  Ctrl+Alt+C : Cancel/Stop workflow" -ForegroundColor Yellow
    Write-Host "  ========================================" -ForegroundColor Cyan
    Write-Host ""
}

# Function to check if feature already exists in epic with "In Progress" status
function Check-IfFeatureExistsInEpic {
    param([string]$FeatureName)
    
    Write-Host "  → Đang kiểm tra xem feature '$FeatureName' đã có trong epic chưa..." -ForegroundColor Cyan
    
    # Create search patterns for different feature name variations
    # Example: "cham-cong" -> ["cham-cong", "chấm công", "cham cong", "attendance", "Attendance Management"]
    $searchPatterns = @()
    
    # Add original feature name
    $searchPatterns += $FeatureName
    
    # Add variations: replace hyphens with spaces, convert to Vietnamese
    $searchPatterns += $FeatureName.Replace("-", " ")
    $searchPatterns += $FeatureName.Replace("-", "-").ToLower()
    
    # Common mappings for feature names
    $nameMappings = @{
        "cham-cong" = @("chấm công", "Attendance Management", "attendance", "attendance management")
    }
    
    # Add mapped names if available
    if ($nameMappings.ContainsKey($FeatureName)) {
        $searchPatterns += $nameMappings[$FeatureName]
    }
    
    # Also try to extract English name from common patterns
    # "cham-cong" might be "attendance" or "attendance-management"
    if ($FeatureName -match "cham-cong|cham_cong") {
        $searchPatterns += "attendance"
        $searchPatterns += "Attendance Management"
        $searchPatterns += "attendance-management"
    }
    
    # Search for feature in epic files
    $epicFiles = Get-ChildItem -Path "docs/product-owner" -Filter "epic-*.md" -ErrorAction SilentlyContinue
    
    foreach ($epicFile in $epicFiles) {
        $content = Get-Content -Path $epicFile.FullName -Raw -ErrorAction SilentlyContinue
        if ($content) {
            # Try each search pattern
            foreach ($pattern in $searchPatterns) {
                # Escape special regex characters but keep case-insensitive matching
                $escapedPattern = [regex]::Escape($pattern)
                
                # Look for feature name in the content (case-insensitive)
                if ($content -match "(?i)$escapedPattern") {
                    Write-Host "  → Tìm thấy pattern '$pattern' trong file $($epicFile.Name)" -ForegroundColor Gray
                    
                    # Now check if there's "In Progress" status near this pattern
                    # Look for "In Progress" within 100 lines of where we found the pattern
                    $lines = $content -split "`n"
                    $patternLineIndex = -1
                    
                    # Find the line where pattern appears
                    for ($i = 0; $i -lt $lines.Count; $i++) {
                        if ($lines[$i] -match "(?i)$escapedPattern") {
                            $patternLineIndex = $i
                            break
                        }
                    }
                    
                    if ($patternLineIndex -ge 0) {
                        # Check lines around the pattern (within 50 lines before and after)
                        $startLine = [Math]::Max(0, $patternLineIndex - 50)
                        $endLine = [Math]::Min($lines.Count - 1, $patternLineIndex + 50)
                        
                        $sectionContent = $lines[$startLine..$endLine] -join "`n"
                        
                        # Check if this section has "In Progress" status
                        if ($sectionContent -match "(?i)Status.*In Progress|In Progress|`*\*Status`*\s*:\s*In Progress") {
                            Write-Host "  → ✓ Tìm thấy feature '$pattern' trong epic với status 'In Progress'" -ForegroundColor Green
                            Write-Host "  → File: $($epicFile.Name)" -ForegroundColor Gray
                            return $true
                        }
                    }
                }
            }
        }
    }
    
    Write-Host "  → Không tìm thấy feature '$FeatureName' với status 'In Progress' trong epic" -ForegroundColor Yellow
    Write-Host "  → Đã tìm kiếm với các pattern: $($searchPatterns -join ', ')" -ForegroundColor DarkGray
    return $false
}

# Function to check if Business Analyst documentation is complete
function Check-IfBusinessAnalystComplete {
    param([string]$FeatureName)
    
    Write-Host "  → Đang kiểm tra xem Business Analyst đã hoàn thành đầy đủ chưa..." -ForegroundColor Cyan
    
    # Create search patterns for different feature name variations
    $searchPatterns = @()
    $searchPatterns += $FeatureName
    $searchPatterns += $FeatureName.Replace("-", " ")
    $searchPatterns += $FeatureName.Replace("-", "-").ToLower()
    
    # Common mappings
    if ($FeatureName -match "cham-cong|cham_cong") {
        $searchPatterns += "attendance"
        $searchPatterns += "Attendance Management"
        $searchPatterns += "attendance-management"
        $searchPatterns += "chấm công"
    }
    
    $hasUseCases = $false
    $hasBusinessRules = $false
    
    # Check for use-cases file - try multiple patterns
    $useCasesFiles = Get-ChildItem -Path "docs/business-analyst" -Filter "use-cases-*.md" -ErrorAction SilentlyContinue
    foreach ($file in $useCasesFiles) {
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
        if ($content) {
            # Check filename first
            $fileNameMatch = $false
            foreach ($pattern in $searchPatterns) {
                if ($file.Name -like "*$pattern*" -or $file.Name -match "(?i)$([regex]::Escape($pattern))") {
                    $fileNameMatch = $true
                    break
                }
            }
            
            # Check content
            $contentMatch = $false
            foreach ($pattern in $searchPatterns) {
                $escapedPattern = [regex]::Escape($pattern)
                if ($content -match "(?i)$escapedPattern") {
                    $contentMatch = $true
                    break
                }
            }
            
            if ($fileNameMatch -or $contentMatch) {
                $hasUseCases = $true
                Write-Host "  → ✓ Tìm thấy use-cases: $($file.Name)" -ForegroundColor Green
                break
            }
        }
    }
    
    # Check for business-rules file - can be in general HR file or specific file
    $businessRulesFiles = Get-ChildItem -Path "docs/business-analyst" -Filter "business-rules-*.md" -ErrorAction SilentlyContinue
    foreach ($file in $businessRulesFiles) {
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
        if ($content) {
            # Check if file contains our feature (even if filename doesn't match)
            $contentMatch = $false
            foreach ($pattern in $searchPatterns) {
                $escapedPattern = [regex]::Escape($pattern)
                # Look for feature name in content, especially in section headers
                if ($content -match "(?i)$escapedPattern|Attendance Management|BR-ATT-|BR-HR-006") {
                    $contentMatch = $true
                    break
                }
            }
            
            # Also check filename
            $fileNameMatch = $false
            foreach ($pattern in $searchPatterns) {
                if ($file.Name -like "*$pattern*" -or $file.Name -match "(?i)$([regex]::Escape($pattern))") {
                    $fileNameMatch = $true
                    break
                }
            }
            
            if ($fileNameMatch -or $contentMatch) {
                $hasBusinessRules = $true
                Write-Host "  → ✓ Tìm thấy business-rules: $($file.Name)" -ForegroundColor Green
                break
            }
        }
    }
    
    # Consider complete if has use-cases and business-rules
    if ($hasUseCases -and $hasBusinessRules) {
        Write-Host "  → ✓ Business Analyst documentation đã đầy đủ (use-cases + business-rules)" -ForegroundColor Green
        return $true
    }
    
    Write-Host "  → Business Analyst documentation chưa đầy đủ:" -ForegroundColor Yellow
    if (-not $hasUseCases) { Write-Host "    - Thiếu use-cases" -ForegroundColor Yellow }
    if (-not $hasBusinessRules) { Write-Host "    - Thiếu business-rules" -ForegroundColor Yellow }
    Write-Host "  → Đã tìm kiếm với các pattern: $($searchPatterns -join ', ')" -ForegroundColor DarkGray
    return $false
}

# Function to check if Database Engineer documentation is complete
function Check-IfDatabaseComplete {
    param([string]$FeatureName)
    
    Write-Host "  → Đang kiểm tra xem Database Engineer đã thiết kế đầy đủ chưa..." -ForegroundColor Cyan
    
    $hasSchema = $false
    
    # Check for schema file
    $schemaFiles = Get-ChildItem -Path "docs/database-engineer" -Filter "schema-*.md" -ErrorAction SilentlyContinue
    foreach ($file in $schemaFiles) {
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
        if ($content -and ($content -match [regex]::Escape($FeatureName) -or $file.Name -like "*$FeatureName*")) {
            # Check if schema file has actual table definitions (not just placeholder)
            if ($content -match "(?i)CREATE TABLE|CREATE TABLE IF NOT EXISTS|@Entity|class.*Entity") {
                $hasSchema = $true
                Write-Host "  → ✓ Tìm thấy schema file với table definitions: $($file.Name)" -ForegroundColor Green
                break
            }
        }
    }
    
    # Also check Database-Architecture.md for feature references
    $dbArchFile = "docs/database-engineer/Database-Architecture.md"
    if (Test-Path $dbArchFile) {
        $content = Get-Content -Path $dbArchFile -Raw -ErrorAction SilentlyContinue
        if ($content -and ($content -match [regex]::Escape($FeatureName))) {
            Write-Host "  → ✓ Tìm thấy reference trong Database-Architecture.md" -ForegroundColor Green
            $hasSchema = $true
        }
    }
    
    if ($hasSchema) {
        Write-Host "  → ✓ Database schema đã được thiết kế đầy đủ" -ForegroundColor Green
        return $true
    }
    
    Write-Host "  → Database schema chưa được thiết kế đầy đủ" -ForegroundColor Yellow
    return $false
}

# Function to open new agent tab in Cursor
function Open-NewAgentTab {
    # Add required assemblies
    Add-Type -AssemblyName System.Windows.Forms
    Add-Type -AssemblyName System.Drawing
    
    Write-Host "  → Đang mở agent tab mới trong Cursor..." -ForegroundColor Cyan
    
    # Try multiple methods to find Cursor process
    $cursorProcess = $null
    $maxRetries = 3
    
    for ($retry = 1; $retry -le $maxRetries; $retry++) {
        Write-Host "  → Đang tìm Cursor process (lần thử $retry/$maxRetries)..." -ForegroundColor Gray
        
        # Method 1: Try exact process name "Cursor"
        try {
            $cursorProcess = Get-Process -Name "Cursor" -ErrorAction SilentlyContinue | 
                Where-Object { $_.MainWindowHandle -ne [IntPtr]::Zero } | 
                Select-Object -First 1
        } catch {}
        
        # Method 2: Try case-insensitive process name
        if (-not $cursorProcess) {
            try {
                $cursorProcess = Get-Process | Where-Object { 
                    $_.ProcessName -eq "Cursor" -or 
                    $_.ProcessName -like "*cursor*"
                } | Where-Object { $_.MainWindowHandle -ne [IntPtr]::Zero } | 
                Select-Object -First 1
            } catch {}
        }
        
        # Method 3: Try by MainWindowTitle
        if (-not $cursorProcess) {
            try {
                $cursorProcess = Get-Process | Where-Object { 
                    $_.MainWindowTitle -like "*Cursor*" -or 
                    $_.MainWindowTitle -like "*cursor*"
                } | Where-Object { $_.MainWindowHandle -ne [IntPtr]::Zero } | 
                Select-Object -First 1
            } catch {}
        }
        
        # Method 4: Try by executable path
        if (-not $cursorProcess) {
            try {
                $cursorProcess = Get-Process | Where-Object { 
                    ($_.Path -and ($_.Path -like "*Cursor*" -or $_.Path -like "*cursor*")) -or
                    ($null -eq $_.Path -and $_.ProcessName -like "*cursor*")
                } | Where-Object { $_.MainWindowHandle -ne [IntPtr]::Zero } | 
                Select-Object -First 1
            } catch {}
        }
        
        if ($cursorProcess -and $cursorProcess.MainWindowHandle -ne [IntPtr]::Zero) {
            Write-Host "  → ✓ Đã tìm thấy Cursor process: $($cursorProcess.ProcessName) (PID: $($cursorProcess.Id))" -ForegroundColor Green
            break
        }
        
        if ($retry -lt $maxRetries) {
            Write-Host "  → Không tìm thấy, đợi 1 giây rồi thử lại..." -ForegroundColor Yellow
            Start-Sleep -Seconds 1
        }
    }
    
    if (-not $cursorProcess -or $cursorProcess.MainWindowHandle -eq [IntPtr]::Zero) {
        Write-Host "  ⚠️  Không tìm thấy Cursor window sau $maxRetries lần thử" -ForegroundColor Yellow
        Write-Host "  → Vui lòng đảm bảo Cursor đang mở và có window visible" -ForegroundColor Yellow
        Write-Host "  → Hoặc bạn có thể click vào Cursor window và script sẽ tiếp tục" -ForegroundColor Yellow
        
        # Give user a chance to manually focus Cursor
        Write-Host "  → Đang đợi 3 giây để bạn có thể click vào Cursor..." -ForegroundColor Cyan
        Start-Sleep -Seconds 3
        
        # Try one more time after user might have focused
        try {
            $cursorProcess = Get-Process -Name "Cursor" -ErrorAction SilentlyContinue | 
                Where-Object { $_.MainWindowHandle -ne [IntPtr]::Zero } | 
                Select-Object -First 1
        } catch {}
        
        if (-not $cursorProcess -or $cursorProcess.MainWindowHandle -eq [IntPtr]::Zero) {
            return $false
        }
    }
    
    # Focus Cursor window
    try {
        Write-Host "  → Đang focus vào Cursor window..." -ForegroundColor Gray
        # Use Windows API to bring window to front
        Add-Type @"
            using System;
            using System.Runtime.InteropServices;
            public class Win32 {
                [DllImport("user32.dll")]
                public static extern bool SetForegroundWindow(IntPtr hWnd);
                [DllImport("user32.dll")]
                public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
                public static int SW_RESTORE = 9;
                [DllImport("user32.dll")]
                public static extern bool IsIconic(IntPtr hWnd);
            }
"@
        
        # Restore if minimized
        if ([Win32]::IsIconic($cursorProcess.MainWindowHandle)) {
            [Win32]::ShowWindow($cursorProcess.MainWindowHandle, [Win32]::SW_RESTORE)
            Start-Sleep -Milliseconds 300
        }
        
        [Win32]::SetForegroundWindow($cursorProcess.MainWindowHandle)
        Start-Sleep -Milliseconds 500
        Write-Host "  → ✓ Đã focus vào Cursor window" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️  Không thể focus window tự động: $_" -ForegroundColor Yellow
        Write-Host "  → Vui lòng click vào Cursor window thủ công" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
    
    # Wait a moment for window to be ready
    Start-Sleep -Milliseconds 500
    
    # Open new agent tab - Try Ctrl+Shift+L (new chat)
    Write-Host "  → Đang mở agent tab mới (Ctrl+Shift+L)..." -ForegroundColor Gray
    try {
        [System.Windows.Forms.SendKeys]::SendWait("^+l")
        Start-Sleep -Milliseconds 1000
        Write-Host "  ✓ Agent tab mới đã được mở!" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "  ⚠️  Lỗi khi gửi keyboard shortcut: $_" -ForegroundColor Yellow
        Write-Host "  → Vui lòng mở agent tab thủ công (Ctrl+Shift+L)" -ForegroundColor Yellow
        return $false
    }
}

# Function to send text to Cursor AI automatically
function Send-TextToCursor {
    param([string]$Text)
    
    # Add required assemblies
    Add-Type -AssemblyName System.Windows.Forms
    Add-Type -AssemblyName System.Drawing
    
    # Copy to clipboard first
    $Text | Set-Clipboard
    
    Write-Host "  → Đang gửi prompt đến Cursor AI..." -ForegroundColor Cyan
    
    # Wait a moment for agent tab to be ready
    Start-Sleep -Milliseconds 500
    
    # Paste the prompt (Ctrl+V)
    Write-Host "  → Đang paste prompt..." -ForegroundColor Gray
    [System.Windows.Forms.SendKeys]::SendWait("^v")
    Start-Sleep -Milliseconds 500
    
    # Send Enter to submit
    Write-Host "  → Đang gửi prompt (Enter)..." -ForegroundColor Gray
    [System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
    Start-Sleep -Milliseconds 300
    
    Write-Host "  ✓ Prompt đã được gửi đến Cursor AI!" -ForegroundColor Green
}

# Function to read .gitignore and create ignore patterns
function Get-GitIgnorePatterns {
    $gitIgnoreFile = ".gitignore"
    $ignorePatterns = @()
    
    if (Test-Path $gitIgnoreFile) {
        $gitIgnoreContent = Get-Content -Path $gitIgnoreFile -ErrorAction SilentlyContinue
        foreach ($line in $gitIgnoreContent) {
            # Skip comments and empty lines
            $line = $line.Trim()
            if ($line -and -not $line.StartsWith("#")) {
                # Convert gitignore pattern to regex pattern
                # Remove leading slash if present
                $pattern = $line
                if ($pattern.StartsWith("/")) {
                    $pattern = $pattern.Substring(1)
                }
                # Escape special regex characters except * and ?
                $pattern = $pattern -replace '([\[\](){}^$+])', '\$1'
                # Convert * to .* (but not **)
                $pattern = $pattern -replace '(?<!\*)\*(?!\*)', '.*'
                # Convert ? to .
                $pattern = $pattern -replace '\?', '.'
                # Handle ** (match any number of directories)
                $pattern = $pattern -replace '\*\*', '.*'
                
                # Add anchor if pattern doesn't start with wildcard
                if (-not $pattern.StartsWith(".*") -and -not $pattern.StartsWith(".")) {
                    $pattern = "^" + $pattern
                }
                
                $ignorePatterns += $pattern
            }
        }
    }
    
    # Add common ignore patterns (as fallback)
    $commonPatterns = @(
        "^\.git",
        "^node_modules",
        "^\.next",
        "^dist",
        "^build",
        "^\.cache",
        "^coverage",
        "^\.nyc_output",
        "^tests/reports",
        "^tests/test-results",
        "^tests/playwright-report",
        "\.log$",
        "\.pid$"
    )
    
    foreach ($pattern in $commonPatterns) {
        if ($ignorePatterns -notcontains $pattern) {
            $ignorePatterns += $pattern
        }
    }
    
    return $ignorePatterns
}

# Function to check if file should be ignored based on .gitignore patterns
function Test-ShouldIgnoreFile {
    param(
        [string]$FilePath,
        [string[]]$IgnorePatterns
    )
    
    # Get relative path from repo root
    $repoRoot = (Get-Location).Path
    $relativePath = $FilePath.Replace($repoRoot, "").TrimStart("\").Replace("\", "/")
    
    foreach ($pattern in $IgnorePatterns) {
        if ($relativePath -match $pattern) {
            return $true
        }
    }
    
    return $false
}

# Function to monitor file changes and detect AI completion
# Logic mới: Monitor toàn bộ source code (trừ .gitignore) và đợi file không còn thay đổi
function Wait-ForAICompletion {
    param(
        [string]$OutputDir,
        [string[]]$ExpectedFiles,
        [int]$MaxWaitMinutes = 15,
        [int]$CheckIntervalSeconds = 15
    )
    
    Write-Host "  → Đang monitor file changes để detect khi AI hoàn thành..." -ForegroundColor Cyan
    Write-Host "  → Monitor: Toàn bộ source code (trừ .gitignore)" -ForegroundColor Gray
    Write-Host "  → Max Wait Time: $MaxWaitMinutes phút" -ForegroundColor Gray
    Write-Host "  → Check Interval: $CheckIntervalSeconds giây" -ForegroundColor Gray
    Write-Host "  → Lưu ý: Script sẽ đợi file không còn thay đổi trong một khoảng thời gian dài để đảm bảo Cursor AI đã thực sự hoàn thành" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  💡 Keyboard shortcuts đang được monitor:" -ForegroundColor Cyan
    Write-Host "     - Ctrl+Alt+F: Skip step" -ForegroundColor Gray
    Write-Host "     - Ctrl+Alt+U: Go back" -ForegroundColor Gray
    Write-Host "     - Ctrl+Alt+C: Cancel workflow" -ForegroundColor Gray
    Write-Host ""
    
    # Get gitignore patterns
    $ignorePatterns = Get-GitIgnorePatterns
    Write-Host "  → Đã load $($ignorePatterns.Count) ignore patterns từ .gitignore" -ForegroundColor DarkGray
    Write-Host ""
    
    $startTime = Get-Date
    $maxWaitTime = $startTime.AddMinutes($MaxWaitMinutes)
    $filesChanged = @()
    $stablePeriods = 0
    $requiredStablePeriods = 10  # 10 lần check liên tiếp (tổng cộng 2.5 phút) để đảm bảo AI đã hoàn thành
    
    # Track file modification times to detect if files are still being written
    $fileModificationTimes = @{}
    
    # Get initial file state - scan entire repo (except ignored files)
    $initialFiles = @()
    $repoRoot = (Get-Location).Path
    
    # Get all files in repo (excluding ignored patterns)
    Write-Host "  → Đang scan toàn bộ repo để lấy initial file state..." -ForegroundColor Gray
    $allFiles = Get-ChildItem -Path $repoRoot -Recurse -File -ErrorAction SilentlyContinue | 
        Where-Object { -not (Test-ShouldIgnoreFile -FilePath $_.FullName -IgnorePatterns $ignorePatterns) }
    
    $initialFiles = $allFiles | Select-Object FullName, LastWriteTime
    foreach ($file in $initialFiles) {
        $fileModificationTimes[$file.FullName] = $file.LastWriteTime
    }
    Write-Host "  → Đã scan $($initialFiles.Count) files (đã loại trừ ignored files)" -ForegroundColor Gray
    Write-Host ""
    
    while ((Get-Date) -lt $maxWaitTime) {
        $currentTime = Get-Date
        $elapsed = $currentTime - $startTime
        $remaining = $maxWaitTime - $currentTime
        
        # Show status every 30 seconds to indicate script is still running and monitoring keyboard
        $secondsElapsed = [math]::Round($elapsed.TotalSeconds, 0)
        $showStatus = ($secondsElapsed % 30 -eq 0) -or ($secondsElapsed -lt 5)
        
        if ($showStatus) {
            Write-Host "  → Đang check... (Đã đợi: $secondsElapsed s / Còn lại: $([math]::Round($remaining.TotalSeconds, 0))s)" -ForegroundColor DarkGray
            Write-Host "     💡 Keyboard shortcuts: Ctrl+Alt+F (skip), Ctrl+Alt+U (back), Ctrl+Alt+C (cancel)" -ForegroundColor DarkGray
            Write-Host "     ⚠️  Lưu ý: Terminal phải FOCUS và màn hình KHÔNG được LOCKED!" -ForegroundColor Yellow
        }
        
        # Check for new or modified files - scan entire repo (except ignored files)
        $currentFiles = @()
        $hasChanges = $false
        $hasRecentModifications = $false
        
        # Get all current files in repo (excluding ignored patterns)
        $allCurrentFiles = Get-ChildItem -Path $repoRoot -Recurse -File -ErrorAction SilentlyContinue | 
            Where-Object { -not (Test-ShouldIgnoreFile -FilePath $_.FullName -IgnorePatterns $ignorePatterns) }
        
        $currentFiles = $allCurrentFiles | Select-Object FullName, LastWriteTime
        
        # Check for new files
        foreach ($file in $currentFiles) {
            $existing = $initialFiles | Where-Object { $_.FullName -eq $file.FullName }
            if (-not $existing) {
                # New file
                $hasChanges = $true
                $hasRecentModifications = $true
                $fileModificationTimes[$file.FullName] = $file.LastWriteTime
                if ($filesChanged -notcontains $file.FullName) {
                    $filesChanged += $file.FullName
                    # Only show files that are relevant (not in ignored directories)
                    $relativePath = $file.FullName.Replace($repoRoot, "").TrimStart("\")
                    Write-Host "  → ✓ Phát hiện file mới: $relativePath" -ForegroundColor Green
                }
            } elseif ($file.LastWriteTime -gt $existing.LastWriteTime) {
                # Modified file - check if modification was recent (within last 30 seconds)
                $timeSinceModification = ($currentTime - $file.LastWriteTime).TotalSeconds
                if ($timeSinceModification -lt 30) {
                    $hasRecentModifications = $true
                    $relativePath = $file.FullName.Replace($repoRoot, "").TrimStart("\")
                    Write-Host "  → ⚠️  File vừa được sửa (cách đây $([math]::Round($timeSinceModification, 0))s): $relativePath" -ForegroundColor Yellow
                }
                
                $hasChanges = $true
                $fileModificationTimes[$file.FullName] = $file.LastWriteTime
                if ($filesChanged -notcontains $file.FullName) {
                    $filesChanged += $file.FullName
                    $relativePath = $file.FullName.Replace($repoRoot, "").TrimStart("\")
                    Write-Host "  → ✓ Phát hiện file đã được sửa: $relativePath" -ForegroundColor Green
                }
            }
        }
        
        # Check if expected files exist (in OutputDir if specified, otherwise search entire repo)
        $expectedFilesFound = 0
        if ($ExpectedFiles -and $ExpectedFiles.Count -gt 0) {
            $searchPath = if ($OutputDir -and (Test-Path $OutputDir)) { $OutputDir } else { $repoRoot }
            foreach ($pattern in $ExpectedFiles) {
                # Support wildcard patterns
                $found = Get-ChildItem -Path $searchPath -Recurse -File -ErrorAction SilentlyContinue | 
                    Where-Object { 
                        -not (Test-ShouldIgnoreFile -FilePath $_.FullName -IgnorePatterns $ignorePatterns) -and
                        ($_.Name -like $pattern -or $_.FullName -like "*$pattern*")
                    }
                if ($found) {
                    $expectedFilesFound++
                }
            }
        }
        
        # If files are still being modified recently, reset stable periods
        if ($hasRecentModifications) {
            $stablePeriods = 0
            Write-Host "  → ⚠️  Phát hiện file vừa được sửa, tiếp tục monitor (AI có thể vẫn đang chạy)..." -ForegroundColor Yellow
        } elseif ($hasChanges) {
            $stablePeriods = 0
            Write-Host "  → Có thay đổi nhưng không có sửa đổi gần đây, tiếp tục monitor..." -ForegroundColor Yellow
        } else {
            $stablePeriods++
            if ($stablePeriods -ge $requiredStablePeriods) {
                Write-Host ""
                Write-Host "  ✓ Không có thay đổi trong $($requiredStablePeriods * $CheckIntervalSeconds) giây, AI đã hoàn thành!" -ForegroundColor Green
                if ($filesChanged.Count -gt 0) {
                    Write-Host "  → Tổng số file đã thay đổi: $($filesChanged.Count)" -ForegroundColor Gray
                }
                if ($expectedFilesFound -gt 0) {
                    Write-Host "  → Tìm thấy $expectedFilesFound/$($ExpectedFiles.Count) expected files" -ForegroundColor Gray
                }
                return $true
            } else {
                Write-Host "  → Không có thay đổi ($stablePeriods/$requiredStablePeriods stable periods)..." -ForegroundColor DarkGray
            }
        }
        
        # Check keyboard shortcuts
        $keyboardAction = Test-KeyboardShortcuts
        if ($keyboardAction) {
            switch ($keyboardAction) {
                "Skip" {
                    Write-Host ""
                    Write-Host "  ⚠️  Keyboard shortcut detected: Ctrl+Alt+F (Skip)" -ForegroundColor Yellow
                    $script:skipCurrentStep = $true
                    return $false
                }
                "Back" {
                    Write-Host ""
                    Write-Host "  ⚠️  Keyboard shortcut detected: Ctrl+Alt+U (Back)" -ForegroundColor Yellow
                    $script:goBackToPreviousStep = $true
                    return $false
                }
                "Cancel" {
                    Write-Host ""
                    Write-Host "  ⚠️  Keyboard shortcut detected: Ctrl+Alt+C (Cancel)" -ForegroundColor Red
                    $script:cancelWorkflow = $true
                    return $false
                }
            }
        }
        
        # Update initial files for next check
        $initialFiles = $currentFiles
        
        Start-Sleep -Seconds $CheckIntervalSeconds
    }
    
    Write-Host ""
    Write-Host "  ⚠️  Đã hết thời gian chờ ($MaxWaitMinutes phút)" -ForegroundColor Yellow
    if ($filesChanged.Count -gt 0) {
        Write-Host "  → Tổng số file đã thay đổi: $($filesChanged.Count)" -ForegroundColor Gray
    }
    return $false
}


foreach ($step in $workflow) {
    # Check for cancel workflow
    if ($script:cancelWorkflow) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Red
        Write-Host "  WORKFLOW CANCELLED BY USER" -ForegroundColor Red
        Write-Host "========================================" -ForegroundColor Red
        Write-Host ""
        $summaryContent += "`n## Workflow Status`n`n"
        $summaryContent += "**Status**: ⚠️ Cancelled by user (Ctrl+Alt+C)`n"
        $summaryContent += "**Last Step**: Step $script:currentStepNumber`n`n"
        break
    }
    
    # Check for go back to previous step
    if ($script:goBackToPreviousStep) {
        if ($previousStepNumber -gt 0 -and $previousStepNumber -ge $actualStartStep) {
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Yellow
            Write-Host "  GOING BACK TO PREVIOUS STEP" -ForegroundColor Yellow
            Write-Host "========================================" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "  → Quay lại Step $previousStepNumber" -ForegroundColor Cyan
            Write-Host ""
            
            # Find the previous step in workflow
            $previousStepIndex = -1
            for ($i = 0; $i -lt $workflow.Count; $i++) {
                if ($workflow[$i].Step -eq $previousStepNumber) {
                    $previousStepIndex = $i
                    break
                }
            }
            
            if ($previousStepIndex -ge 0) {
                # Reset workflow to start from previous step
                $workflow = $workflow[$previousStepIndex..($workflow.Count - 1)]
                $script:goBackToPreviousStep = $false
                $script:skipCurrentStep = $false
                continue
            }
        } else {
            Write-Host ""
            Write-Host "  ⚠️  Không thể quay lại step trước đó (đã ở step đầu tiên hoặc ngoài range)" -ForegroundColor Yellow
            Write-Host ""
            $script:goBackToPreviousStep = $false
        }
    }
    
    # Check for skip current step
    if ($script:skipCurrentStep) {
        Write-Host ""
        Write-Host "  ⏭️  Step $stepNum skipped by keyboard shortcut (Ctrl+Alt+F)" -ForegroundColor Yellow
        Write-Host ""
        $summaryContent += "`n### Step $stepNum : $stepName`n`n"
        $summaryContent += "- **Role**: $stepRole`n"
        $summaryContent += "- **Status**: ⏭️ Skipped (keyboard shortcut)`n"
        $summaryContent += "- **Description**: $stepDesc`n"
        $summaryContent += "- **Output**: N/A`n`n"
        $script:skipCurrentStep = $false
        continue
    }
    
    $stepNum = $step.Step
    $stepName = $step.Name
    $stepRole = $step.Role
    $stepDesc = $step.Description
    $script:currentStepNumber = $stepNum
    
    # Skip steps before starting step
    if ($stepNum -lt $actualStartStep) {
        Write-Host "[Step $stepNum] $stepName" -ForegroundColor DarkGray
        Write-Host "  ⏭️  SKIPPED (before start step $actualStartStep)" -ForegroundColor DarkGray
        Write-Host ""
        
        $summaryContent += "`n### Step $stepNum : $stepName`n`n"
        $summaryContent += "- **Role**: $stepRole`n"
        $summaryContent += "- **Status**: ⏭️ Skipped (before start step)`n"
        $summaryContent += "- **Description**: $stepDesc`n"
        $summaryContent += "- **Output**: N/A`n`n"
        continue
    }
    
    # Skip steps after ending step
    if ($stepNum -gt $actualEndStep) {
        Write-Host "[Step $stepNum] $stepName" -ForegroundColor DarkGray
        Write-Host "  ⏭️  SKIPPED (after end step $actualEndStep)" -ForegroundColor DarkGray
        Write-Host ""
        
        $summaryContent += "`n### Step $stepNum : $stepName`n`n"
        $summaryContent += "- **Role**: $stepRole`n"
        $summaryContent += "- **Status**: ⏭️ Skipped (after end step)`n"
        $summaryContent += "- **Description**: $stepDesc`n"
        $summaryContent += "- **Output**: N/A`n`n"
        continue
    }
    
    # Check if this step should be skipped manually
    if ($SkipStepNumbers -contains $stepNum.ToString()) {
        Write-Host "[Step $stepNum] $stepName" -ForegroundColor DarkGray
        Write-Host "  ⏭️  SKIPPED (manual)" -ForegroundColor DarkGray
        Write-Host ""
        
        $summaryContent += "`n### Step $stepNum : $stepName`n`n"
        $summaryContent += "- **Role**: $stepRole`n"
        $summaryContent += "- **Status**: ⏭️ Skipped (manual)`n"
        $summaryContent += "- **Description**: $stepDesc`n"
        $summaryContent += "- **Output**: N/A`n`n"
        continue
    }
    
    # Check if step can be skipped automatically
    $shouldSkip = $false
    $skipReason = ""
    if ($step.CanSkip -and $step.SkipCheckFunction) {
        Write-Host "[Step $stepNum] $stepName" -ForegroundColor Yellow
        Write-Host "  → Đang kiểm tra xem có thể skip step này không..." -ForegroundColor Cyan
        
        switch ($step.SkipCheckFunction) {
            "Check-IfFeatureExistsInEpic" {
                $shouldSkip = Check-IfFeatureExistsInEpic -FeatureName $FeatureName
                if ($shouldSkip) {
                    $skipReason = "Feature đã có trong epic với status 'In Progress'"
                }
            }
            "Check-IfBusinessAnalystComplete" {
                $shouldSkip = Check-IfBusinessAnalystComplete -FeatureName $FeatureName
                if ($shouldSkip) {
                    $skipReason = "Business Analyst documentation đã đầy đủ"
                }
            }
            "Check-IfDatabaseComplete" {
                $shouldSkip = Check-IfDatabaseComplete -FeatureName $FeatureName
                if ($shouldSkip) {
                    $skipReason = "Database schema đã được thiết kế đầy đủ"
                }
            }
        }
        
        if ($shouldSkip) {
            Write-Host "  ⏭️  SKIPPED: $skipReason" -ForegroundColor Green
            Write-Host ""
            
            $summaryContent += "`n### Step $stepNum : $stepName`n`n"
            $summaryContent += "- **Role**: $stepRole`n"
            $summaryContent += "- **Status**: ⏭️ Skipped (auto)`n"
            $summaryContent += "- **Reason**: $skipReason`n"
            $summaryContent += "- **Description**: $stepDesc`n"
            $summaryContent += "- **Output**: N/A`n`n"
            continue
        } else {
            Write-Host "  → Không thể skip, tiếp tục thực hiện step..." -ForegroundColor Yellow
            Write-Host ""
        }
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  [LOG] Bắt đầu Step ${stepNum}: $stepName" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "[Step $stepNum] $stepName" -ForegroundColor Yellow
    Write-Host "  Description: $stepDesc" -ForegroundColor Gray
    Write-Host "  Switching to role: $stepRole" -ForegroundColor Gray
    Write-Host "  💡 Keyboard shortcuts available: Ctrl+Alt+F (skip), Ctrl+Alt+U (back), Ctrl+Alt+C (cancel)" -ForegroundColor DarkGray
    Write-Host ""
    
    # Switch role
    try {
        .\switch-role.ps1 $stepRole | Out-Null
        Write-Host "  ✓ Role switched successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "  ✗ Error switching role: $_" -ForegroundColor Red
        $errorMsg = $_.ToString()
        $summaryContent += "`n### Step $stepNum : $stepName`n`n"
        $summaryContent += "- **Role**: $stepRole`n"
        $summaryContent += "- **Status**: ❌ Error`n"
        $summaryContent += "- **Error**: $errorMsg`n`n"
        continue
    }
    
    # Add to summary
    $stepStartTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $summaryContent += "`n### Step $stepNum : $stepName`n`n"
    $summaryContent += "- **Role**: $stepRole`n"
    $summaryContent += "- **Status**: ⏳ In Progress`n"
    $summaryContent += "- **Description**: $stepDesc`n"
    $summaryContent += "- **Output Directory**: $($step.OutputDir)`n"
    $summaryContent += "- **Expected Output Files**: $($step.OutputFiles -join ', ')`n"
    $summaryContent += "- **Started**: $stepStartTime`n"
    $summaryContent += "- **Completed**: TBD`n"
    $summaryContent += "- **Notes**: `n`n"
    
    # Generate prompt for AI
    $promptText = "Với vai trò $stepRole, hãy thực hiện: $stepDesc cho tính năng $FeatureName"
    
    # Create prompt file for easy access
    $promptFile = "$workflowsDir/$FeatureName-step$stepNum-prompt.txt"
    $promptText | Out-File -FilePath $promptFile -Encoding UTF8 -NoNewline
    
    Write-Host ""
    Write-Host "  ========================================" -ForegroundColor Cyan
    Write-Host "  PROMPT CHO CURSOR AI:" -ForegroundColor Cyan
    Write-Host "  ========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  $promptText" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  ========================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Auto-send prompt to Cursor AI with new agent tab
    if ($IsWindows -or $env:OS -like "*Windows*") {
        Write-Host "  → Đang tự động mở agent tab mới và gửi prompt..." -ForegroundColor Cyan
        Write-Host "  → Vui lòng đảm bảo Cursor AI đang mở" -ForegroundColor Yellow
        Write-Host "  → Script sẽ đợi 3 giây để bạn chuẩn bị..." -ForegroundColor Yellow
        Write-Host ""
        
        $countdown = 3
        while ($countdown -gt 0) {
            # Check keyboard shortcuts during countdown
            $keyboardAction = Test-KeyboardShortcuts
            if ($keyboardAction) {
                switch ($keyboardAction) {
                    "Cancel" {
                        Write-Host ""
                        Write-Host "  ⚠️  Workflow cancelled by user (Ctrl+Alt+C)" -ForegroundColor Red
                        $script:cancelWorkflow = $true
                        break
                    }
                    "Skip" {
                        Write-Host ""
                        Write-Host "  ⏭️  Step skipped by user (Ctrl+Alt+F)" -ForegroundColor Yellow
                        $script:skipCurrentStep = $true
                        break
                    }
                }
                if ($script:cancelWorkflow -or $script:skipCurrentStep) {
                    break
                }
            }
            
            Write-Host "  → Bắt đầu sau $countdown giây... (Ctrl+Alt+C: cancel, Ctrl+Alt+F: skip)" -ForegroundColor DarkGray
            Start-Sleep -Seconds 1
            $countdown--
        }
        
        # Check again after countdown
        if ($script:cancelWorkflow) {
            break
        }
        if ($script:skipCurrentStep) {
            continue
        }
        
        try {
            # Step 1: Open new agent tab first (to avoid full context)
            Write-Host ""
            Write-Host "  [LOG] Bắt đầu quy trình tự động cho Step $stepNum..." -ForegroundColor Cyan
            Write-Host "  [Bước 1/3] Mở agent tab mới..." -ForegroundColor Cyan
            $tabOpened = Open-NewAgentTab
            if (-not $tabOpened) {
                Write-Host "  ⚠️  Không thể mở agent tab tự động, tiếp tục với clipboard..." -ForegroundColor Yellow
                $promptText | Set-Clipboard
                Write-Host "  ✓ Prompt đã được copy vào clipboard (Ctrl+V để paste)" -ForegroundColor Green
            } else {
                # Step 2: Send prompt to the new tab
                Write-Host ""
                Write-Host "  [Bước 2/3] Gửi prompt đến agent tab mới..." -ForegroundColor Cyan
                Send-TextToCursor -Text $promptText
                Write-Host ""
                Write-Host "  → Prompt đã được gửi tự động!" -ForegroundColor Green
                Write-Host "  → Prompt file: $promptFile" -ForegroundColor Gray
            }
            
            Write-Host ""
            Write-Host "  [Bước 3/3] Đang monitor file changes để detect khi AI hoàn thành..." -ForegroundColor Cyan
            Write-Host ""
            
            # Step 3: Monitor file changes and auto-detect completion
            $outputDir = $step.OutputDir
            $expectedFiles = $step.OutputFiles
            
            # If outputDir is empty, try to infer from role
            if ([string]::IsNullOrWhiteSpace($outputDir)) {
                switch ($stepRole) {
                    "fullstack-developer" {
                        $outputDir = "services"
                    }
                    default {
                        $outputDir = "docs"
                    }
                }
            }
            
            $completionDetected = Wait-ForAICompletion -OutputDir $outputDir -ExpectedFiles $expectedFiles -MaxWaitMinutes 15 -CheckIntervalSeconds 10
            
            # Check for keyboard shortcuts after waiting
            if ($script:cancelWorkflow) {
                Write-Host ""
                Write-Host "  ⚠️  Workflow cancelled by user (Ctrl+Alt+C)" -ForegroundColor Red
                break
            }
            
            if ($script:skipCurrentStep) {
                Write-Host ""
                Write-Host "  ⏭️  Step $stepNum skipped by keyboard shortcut (Ctrl+Alt+F)" -ForegroundColor Yellow
                $summaryContent = $summaryContent -replace "Status: ⏳ In Progress", "Status: ⏭️ Skipped (keyboard shortcut)"
                continue
            }
            
            if ($script:goBackToPreviousStep) {
                Write-Host ""
                Write-Host "  ← Going back to previous step (Ctrl+Alt+U)" -ForegroundColor Yellow
                # Will be handled at the start of next loop iteration
                continue
            }
            
            if ($completionDetected) {
                Write-Host ""
                Write-Host "  ✓ AI đã hoàn thành! Tự động chuyển sang step tiếp theo..." -ForegroundColor Green
                Write-Host "  → Đang chuẩn bị chuyển sang step tiếp theo trong workflow..." -ForegroundColor Cyan
                Write-Host ""
            } else {
                Write-Host ""
                Write-Host "  ⚠️  Không detect được completion tự động, nhưng vẫn tiếp tục..." -ForegroundColor Yellow
                Write-Host "  → Script sẽ tự động chuyển sang step tiếp theo sau 2 giây..." -ForegroundColor Yellow
                Write-Host "  → Bạn có thể nhấn Ctrl+Alt+C để cancel, Ctrl+Alt+F để skip, Ctrl+Alt+U để quay lại" -ForegroundColor Yellow
                Write-Host ""
                Start-Sleep -Seconds 2
            }
            
        } catch {
            Write-Host "  ⚠️  Lỗi khi gửi prompt tự động: $_" -ForegroundColor Yellow
            Write-Host "  → Đang copy prompt vào clipboard thay thế..." -ForegroundColor Yellow
            $promptText | Set-Clipboard
            Write-Host "  ✓ Prompt đã được copy vào clipboard (Ctrl+V để paste)" -ForegroundColor Green
            Write-Host "  → Vui lòng paste vào Cursor AI thủ công" -ForegroundColor Yellow
            Write-Host ""
            
            # Fallback: Ask user for manual confirmation
            Write-Host "  → Nhấn Enter sau khi AI đã hoàn thành" -ForegroundColor Yellow
            Write-Host "  → Hoặc gõ 'skip' để bỏ qua, 'exit' để dừng" -ForegroundColor Yellow
            Write-Host ""
            $response = Read-Host "  Nhập lệnh (Enter/skip/exit)"
            
            if ($response -eq "skip" -or $response -eq "s") {
                Write-Host "  ⏭️  Step skipped by user" -ForegroundColor DarkGray
                $summaryContent = $summaryContent -replace "Status: ⏳ In Progress", "Status: ⏭️ Skipped"
                continue
            }
            
            if ($response -eq "exit" -or $response -eq "e") {
                Write-Host ""
                Write-Host "  ⚠️  Workflow stopped by user" -ForegroundColor Yellow
                $summaryContent += "`n## Workflow Status`n`n"
                $summaryContent += "**Status**: ⚠️ Stopped by user`n"
                $summaryContent += "**Last Step Completed**: Step $($stepNum - 1)`n`n"
                break
            }
        }
    } else {
        # For non-Windows, just copy to clipboard
        $promptText | Set-Clipboard
        Write-Host "  → Prompt đã được copy vào clipboard (Ctrl+V để paste)" -ForegroundColor Green
        Write-Host ""
        Write-Host "  → Nhấn Enter sau khi AI đã hoàn thành" -ForegroundColor Yellow
        $response = Read-Host "  Nhập lệnh (Enter/skip/exit)"
        
        if ($response -eq "skip" -or $response -eq "s") {
            Write-Host "  ⏭️  Step skipped by user" -ForegroundColor DarkGray
            $summaryContent = $summaryContent -replace "Status: ⏳ In Progress", "Status: ⏭️ Skipped"
            continue
        }
        
        if ($response -eq "exit" -or $response -eq "e") {
            Write-Host ""
            Write-Host "  ⚠️  Workflow stopped by user" -ForegroundColor Yellow
            $summaryContent += "`n## Workflow Status`n`n"
            $summaryContent += "**Status**: ⚠️ Stopped by user`n"
            $summaryContent += "**Last Step Completed**: Step $($stepNum - 1)`n`n"
            break
        }
    }
    
    # Add prompt to summary
    $summaryContent = $summaryContent -replace "- \*\*Notes\*\*: `n`n", "- **Notes**: `n- **Prompt Used**: ``$promptText```n`n"
    
    # Mark as completed
    $completedTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $summaryContent = $summaryContent -replace "Status: ⏳ In Progress", "Status: ✅ Completed"
    $summaryContent = $summaryContent -replace "Completed: TBD", "Completed: $completedTime"
    
    $completedSteps += $stepNum
    $previousStepNumber = $stepNum  # Update previous step for potential rollback
    Write-Host "  ✓ Step $stepNum completed" -ForegroundColor Green
    Write-Host ""
    
    # Log: Preparing to move to next step
    Write-Host "  → [LOG] Step $stepNum đã hoàn thành, đang chuẩn bị chuyển sang step tiếp theo..." -ForegroundColor Cyan
    
    # Find next step in workflow
    $nextStep = $workflow | Where-Object { $_.Step -gt $stepNum -and $_.Step -le $actualEndStep } | Select-Object -First 1
    if ($nextStep) {
        Write-Host "  → [LOG] Step tiếp theo: Step $($nextStep.Step) - $($nextStep.Name)" -ForegroundColor Cyan
        Write-Host "  → [LOG] Role tiếp theo: $($nextStep.Role)" -ForegroundColor Cyan
        Write-Host "  → [LOG] Đang tiếp tục workflow tự động..." -ForegroundColor Cyan
    } else {
        Write-Host "  → [LOG] Đã đến step cuối cùng trong workflow range (Step $actualEndStep)" -ForegroundColor Cyan
        Write-Host "  → [LOG] Workflow sẽ kết thúc sau khi hoàn thành step này" -ForegroundColor Cyan
    }
    Write-Host ""
    
    # Rollback check removed - script will automatically continue to next step
} # End of foreach ($step in $workflow)

# Finalize summary
$endTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$summaryContent += "`n---`n`n"
$summaryContent += "## Completion Summary`n`n"
$summaryContent += "**Feature**: $FeatureName`n"
$summaryContent += "**Started**: $startTime`n"
$summaryContent += "**Completed**: $endTime`n"
$summaryContent += "**Total Steps in Workflow**: $($workflow.Count)`n"
$summaryContent += "**Steps in Range**: Step $actualStartStep → Step $actualEndStep ($($actualEndStep - $actualStartStep + 1) steps)`n"
$summaryContent += "**Completed Steps**: $($completedSteps.Count)`n"
$summaryContent += "**Skipped Steps**: $($workflow.Count - $completedSteps.Count)`n`n"

$summaryContent += "### Completed Steps`n"
foreach ($stepNum in $completedSteps) {
    $stepIndex = $stepNum - 1
    if ($stepIndex -ge 0 -and $stepIndex -lt $workflow.Count) {
        $summaryContent += "- Step $stepNum : $($workflow[$stepIndex].Name)`n"
    }
}
$summaryContent += "`n"

$summaryContent += "### Deliverables`n"
$summaryContent += "- [ ] Product Owner: Epic/Feature documentation`n"
$summaryContent += "- [ ] Business Analyst: Use cases and business rules`n"
$summaryContent += "- [ ] Database Engineer: Schema and migrations`n"
$summaryContent += "- [ ] Fullstack Developer: Backend and frontend code`n"
$summaryContent += "- [ ] Automation Tester: E2E tests and reports`n"
$summaryContent += "- [ ] Security Tester: Security audit report`n"
$summaryContent += "- [ ] DevOps: Deployment documentation`n`n"

$summaryContent += "### Next Steps`n"
$summaryContent += "1. Review all deliverables`n"
$summaryContent += "2. Update traceability matrix`n"
$summaryContent += "3. Update service mapping if needed`n"
$summaryContent += "4. Update database mapping if needed`n"
$summaryContent += "5. Deploy to local dev environment`n"
$summaryContent += "6. Conduct user acceptance testing`n`n"

$summaryContent += "---`n`n"
$summaryContent += "**Generated by**: Orchestrator Agent`n"
$summaryContent += "**Workflow Script**: orchestrate-feature.ps1`n`n"

# Save summary
$summaryContent | Out-File -FilePath $summaryFile -Encoding UTF8

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Workflow Summary Saved" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "File: $summaryFile" -ForegroundColor Gray
Write-Host ""
$stepsInRange = $actualEndStep - $actualStartStep + 1
Write-Host "Completed Steps: $($completedSteps.Count)/$stepsInRange (in range Step $actualStartStep → Step $actualEndStep)" -ForegroundColor $(if ($completedSteps.Count -eq $stepsInRange) { "Green" } else { "Yellow" })
if ($actualEndStep -lt $workflow.Count) {
    Write-Host "Note: Workflow ended at Step $actualEndStep (total workflow has $($workflow.Count) steps)" -ForegroundColor Gray
}
Write-Host ""

# Open summary file if on Windows
if ($IsWindows -or $env:OS -like "*Windows*") {
    $openFile = Read-Host "Open workflow summary file? (y/n)"
    if ($openFile -eq "y" -or $openFile -eq "Y") {
        Start-Process notepad.exe $summaryFile
    }
}

Write-Host ""
Write-Host "To continue workflow, run:" -ForegroundColor Cyan
Write-Host "  .\orchestrate-feature.ps1 -FeatureName '$FeatureName' -Description '$Description'" -ForegroundColor Gray
Write-Host ""

