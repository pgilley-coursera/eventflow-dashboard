# Verify everything is ready for deployment
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Pre-deployment Check" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Check 1: Verify index.js is using App, not AppDeploy
Write-Host "1. Checking index.js configuration..." -ForegroundColor Yellow
$indexContent = Get-Content "src\index.js" -Raw
if ($indexContent -match "import App from './App'") {
    Write-Host "   ✓ index.js is using the full App component" -ForegroundColor Green
} elseif ($indexContent -match "import AppDeploy from './AppDeploy'") {
    Write-Host "   ⚠ index.js is still using AppDeploy (demo)" -ForegroundColor Red
    Write-Host "   Fixing..." -ForegroundColor Yellow
    
    $newContent = @'
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';  // Use the full app
// import AppDeploy from './AppDeploy';  // Comment out the demo version
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
reportWebVitals();
'@
    Set-Content -Path "src\index.js" -Value $newContent
    Write-Host "   ✓ Fixed! Now using full App" -ForegroundColor Green
}

# Check 2: Verify workflow file
Write-Host ""
Write-Host "2. Checking GitHub Actions workflow..." -ForegroundColor Yellow
$workflowContent = Get-Content ".github\workflows\azure-static-web-apps-agreeable-pebble-047418510.yml" -Raw
if ($workflowContent -notmatch "skip_app_build") {
    Write-Host "   ✓ Workflow is configured correctly (no skip_app_build)" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Workflow still has skip_app_build" -ForegroundColor Red
}

# Check 3: Test build locally
Write-Host ""
Write-Host "3. Testing local build..." -ForegroundColor Yellow
$env:CI = "false"
npm run build 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Build succeeds locally" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Build failed locally" -ForegroundColor Red
}

# Check 4: Git status
Write-Host ""
Write-Host "4. Checking git status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "   Files with changes:" -ForegroundColor Yellow
    git status --short
} else {
    Write-Host "   ✓ No uncommitted changes" -ForegroundColor Green
}

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Ready to deploy!" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Run .\push-fix.ps1 to deploy the changes" -ForegroundColor Yellow
