# Script to orchestrate end-to-end feature development workflow
# Usage: .\orchestrate-feature.ps1 -FeatureName "cham-cong" -Description "Tính năng chấm công cho nhân viên"
#
# Features:
# - Automatically generates prompts for each step
# - Copies prompts to clipboard for easy pasting into Cursor AI
# - Creates prompt files for reference
# - Tracks progress and creates workflow summary

param(
    [Parameter(Mandatory=$true)]
    [string]$FeatureName,
    
    [Parameter(Mandatory=$false)]
    [string]$Description = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipSteps,
    
    [Parameter(Mandatory=$false)]
    [string[]]$SkipStepNumbers = @()
)

# Workflow steps
$workflow = @(
    @{ 
        Role = "product-owner"; 
        Step = 1; 
        Name = "Product Owner - Define Epic/Features";
        Description = "Xác định epic/feature, tạo user stories và acceptance criteria";
        OutputDir = "docs/product-owner";
        OutputFiles = @("epic-*.md", "epics-and-features.md")
    },
    @{ 
        Role = "business-analyst"; 
        Step = 2; 
        Name = "Business Analyst - Analyze Requirements";
        Description = "Phân tích requirements, tạo use cases và business rules";
        OutputDir = "docs/business-analyst";
        OutputFiles = @("use-cases-*.md", "business-rules-*.md")
    },
    @{ 
        Role = "database-engineer"; 
        Step = 3; 
        Name = "Database Engineer - Design Schema";
        Description = "Thiết kế database schema và tạo migration scripts";
        OutputDir = "docs/database-engineer";
        OutputFiles = @("schema-*.md", "**/migrations/*.ts")
    },
    @{ 
        Role = "fullstack-developer"; 
        Step = 4; 
        Name = "Fullstack Developer - Implement";
        Description = "Implement backend (NestJS) và frontend (Next.js)";
        OutputDir = "";
        OutputFiles = @("services/**/*.ts", "apps/admin-panel/**/*.tsx")
    },
    @{ 
        Role = "automation-tester"; 
        Step = 5; 
        Name = "Automation Tester - Write Tests";
        Description = "Viết Playwright E2E tests và chạy test reports";
        OutputDir = "tests";
        OutputFiles = @("e2e/*.e2e-spec.ts", "reports/*.html")
    },
    @{ 
        Role = "security-tester"; 
        Step = 6; 
        Name = "Security Tester - Security Audit";
        Description = "Security audit và kiểm tra OWASP Top 10";
        OutputDir = "docs/security-tester";
        OutputFiles = @("security-audit-*.md")
    },
    @{ 
        Role = "devops"; 
        Step = 7; 
        Name = "DevOps - Deploy";
        Description = "Update Docker configs và deploy lên UAT";
        OutputDir = "docs/devops";
        OutputFiles = @("deployment-*.md", "docker-compose.yml", "**/Dockerfile")
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
$summaryContent += "## Overview`n`n"
$summaryContent += "Workflow này thực hiện quy trình phát triển tính năng `"$FeatureName`" từ đầu đến cuối qua tất cả các role agents.`n`n"
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

$completedSteps = @()

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

# Function to monitor file changes and detect AI completion
function Wait-ForAICompletion {
    param(
        [string]$OutputDir,
        [string[]]$ExpectedFiles,
        [int]$MaxWaitMinutes = 10,
        [int]$CheckIntervalSeconds = 10
    )
    
    Write-Host "  → Đang monitor file changes để detect khi AI hoàn thành..." -ForegroundColor Cyan
    Write-Host "  → Output Directory: $OutputDir" -ForegroundColor Gray
    Write-Host "  → Max Wait Time: $MaxWaitMinutes phút" -ForegroundColor Gray
    Write-Host "  → Check Interval: $CheckIntervalSeconds giây" -ForegroundColor Gray
    Write-Host ""
    
    $startTime = Get-Date
    $maxWaitTime = $startTime.AddMinutes($MaxWaitMinutes)
    $filesChanged = @()
    $stablePeriods = 0
    $requiredStablePeriods = 3  # Cần 3 lần check liên tiếp không có thay đổi để coi là hoàn thành
    
    # Get initial file state
    $initialFiles = @()
    if ($OutputDir -and (Test-Path $OutputDir)) {
        $initialFiles = Get-ChildItem -Path $OutputDir -Recurse -File | Select-Object FullName, LastWriteTime
    }
    
    while ((Get-Date) -lt $maxWaitTime) {
        $currentTime = Get-Date
        $elapsed = $currentTime - $startTime
        $remaining = $maxWaitTime - $currentTime
        
        Write-Host "  → Đang check... (Đã đợi: $([math]::Round($elapsed.TotalSeconds, 0))s / Còn lại: $([math]::Round($remaining.TotalSeconds, 0))s)" -ForegroundColor DarkGray
        
        # Check for new or modified files
        $currentFiles = @()
        $hasChanges = $false
        
        if ($OutputDir -and (Test-Path $OutputDir)) {
            $currentFiles = Get-ChildItem -Path $OutputDir -Recurse -File | Select-Object FullName, LastWriteTime
            
            # Check for new files
            foreach ($file in $currentFiles) {
                $existing = $initialFiles | Where-Object { $_.FullName -eq $file.FullName }
                if (-not $existing) {
                    # New file
                    $hasChanges = $true
                    if ($filesChanged -notcontains $file.FullName) {
                        $filesChanged += $file.FullName
                        Write-Host "  → ✓ Phát hiện file mới: $($file.FullName)" -ForegroundColor Green
                    }
                } elseif ($file.LastWriteTime -gt $existing.LastWriteTime) {
                    # Modified file
                    $hasChanges = $true
                    if ($filesChanged -notcontains $file.FullName) {
                        $filesChanged += $file.FullName
                        Write-Host "  → ✓ Phát hiện file đã được sửa: $($file.FullName)" -ForegroundColor Green
                    }
                }
            }
        }
        
        # Check if expected files exist
        $expectedFilesFound = 0
        if ($ExpectedFiles -and $ExpectedFiles.Count -gt 0 -and $OutputDir -and (Test-Path $OutputDir)) {
            foreach ($pattern in $ExpectedFiles) {
                # Support wildcard patterns
                $found = Get-ChildItem -Path $OutputDir -Recurse -File -ErrorAction SilentlyContinue | 
                    Where-Object { $_.Name -like $pattern -or $_.FullName -like "*$pattern*" }
                if ($found) {
                    $expectedFilesFound++
                }
            }
        }
        
        if ($hasChanges) {
            $stablePeriods = 0
            Write-Host "  → Có thay đổi, tiếp tục monitor..." -ForegroundColor Yellow
        } else {
            $stablePeriods++
            if ($stablePeriods -ge $requiredStablePeriods) {
                Write-Host ""
                Write-Host "  ✓ Không có thay đổi trong $($requiredStablePeriods * $CheckIntervalSeconds) giây, coi như AI đã hoàn thành!" -ForegroundColor Green
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
    $stepNum = $step.Step
    $stepName = $step.Name
    $stepRole = $step.Role
    $stepDesc = $step.Description
    
    # Check if this step should be skipped
    if ($SkipStepNumbers -contains $stepNum.ToString()) {
        Write-Host "[Step $stepNum] $stepName" -ForegroundColor DarkGray
        Write-Host "  ⏭️  SKIPPED" -ForegroundColor DarkGray
        Write-Host ""
        
        $summaryContent += "`n### Step $stepNum : $stepName`n`n"
        $summaryContent += "- **Role**: $stepRole`n"
        $summaryContent += "- **Status**: ⏭️ Skipped`n"
        $summaryContent += "- **Description**: $stepDesc`n"
        $summaryContent += "- **Output**: N/A`n`n"
        continue
    }
    
    Write-Host "[Step $stepNum] $stepName" -ForegroundColor Yellow
    Write-Host "  Description: $stepDesc" -ForegroundColor Gray
    Write-Host "  Switching to role: $stepRole" -ForegroundColor Gray
    
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
            Write-Host "  → Bắt đầu sau $countdown giây... (Nhấn Ctrl+C để hủy)" -ForegroundColor DarkGray
            Start-Sleep -Seconds 1
            $countdown--
        }
        
        try {
            # Step 1: Open new agent tab first (to avoid full context)
            Write-Host ""
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
            
            if ($completionDetected) {
                Write-Host ""
                Write-Host "  ✓ AI đã hoàn thành! Tự động chuyển sang step tiếp theo..." -ForegroundColor Green
                Write-Host ""
            } else {
                Write-Host ""
                Write-Host "  ⚠️  Không detect được completion tự động, nhưng vẫn tiếp tục..." -ForegroundColor Yellow
                Write-Host "  → Bạn có thể nhấn Ctrl+C để dừng nếu cần" -ForegroundColor Yellow
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
    Write-Host "  ✓ Step $stepNum completed" -ForegroundColor Green
    Write-Host ""
} # End of foreach ($step in $workflow)

# Finalize summary
$endTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$summaryContent += "`n---`n`n"
$summaryContent += "## Completion Summary`n`n"
$summaryContent += "**Feature**: $FeatureName`n"
$summaryContent += "**Started**: $startTime`n"
$summaryContent += "**Completed**: $endTime`n"
$summaryContent += "**Total Steps**: $($workflow.Count)`n"
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
Write-Host "Completed Steps: $($completedSteps.Count)/$($workflow.Count)" -ForegroundColor $(if ($completedSteps.Count -eq $workflow.Count) { "Green" } else { "Yellow" })
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

