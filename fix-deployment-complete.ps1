# Complete deployment fix with cleanup
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Complete Deployment Fix" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clean up workflows
Write-Host "Step 1: Cleaning up duplicate workflows..." -ForegroundColor Yellow
.\cleanup-workflows.ps1

# Step 2: Ensure correct workflow content
Write-Host ""
Write-Host "Step 2: Setting up correct workflow..." -ForegroundColor Yellow

$workflowContent = @'
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
          lfs: false
      
      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_AGREEABLE_PEBBLE_047418510 }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          api_location: ""
          output_location: "build"
        env:
          CI: false
          NODE_OPTIONS: '--max-old-space-size=4096'

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        id: closepullrequest
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_AGREEABLE_PEBBLE_047418510 }}
          action: "close"
'@

Set-Content -Path ".github\workflows\azure-static-web-apps-agreeable-pebble-047418510.yml" -Value $workflowContent
Write-Host "✓ Workflow configured correctly" -ForegroundColor Green

# Step 3: Verify index.js is using the full app
Write-Host ""
Write-Host "Step 3: Ensuring full app is deployed..." -ForegroundColor Yellow

$indexContent = @'
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

Set-Content -Path "src\index.js" -Value $indexContent
Write-Host "✓ Full app configured" -ForegroundColor Green

# Step 4: Test build
Write-Host ""
Write-Host "Step 4: Testing build locally..." -ForegroundColor Yellow
$env:CI = "false"
npm run build 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Build successful" -ForegroundColor Green
} else {
    Write-Host "⚠ Build failed - check errors" -ForegroundColor Red
    exit 1
}

# Step 5: Commit all changes
Write-Host ""
Write-Host "Step 5: Committing changes..." -ForegroundColor Yellow
git add -A
git commit -m "Clean up workflows and deploy full EventFlow app - single workflow only"

# Step 6: Push to GitHub
Write-Host ""
Write-Host "Step 6: Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "✓ Deployment Initiated!" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: Only ONE workflow will run now!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Monitor at:" -ForegroundColor Yellow
Write-Host "https://github.com/[your-username]/eventflow-dashboard/actions" -ForegroundColor Cyan
Write-Host ""
Write-Host "The single workflow will:" -ForegroundColor Yellow
Write-Host "  1. Let Azure detect and build the React app" -ForegroundColor White
Write-Host "  2. Allow ESLint warnings (CI=false)" -ForegroundColor White
Write-Host "  3. Deploy from the 'build' folder" -ForegroundColor White
Write-Host "  4. No conflicting workflows!" -ForegroundColor Green
