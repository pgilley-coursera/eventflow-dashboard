# 🎯 EventFlow Analytics Dashboard

<div align="center">
  <img src="https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Node.js-16+-green?style=for-the-badge&logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/badge/Tests-70%25+-brightgreen?style=for-the-badge" alt="Tests">
</div>

## 🚀 Overview

**EventFlow Analytics Dashboard** is a comprehensive real-time event analytics platform designed for conference organizers. Built as the capstone project for Course 5 of the JavaScript Professional Certificate program, it demonstrates advanced React development, performance optimization, and professional architecture patterns.

### ✨ Key Features

- **📊 Real-time Analytics** - Live data updates every 5 seconds
- **🎯 Session Tracking** - Monitor attendance, engagement, and capacity
- **👥 Speaker Performance** - Track ratings and attendee metrics
- **📈 Data Visualization** - Interactive charts with Recharts
- **⚡ Performance Optimized** - Dual implementation for demonstration
- **♿ WCAG AA Compliant** - Full accessibility support
- **🌙 Dark Mode** - Theme switching with system preference detection
- **📱 Responsive Design** - Mobile-first approach

## 🖼️ Screenshots

### Dashboard View
Real-time metrics display with session overview and speaker performance tracking.

### Analytics View  
Interactive charts showing attendance trends and engagement patterns throughout the day.

### Performance Monitoring
Live performance metrics with FPS, render time, and memory usage tracking.

## 🚦 Quick Start

### Prerequisites
- Node.js 16+ 
- npm 8+
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/eventflow-dashboard.git
cd eventflow-dashboard-demo

# Install dependencies
npm install

# Start development server
npm start
```

Visit `http://localhost:3000` to see the application.

## 🛠️ Technology Stack

- **Frontend**: React 18.2 with Hooks
- **Visualizations**: Recharts
- **Styling**: CSS Modules with CSS Variables
- **Testing**: Jest & React Testing Library
- **Deployment**: Azure Static Web Apps
- **CI/CD**: GitHub Actions

## 🚦 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 8 or higher

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/eventflow-dashboard.git
cd eventflow-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Create a local environment file:
```bash
cp .env.example .env.local
```

4. Start the development server:
```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

- `npm start` - Start development server
- `npm test` - Run test suite
- `npm run test:coverage` - Run tests with coverage report
- `npm run build` - Create production build
- `npm run analyze` - Analyze bundle size
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🏗️ Project Structure

```
src/
├── components/        # React components
│   ├── analytics/    # Data visualization components
│   ├── sessions/     # Session management
│   ├── speakers/     # Speaker performance
│   └── common/       # Shared components
├── components-unoptimized/  # Module 3: Before optimization
├── hooks/            # Custom React hooks
├── services/         # Business logic and API calls
├── utils/            # Helper functions
├── styles/           # CSS modules and themes
└── __tests__/        # Test files
```

## 🎯 Module Alignment

This project aligns with the Course 5 curriculum:

- **Module 1**: Project planning and architecture
- **Module 2**: Core implementation with React
- **Module 3**: Performance optimization (dual implementations)
- **Module 4**: Professional documentation and deployment

## 🔧 Performance Features

The application includes both unoptimized and optimized versions of components to demonstrate:

- React.memo for preventing unnecessary re-renders
- useMemo and useCallback for expensive operations
- Virtual scrolling for large lists
- Code splitting with React.lazy
- Memory leak prevention patterns

## ♿ Accessibility

- Full keyboard navigation support
- ARIA labels and roles
- Skip navigation links
- Screen reader announcements
- High contrast mode support

## 🚀 Deployment

The application is configured for deployment to Azure Static Web Apps:

1. Create an Azure Static Web App resource
2. Connect to your GitHub repository
3. Azure will automatically create the deployment workflow
4. Add the deployment token as a GitHub Secret

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

## 📊 Performance Metrics

Target performance metrics:
- Initial Load: < 3 seconds
- Time to Interactive: < 5 seconds
- Lighthouse Score: > 90
- Memory Usage: < 50MB baseline

## 🧪 Testing

The project maintains ~70% test coverage with:
- Unit tests for utilities and hooks
- Component tests for UI elements
- Integration tests for data flows

Run tests with:
```bash
npm test
```

## 📚 Documentation

- [Architecture](docs/ARCHITECTURE.md) - System design and data flow
- [API Reference](docs/API.md) - Component APIs and services
- [Deployment Guide](docs/DEPLOYMENT.md) - Azure deployment instructions
- [Performance Guide](docs/PERFORMANCE.md) - Optimization strategies

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## 📄 License

This project is part of the JavaScript Professional Certificate program.

---

Built with ❤️ for the JavaScript Career Launch Capstone Course
