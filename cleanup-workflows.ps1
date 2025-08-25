# Clean up duplicate workflow files
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Cleaning Up Workflow Files" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to workflows directory
$workflowPath = ".github\workflows"
Write-Host "Current workflow files:" -ForegroundColor Yellow
Get-ChildItem $workflowPath -Filter "*.yml" | ForEach-Object { Write-Host "  - $($_.Name)" }

Write-Host ""
Write-Host "Cleaning up..." -ForegroundColor Yellow

# Create a backup directory
$backupDir = ".github\workflows-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
    Write-Host "Created backup directory: $backupDir" -ForegroundColor Green
}

# Move all files except the main one to backup
$filesToBackup = @(
    "azure-static-web-apps-agreeable-pebble-047418510-fixed.yml",
    "azure-static-web-apps.yml",
    "azure-static-web-apps-agreeable-pebble-047418510.yml.bak"
)

foreach ($file in $filesToBackup) {
    $fullPath = Join-Path $workflowPath $file
    if (Test-Path $fullPath) {
        Move-Item -Path $fullPath -Destination $backupDir -Force
        Write-Host "  Moved $file to backup" -ForegroundColor Gray
    }
}

# Remove any dot-files (macOS metadata)
Get-ChildItem $workflowPath -Filter "._*" | Remove-Item -Force -ErrorAction SilentlyContinue
Write-Host "  Removed macOS metadata files" -ForegroundColor Gray

Write-Host ""
Write-Host "✓ Cleanup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Remaining workflow files:" -ForegroundColor Yellow
Get-ChildItem $workflowPath -Filter "*.yml" | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor Green }

Write-Host ""
Write-Host "Now we have only ONE workflow that will run!" -ForegroundColor Cyan
