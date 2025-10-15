# PowerShell Script to Copy Alerts Tab Files to React Native App
# Run this script from the muktsar-admin-panel directory

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Alerts Tab Files Copy Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Define source and destination paths
$sourceDir = Get-Location
$destDir = "D:\Documents\muktsarNgo\app\muktsarngo"

# Check if destination directory exists
if (-not (Test-Path $destDir)) {
    Write-Host "ERROR: Destination directory not found: $destDir" -ForegroundColor Red
    Write-Host "Please verify the React Native app location." -ForegroundColor Red
    exit 1
}

Write-Host "Source Directory: $sourceDir" -ForegroundColor Yellow
Write-Host "Destination Directory: $destDir" -ForegroundColor Yellow
Write-Host ""

# Function to copy file with backup
function Copy-FileWithBackup {
    param (
        [string]$SourceFile,
        [string]$DestFile,
        [bool]$CreateBackup = $false
    )
    
    if (-not (Test-Path $SourceFile)) {
        Write-Host "  [SKIP] Source file not found: $SourceFile" -ForegroundColor Yellow
        return $false
    }
    
    # Create destination directory if it doesn't exist
    $destFolder = Split-Path -Parent $DestFile
    if (-not (Test-Path $destFolder)) {
        New-Item -ItemType Directory -Path $destFolder -Force | Out-Null
        Write-Host "  [CREATE] Created directory: $destFolder" -ForegroundColor Green
    }
    
    # Create backup if file exists and backup is requested
    if ($CreateBackup -and (Test-Path $DestFile)) {
        $backupFile = "$DestFile.backup"
        Copy-Item $DestFile $backupFile -Force
        Write-Host "  [BACKUP] Created backup: $backupFile" -ForegroundColor Cyan
    }
    
    # Copy the file
    Copy-Item $SourceFile $DestFile -Force
    Write-Host "  [COPY] Copied: $(Split-Path -Leaf $SourceFile)" -ForegroundColor Green
    return $true
}

# Files to copy
Write-Host "Copying new files..." -ForegroundColor Cyan
Write-Host ""

# 1. AlertsTabContent.js
Write-Host "1. AlertsTabContent.js" -ForegroundColor White
$success = Copy-FileWithBackup `
    -SourceFile "$sourceDir\AlertsTabContent.js" `
    -DestFile "$destDir\src\components\AlertsTabContent.js" `
    -CreateBackup $false
Write-Host ""

# 2. AlertDetailScreen.js
Write-Host "2. AlertDetailScreen.js" -ForegroundColor White
$success = Copy-FileWithBackup `
    -SourceFile "$sourceDir\AlertDetailScreen.js" `
    -DestFile "$destDir\src\screens\AlertDetailScreen.js" `
    -CreateBackup $false
Write-Host ""

# 3. AlertListScreen_Updated.js (replace existing AlertListScreen.js)
Write-Host "3. AlertListScreen.js (Updated)" -ForegroundColor White
$success = Copy-FileWithBackup `
    -SourceFile "$sourceDir\AlertListScreen_Updated.js" `
    -DestFile "$destDir\src\screens\AlertListScreen.js" `
    -CreateBackup $true
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Copy Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Update api.js with new endpoints" -ForegroundColor White
Write-Host "   Location: $destDir\src\services\api.js" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Update ApiService.js with new methods" -ForegroundColor White
Write-Host "   Location: $destDir\src\services\ApiService.js" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Update AdminDashboardScreen.js" -ForegroundColor White
Write-Host "   Location: $destDir\src\screens\AdminDashboardScreen.js" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Update AppNavigator.js" -ForegroundColor White
Write-Host "   Location: $destDir\src\navigation\AppNavigator.js" -ForegroundColor Gray
Write-Host ""
Write-Host "See ALERTS_TAB_FILES_AND_INSTRUCTIONS.md for detailed instructions." -ForegroundColor Cyan
Write-Host ""

# Verify bloodGroupFormatter exists
$bloodGroupFormatter = "$destDir\src\utils\bloodGroupFormatter.js"
if (Test-Path $bloodGroupFormatter) {
    Write-Host "[OK] bloodGroupFormatter.js exists" -ForegroundColor Green
} else {
    Write-Host "[WARNING] bloodGroupFormatter.js not found!" -ForegroundColor Yellow
    Write-Host "  Expected location: $bloodGroupFormatter" -ForegroundColor Gray
    Write-Host "  This file is required for the Alerts tab to work." -ForegroundColor Gray
}
Write-Host ""

Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

