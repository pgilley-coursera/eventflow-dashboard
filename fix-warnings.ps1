# Quick fixes for ESLint warnings
# Run this if you want to clean up the warnings (optional)

Write-Host "Fixing ESLint warnings..." -ForegroundColor Yellow

# Fix 1: Remove unused imports and variables
$files = @{
    "src\App.js" = @(
        "Line 28: Remove or use 'showPerformanceHistory' and 'setShowPerformanceHistory'"
    )
    "src\components\analytics\TrendChart.js" = @(
        "Line 66: Remove unused 'DataComponent'"
    )
    "src\components\layout\Dashboard.js" = @(
        "Line 9: Remove unused 'LiveRegion' import",
        "Line 10: Remove unused 'analyticsService' import", 
        "Line 95: Remove or comment out console.log"
    )
    "src\components\sessions\SessionList.js" = @(
        "Line 115: Remove or use 'announce' variable",
        "Line 306: Change role from 'listitem' to 'option' or remove aria-selected"
    )
    "src\hooks\usePerformanceMonitor.js" = @(
        "Line 103: Comment out console.log"
    )
    "src\services\realtimeSimulator.js" = @(
        "Lines 192, 207: Comment out console.log statements"
    )
}

Write-Host ""
Write-Host "Manual fixes needed in the following files:" -ForegroundColor Yellow
foreach ($file in $files.Keys) {
    Write-Host ""
    Write-Host "File: $file" -ForegroundColor Cyan
    foreach ($fix in $files[$file]) {
        Write-Host "  - $fix"
    }
}

Write-Host ""
Write-Host "These are optional - the app will deploy with warnings." -ForegroundColor Green
Write-Host "To fix them, open each file and make the suggested changes." -ForegroundColor Green
