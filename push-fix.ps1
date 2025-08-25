# Quick deployment fix
Write-Host "Pushing workflow fix to GitHub..." -ForegroundColor Yellow

# Check status
git status --short

# Add the workflow file
git add .github/workflows/azure-static-web-apps-agreeable-pebble-047418510.yml

# Commit
git commit -m "Fix Azure deployment - let Azure handle the build process"

# Push
git push origin main

Write-Host ""
Write-Host "✓ Fix pushed!" -ForegroundColor Green
Write-Host ""
Write-Host "Monitor deployment at:" -ForegroundColor Yellow
Write-Host "https://github.com/[your-username]/eventflow-dashboard/actions" -ForegroundColor Cyan
Write-Host ""
Write-Host "The deployment should now:" -ForegroundColor Yellow
Write-Host "1. Let Azure automatically detect the React app" -ForegroundColor White
Write-Host "2. Run npm ci and npm run build automatically" -ForegroundColor White
Write-Host "3. Deploy the built files from the 'build' folder" -ForegroundColor White
Write-Host "4. Allow ESLint warnings (CI=false)" -ForegroundColor White
