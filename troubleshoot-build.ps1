# EventFlow Build Troubleshooting Script for Windows PowerShell
# This script helps diagnose build issues locally

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "EventFlow Build Troubleshooting" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js version
Write-Host "1. Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node --version
Write-Host "   Node.js version: $nodeVersion"
if ($nodeVersion -notmatch "^v1[68]") {
    Write-Host "   Warning: Node.js 16 or 18 is recommended" -ForegroundColor Red
}
Write-Host ""

# Check npm version
Write-Host "2. Checking npm version..." -ForegroundColor Yellow
$npmVersion = npm --version
Write-Host "   npm version: $npmVersion"
Write-Host ""

# Check for package-lock.json
Write-Host "3. Checking for package-lock.json..." -ForegroundColor Yellow
if (Test-Path "package-lock.json") {
    Write-Host "   ✓ package-lock.json exists" -ForegroundColor Green
} else {
    Write-Host "   Warning: package-lock.json not found" -ForegroundColor Red
    Write-Host "   Run 'npm install' to generate it"
}
Write-Host ""

# Clean install dependencies
Write-Host "4. Clean installing dependencies..." -ForegroundColor Yellow
Write-Host "   Removing node_modules and package-lock.json..."
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force node_modules
}
if (Test-Path "package-lock.json") {
    Remove-Item -Force package-lock.json
}

Write-Host "   Running npm install..."
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "   X npm install failed" -ForegroundColor Red
    exit 1
} else {
    Write-Host "   ✓ Dependencies installed successfully" -ForegroundColor Green
}
Write-Host ""

# Check for build issues
Write-Host "5. Testing build process..." -ForegroundColor Yellow
Write-Host "   Running npm run build..."
$env:CI = "false"  # Disable CI mode to avoid treating warnings as errors
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "   X Build failed" -ForegroundColor Red
    Write-Host "   Check the error messages above"
    exit 1
} else {
    Write-Host "   ✓ Build completed successfully" -ForegroundColor Green
}
Write-Host ""

# Check build output
Write-Host "6. Checking build output..." -ForegroundColor Yellow
if (Test-Path "build") {
    Write-Host "   ✓ Build directory exists" -ForegroundColor Green
    $buildSize = (Get-ChildItem -Path "build" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "   Build size: $([math]::Round($buildSize, 2)) MB"
    Write-Host "   Files in build:"
    Get-ChildItem "build" | Select-Object -First 10 | Format-Table Name, Length, LastWriteTime
} else {
    Write-Host "   X Build directory not found" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Troubleshooting Complete" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If all checks passed, the build should work in GitHub Actions."
Write-Host "If any checks failed, fix those issues before pushing to GitHub."
