# Script to switch between different Cursor AI agent roles
# Usage: .\switch-role.ps1 [role-name]

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('product-owner', 'business-analyst', 'database-engineer', 'fullstack-developer', 'automation-tester', 'security-tester', 'devops', 'orchestrator', 'list')]
    [string]$Role
)

$roles = @{
    'product-owner' = 'docs\.cursorrules.product-owner'
    'business-analyst' = 'docs\.cursorrules.business-analyst'
    'database-engineer' = 'docs\.cursorrules.database-engineer'
    'fullstack-developer' = 'docs\.cursorrules.fullstack-developer'
    'automation-tester' = 'docs\.cursorrules.automation-tester'
    'security-tester' = 'docs\.cursorrules.security-tester'
    'devops' = 'docs\.cursorrules.devops'
    'orchestrator' = 'docs\.cursorrules.orchestrator'
}

$currentRulesFile = '.cursorrules'

# List all available roles
if ($Role -eq 'list') {
    Write-Host "`n=== Available Cursor AI Agent Roles ===" -ForegroundColor Cyan
    Write-Host ""
    foreach ($roleName in $roles.Keys) {
        $roleFile = $roles[$roleName]
        if (Test-Path $roleFile) {
            Write-Host "  [OK] $roleName" -ForegroundColor Green
        } else {
            Write-Host "  [X] $roleName (file not found)" -ForegroundColor Red
        }
    }
    Write-Host ""
    
    # Check current active role
    if (Test-Path $currentRulesFile) {
        $currentContent = Get-Content $currentRulesFile -Raw
        foreach ($roleName in $roles.Keys) {
            $roleFile = $roles[$roleName]
            if (Test-Path $roleFile) {
                $roleContent = Get-Content $roleFile -Raw
                if ($currentContent -eq $roleContent) {
                    Write-Host "Current active role: $roleName" -ForegroundColor Yellow
                    break
                }
            }
        }
    } else {
        Write-Host "No active role set (no .cursorrules file found)" -ForegroundColor Yellow
    }
    Write-Host ""
    exit 0
}

# Get the role file
$roleFile = $roles[$Role]

if (-not (Test-Path $roleFile)) {
    Write-Host "Error: Role file '$roleFile' not found!" -ForegroundColor Red
    exit 1
}

# Copy the selected role file to .cursorrules
Copy-Item $roleFile $currentRulesFile -Force

Write-Host ""
Write-Host "[OK] Successfully switched to role: $Role" -ForegroundColor Green
Write-Host "  Active rules file: $currentRulesFile" -ForegroundColor Gray
Write-Host "  Source file: $roleFile" -ForegroundColor Gray
Write-Host ""
Write-Host "You can now use Cursor AI with the $Role role." -ForegroundColor Cyan
Write-Host "To switch to another role, run: .\switch-role.ps1 [role-name]" -ForegroundColor Gray
Write-Host "To see all available roles: .\switch-role.ps1 list" -ForegroundColor Gray
Write-Host ""

