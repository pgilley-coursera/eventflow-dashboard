# EventFlow Azure Deployment Script
# This script deploys the full EventFlow app to Azure Static Web Apps

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "EventFlow Azure Deployment" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Check current directory
$currentDir = Get-Location
Write-Host "Current directory: $currentDir" -ForegroundColor Yellow

# Confirm we're in the right place
if (-not (Test-Path "package.json")) {
    Write-Host "Error: package.json not found. Please run this from the eventflow-dashboard directory" -ForegroundColor Red
    exit 1
}

# Step 1: Build the application
Write-Host ""
Write-Host "Step 1: Building the application..." -ForegroundColor Yellow
$env:CI = "false"  # Allow warnings
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed! Check the errors above." -ForegroundColor Red
    exit 1
}
Write-Host "✓ Build completed successfully" -ForegroundColor Green

# Step 2: Check git status
Write-Host ""
Write-Host "Step 2: Checking git status..." -ForegroundColor Yellow
git status --short

# Step 3: Commit and push changes
Write-Host ""
Write-Host "Step 3: Committing and pushing changes..." -ForegroundColor Yellow
Write-Host "Adding all changes to git..."
git add -A

Write-Host "Creating commit..."
git commit -m "Deploy full EventFlow application with updated workflow"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Pushing to GitHub..."
    git push origin main
    
    Write-Host ""
    Write-Host "✓ Changes pushed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host "Deployment initiated!" -ForegroundColor Green
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Go to GitHub Actions: https://github.com/[your-username]/eventflow-dashboard/actions"
    Write-Host "2. Watch the workflow progress"
    Write-Host "3. Once complete, visit your Azure Static Web App URL"
    Write-Host ""
    Write-Host "If the workflow fails, check the GitHub Actions logs for details."
}
else {
    Write-Host "No changes to commit (or commit failed)" -ForegroundColor Yellow
}
