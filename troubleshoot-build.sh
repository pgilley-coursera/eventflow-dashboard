#!/bin/bash

# EventFlow Build Troubleshooting Script
# This script helps diagnose build issues locally

echo "==================================="
echo "EventFlow Build Troubleshooting"
echo "==================================="
echo ""

# Check Node.js version
echo "1. Checking Node.js version..."
node_version=$(node --version)
echo "   Node.js version: $node_version"
if [[ ! "$node_version" =~ ^v1[68] ]]; then
    echo "   ⚠️  Warning: Node.js 16 or 18 is recommended"
fi
echo ""

# Check npm version
echo "2. Checking npm version..."
npm_version=$(npm --version)
echo "   npm version: $npm_version"
echo ""

# Check for package-lock.json
echo "3. Checking for package-lock.json..."
if [ -f "package-lock.json" ]; then
    echo "   ✓ package-lock.json exists"
else
    echo "   ⚠️  Warning: package-lock.json not found"
    echo "   Run 'npm install' to generate it"
fi
echo ""

# Clean install dependencies
echo "4. Clean installing dependencies..."
echo "   Removing node_modules and package-lock.json..."
rm -rf node_modules package-lock.json
echo "   Running npm install..."
npm install
if [ $? -ne 0 ]; then
    echo "   ❌ npm install failed"
    exit 1
else
    echo "   ✓ Dependencies installed successfully"
fi
echo ""

# Check for build issues
echo "5. Testing build process..."
echo "   Running npm run build..."
npm run build
if [ $? -ne 0 ]; then
    echo "   ❌ Build failed"
    echo "   Check the error messages above"
    exit 1
else
    echo "   ✓ Build completed successfully"
fi
echo ""

# Check build output
echo "6. Checking build output..."
if [ -d "build" ]; then
    echo "   ✓ Build directory exists"
    echo "   Build size: $(du -sh build | cut -f1)"
    echo "   Files in build:"
    ls -la build/ | head -10
else
    echo "   ❌ Build directory not found"
    exit 1
fi
echo ""

echo "==================================="
echo "Troubleshooting Complete"
echo "==================================="
echo ""
echo "If all checks passed, the build should work in GitHub Actions."
echo "If any checks failed, fix those issues before pushing to GitHub."
