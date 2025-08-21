# 🚀 EventFlow Deployment Guide

## 📋 Overview

This guide provides comprehensive instructions for deploying EventFlow Analytics Dashboard to Azure Static Web Apps, including CI/CD pipeline setup, environment configuration, and production best practices.

## 🏗️ Azure Static Web Apps Deployment

### Prerequisites

Before deploying, ensure you have:
- Azure subscription (free tier available)
- GitHub repository with your code
- Azure CLI installed (optional, for advanced configuration)
- Node.js 18+ for local testing

### Step 1: Azure Static Web App Creation

#### Option A: Azure Portal (Recommended)
1. **Navigate to Azure Portal**
   - Go to [portal.azure.com](https://portal.azure.com)
   - Sign in with your Azure account

2. **Create Resource**
   ```
   Click "Create a resource"
   → Search "Static Web Apps"
   → Select "Static Web Apps"
   → Click "Create"
   ```

3. **Configuration Settings**
   ```
   Subscription: [Your subscription]
   Resource Group: [Create new] eventflow-resources
   Name: eventflow-dashboard
   Plan Type: Free
   Region: Central US (or closest to users)
   
   Deployment Details:
   Source: GitHub
   Organization: [Your GitHub username]
   Repository: eventflow-dashboard-demo
   Branch: main
   
   Build Details:
   Build Presets: React
   App location: /
   Output location: build
   ```

4. **GitHub Integration**
   - Authorize Azure to access your GitHub account
   - Azure will automatically create a GitHub Actions workflow file

#### Option B: Azure CLI
```bash
# Login to Azure
az login

# Create resource group
az group create \
  --name eventflow-resources \
  --location "Central US"

# Create static web app
az staticwebapp create \
  --name eventflow-dashboard \
  --resource-group eventflow-resources \
  --source https://github.com/yourusername/eventflow-dashboard-demo \
  --location "Central US" \
  --branch main \
  --app-location "/" \
  --output-location "build" \
  --login-with-github
```

### Step 2: GitHub Actions Workflow

Azure automatically creates this workflow file at `.github/workflows/azure-static-web-apps-[random-string].yml`:

```yaml
# .github/workflows/azure-static-web-apps.yml
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
          
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test -- --coverage --watchAll=false
        
      - name: Build application
        run: npm run build
        
      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          output_location: "build"

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        id: closepullrequest
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "close"
```

### Step 3: Static Web App Configuration

Create `staticwebapp.config.json` in your project root:

```json
{
  "routes": [
    {
      "route": "/",
      "serve": "/index.html",
      "statusCode": 200
    },
    {
      "route": "/*.{js,css,png,jpg,jpeg,gif,svg,ico,woff,woff2,ttf,eot}",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "route": "/api/*",
      "allowedRoles": ["authenticated"]
    }
  ],
  "responseOverrides": {
    "401": {
      "redirect": "/login",
      "statusCode": 302
    },
    "403": {
      "redirect": "/unauthorized",
      "statusCode": 302
    },
    "404": {
      "redirect": "/",
      "statusCode": 302
    }
  },
  "globalHeaders": {
    "content-security-policy": "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "x-xss-protection": "1; mode=block",
    "referrer-policy": "strict-origin-when-cross-origin",
    "permissions-policy": "geolocation=(), microphone=(), camera=()"
  },
  "mimeTypes": {
    ".json": "application/json",
    ".woff": "font/woff",
    ".woff2": "font/woff2"
  },
  "defaultHeaders": {
    "content-encoding": "gzip"
  }
}
```

## 🔧 Environment Configuration

### Environment Variables

Create `.env.example` for template:
```bash
# .env.example
# Application Configuration
REACT_APP_API_ENDPOINT=https://api.eventflow.example
REACT_APP_ENVIRONMENT=production

# Azure Application Insights (Optional)
REACT_APP_INSIGHTS_CONNECTION_STRING=your-connection-string

# Feature Flags
REACT_APP_ENABLE_PERFORMANCE_MONITORING=true
REACT_APP_ENABLE_ANALYTICS=true

# Deployment Information
REACT_APP_VERSION=$npm_package_version
REACT_APP_BUILD_DATE=auto-generated
```

### Production Environment Variables in Azure

1. **Azure Portal Configuration**
   ```
   Azure Portal
   → Your Static Web App
   → Configuration
   → Application settings
   → Add new application setting
   ```

2. **Add Environment Variables**
   ```
   REACT_APP_API_ENDPOINT: https://api.eventflow.example
   REACT_APP_ENVIRONMENT: production
   REACT_APP_INSIGHTS_CONNECTION_STRING: [your-key]
   ```

3. **GitHub Secrets for CI/CD**
   ```
   GitHub Repository
   → Settings
   → Secrets and variables
   → Actions
   → New repository secret
   ```

   Required secrets:
   - `AZURE_STATIC_WEB_APPS_API_TOKEN` (auto-created by Azure)

## 📊 Monitoring and Logging

### Azure Application Insights Integration

1. **Create Application Insights Resource**
   ```bash
   az monitor app-insights component create \
     --app eventflow-insights \
     --location "Central US" \
     --resource-group eventflow-resources
   ```

2. **Add to React Application**
   ```javascript
   // src/utils/appInsights.js
   import { ApplicationInsights } from '@microsoft/applicationinsights-web';

   const appInsights = new ApplicationInsights({
     config: {
       connectionString: process.env.REACT_APP_INSIGHTS_CONNECTION_STRING,
       enableAutoRouteTracking: true,
       enableCorsCorrelation: true,
       enableRequestHeaderTracking: true,
       enableResponseHeaderTracking: true
     }
   });

   appInsights.loadAppInsights();
   appInsights.trackPageView();

   export { appInsights };
   ```

3. **Performance Tracking**
   ```javascript
   // src/utils/performanceTracking.js
   import { appInsights } from './appInsights';

   export const trackPerformance = (name, duration, properties = {}) => {
     appInsights.trackMetric({
       name,
       average: duration,
       properties
     });
   };

   export const trackError = (error, properties = {}) => {
     appInsights.trackException({
       exception: error,
       properties
     });
   };
   ```

### Custom Logging Setup

```javascript
// src/utils/logger.js
class Logger {
  constructor() {
    this.isProduction = process.env.REACT_APP_ENVIRONMENT === 'production';
  }

  info(message, data = {}) {
    if (this.isProduction && window.appInsights) {
      window.appInsights.trackTrace({
        message,
        severityLevel: 1,
        properties: data
      });
    } else {
      console.log(`[INFO] ${message}`, data);
    }
  }

  error(message, error = null, data = {}) {
    if (this.isProduction && window.appInsights) {
      window.appInsights.trackException({
        exception: error || new Error(message),
        properties: data
      });
    } else {
      console.error(`[ERROR] ${message}`, error, data);
    }
  }

  performance(name, duration, data = {}) {
    if (this.isProduction && window.appInsights) {
      window.appInsights.trackMetric({
        name: `Performance.${name}`,
        average: duration,
        properties: data
      });
    } else {
      console.log(`[PERF] ${name}: ${duration}ms`, data);
    }
  }
}

export const logger = new Logger();
```

## 🔒 Security Configuration

### Content Security Policy (CSP)

Implemented in `staticwebapp.config.json`:
```json
{
  "globalHeaders": {
    "content-security-policy": "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:"
  }
}
```

### Security Headers

```json
{
  "globalHeaders": {
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "x-xss-protection": "1; mode=block",
    "referrer-policy": "strict-origin-when-cross-origin",
    "permissions-policy": "geolocation=(), microphone=(), camera=()",
    "strict-transport-security": "max-age=31536000; includeSubDomains"
  }
}
```

### Environment Security

```javascript
// src/utils/config.js
const getConfig = () => {
  const requiredEnvVars = [
    'REACT_APP_API_ENDPOINT',
    'REACT_APP_ENVIRONMENT'
  ];

  const missingVars = requiredEnvVars.filter(
    varName => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }

  return {
    apiEndpoint: process.env.REACT_APP_API_ENDPOINT,
    environment: process.env.REACT_APP_ENVIRONMENT,
    insightsKey: process.env.REACT_APP_INSIGHTS_CONNECTION_STRING,
    version: process.env.REACT_APP_VERSION || 'development'
  };
};

export const config = getConfig();
```

## 🚦 Custom Domain Setup

### Step 1: Domain Configuration

1. **Add Custom Domain in Azure Portal**
   ```
   Azure Portal
   → Your Static Web App
   → Custom domains
   → Add custom domain
   → Enter your domain name
   ```

2. **DNS Configuration**
   ```
   For root domain (example.com):
   Type: ALIAS or ANAME
   Name: @
   Value: [your-static-web-app-url]

   For subdomain (www.example.com):
   Type: CNAME
   Name: www
   Value: [your-static-web-app-url]
   ```

### Step 2: SSL Certificate

Azure Static Web Apps automatically provides SSL certificates for custom domains.

```javascript
// Force HTTPS redirect
if (process.env.REACT_APP_ENVIRONMENT === 'production' && 
    window.location.protocol === 'http:') {
  window.location.replace(
    window.location.href.replace('http:', 'https:')
  );
}
```

## 📈 Performance Optimization

### Build Optimization

```json
// package.json
{
  "scripts": {
    "build": "GENERATE_SOURCEMAP=false react-scripts build",
    "build:analyze": "npm run build && npx source-map-explorer 'build/static/js/*.js'",
    "build:prod": "npm run test:ci && npm run build"
  }
}
```

### Caching Strategy

```json
// staticwebapp.config.json
{
  "routes": [
    {
      "route": "/*.{js,css}",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "route": "/*.{png,jpg,jpeg,gif,svg,ico}",
      "headers": {
        "cache-control": "public, max-age=2592000"
      }
    },
    {
      "route": "/",
      "headers": {
        "cache-control": "public, max-age=0, must-revalidate"
      }
    }
  ]
}
```

### Compression

```javascript
// Build-time compression
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  plugins: [
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 8192,
      minRatio: 0.8
    })
  ]
};
```

## 🧪 Testing the Deployment

### Pre-deployment Testing

```bash
# Run full test suite
npm run test:ci

# Build and test locally
npm run build
npx serve -s build

# Performance testing
npm run build:analyze
```

### Post-deployment Verification

```bash
# Automated deployment verification
curl -I https://your-app.azurestaticapps.net
curl -H "Accept: application/json" https://your-app.azurestaticapps.net/api/health

# Security headers verification
curl -I https://your-app.azurestaticapps.net | grep -i "x-frame-options\|content-security-policy"
```

### Health Check Endpoint

```javascript
// public/health.json
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00Z",
  "version": "1.0.0",
  "environment": "production"
}
```

## 🔄 CI/CD Pipeline Enhancements

### Advanced Workflow

```yaml
# .github/workflows/azure-static-web-apps-advanced.yml
name: EventFlow CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'

jobs:
  quality_checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
      
      - name: Run tests with coverage
        run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
      
      - name: Build application
        run: npm run build
      
      - name: Run Lighthouse CI
        run: npx lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

  deploy:
    needs: quality_checks
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
      
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          output_location: "build"
          
      - name: Post-deployment tests
        run: |
          curl -f https://your-app.azurestaticapps.net/health.json
          npx lighthouse https://your-app.azurestaticapps.net --only-categories=performance,accessibility,best-practices --chrome-flags="--headless"
```

## 📱 Progressive Web App (PWA) Configuration

### Service Worker Registration

```javascript
// src/serviceWorkerRegistration.js
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

export function register(config) {
  if ('serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        checkValidServiceWorker(swUrl, config);
      } else {
        registerValidSW(swUrl, config);
      }
    });
  }
}
```

### Web App Manifest

```json
// public/manifest.json
{
  "short_name": "EventFlow",
  "name": "EventFlow Analytics Dashboard",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#667eea",
  "background_color": "#ffffff",
  "description": "Real-time event analytics and performance monitoring dashboard"
}
```

## 🛠️ Troubleshooting Common Issues

### Build Failures

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version compatibility
node --version
npm --version
```

### Deployment Issues

```yaml
# Check GitHub Actions logs
# GitHub Repository → Actions → [Failed workflow] → [Job] → [Step]

# Common fixes:
# 1. Verify AZURE_STATIC_WEB_APPS_API_TOKEN secret
# 2. Check app_location and output_location paths
# 3. Ensure package.json has correct build script
```

### Runtime Errors

```javascript
// Error boundary for production
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    if (process.env.REACT_APP_ENVIRONMENT === 'production') {
      // Log to Application Insights
      window.appInsights?.trackException({
        exception: error,
        properties: errorInfo
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong. Please refresh the page.</h1>;
    }

    return this.props.children;
  }
}
```

## 📊 Monitoring and Alerts

### Application Insights Alerts

```json
// Alert rules configuration
{
  "name": "High Response Time",
  "condition": "avg(requests/duration) > 3000",
  "frequency": "PT5M",
  "severity": 2,
  "actions": [
    {
      "actionGroupId": "/subscriptions/{subscription-id}/resourceGroups/{resource-group}/providers/microsoft.insights/actionGroups/{action-group-name}"
    }
  ]
}
```

### Custom Metrics Dashboard

```javascript
// src/utils/metricsReporter.js
export class MetricsReporter {
  static reportPageLoad(duration) {
    if (window.appInsights) {
      window.appInsights.trackMetric({
        name: 'PageLoadTime',
        average: duration,
        properties: {
          page: window.location.pathname,
          userAgent: navigator.userAgent
        }
      });
    }
  }

  static reportError(error, context = {}) {
    if (window.appInsights) {
      window.appInsights.trackException({
        exception: error,
        properties: {
          ...context,
          timestamp: new Date().toISOString(),
          url: window.location.href
        }
      });
    }
  }
}
```

## 🎯 Deployment Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Lighthouse score > 90
- [ ] Bundle size optimized
- [ ] Environment variables configured
- [ ] Security headers implemented
- [ ] Error boundaries in place

### Deployment
- [ ] GitHub Actions workflow successful
- [ ] Static Web App deployed
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Application Insights connected

### Post-deployment
- [ ] Health check endpoint responding
- [ ] All features working in production
- [ ] Performance metrics within targets
- [ ] Error tracking functional
- [ ] Monitoring alerts configured

---

*This deployment guide provides comprehensive instructions for successfully deploying EventFlow Analytics Dashboard to Azure Static Web Apps with production-ready configuration and monitoring.*