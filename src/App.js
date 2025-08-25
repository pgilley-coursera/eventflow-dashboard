import React, { useState, useEffect } from 'react';
import './styles/App.css';
import Dashboard from './components/layout/Dashboard';
import SessionList from './components/sessions/SessionList';
import AttendanceChart from './components/analytics/AttendanceChart';
import TrendChart from './components/analytics/TrendChart';
import SpeakerPerformance from './components/speakers/SpeakerPerformance';
import PerformanceDisplay from './components/common/PerformanceDisplay';
import PerformanceHistory from './components/analytics/PerformanceHistory';
import { LiveRegions } from './components/common/LiveRegion';
import { useRealtimeData } from './hooks/useRealtimeData';
import { useSkipLinks, useAccessibility } from './hooks/useAccessibility';
import { 
  transformSessionsForChart, 
  transformAttendanceTrends,
  transformSpeakerPerformance 
} from './utils/dataTransformers';
import usePerformanceMonitor from './hooks/usePerformanceMonitor';

/**
 * Main Application Component
 * Implements single-page application with tab-based navigation
 * Module 1, Lesson 1: Professional Project Planning
 */
function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('light');
  const [showPerformanceHistory, setShowPerformanceHistory] = useState(false);
  const { data, isLoading } = useRealtimeData(true);
  const { markRenderStart, markRenderEnd } = usePerformanceMonitor('App');
  const { announce } = useAccessibility();
  
  // Initialize skip links
  useSkipLinks();
  
  // Track app-level render performance
  useEffect(() => {
    markRenderStart();
    return () => {
      markRenderEnd();
    };
  });
  
  // Announce tab changes
  useEffect(() => {
    const tabLabels = {
      dashboard: 'Dashboard',
      sessions: 'Sessions',
      analytics: 'Analytics',
      speakers: 'Speakers',
      performance: 'Performance Monitoring'
    };
    announce(`${tabLabels[activeTab]} tab selected`, 'polite');
  }, [activeTab, announce]);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('eventflow-theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;
    
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  // Handle theme toggle
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('eventflow-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Tab configuration
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'sessions', label: 'Sessions', icon: '🎯' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'speakers', label: 'Speakers', icon: '🎤' },
    { id: 'performance', label: 'Performance', icon: '⚡' },
  ];

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'sessions':
        return (
          <div className="tab-content">
            <SessionList 
              sessions={data?.sessions || []} 
              loading={isLoading}
            />
          </div>
        );
      case 'analytics':
        return (
          <div className="tab-content">
            <h2>Analytics & Insights</h2>
            <div style={{ display: 'grid', gap: '2rem' }}>
              <AttendanceChart 
                data={transformSessionsForChart(data?.sessions || [])}
                loading={isLoading}
              />
              <TrendChart 
                data={transformAttendanceTrends(data?.sessions || [])}
                loading={isLoading}
                type="area"
              />
            </div>
          </div>
        );
      case 'speakers':
        return (
          <div className="tab-content">
            <SpeakerPerformance 
              speakers={transformSpeakerPerformance(data?.speakers || [], data?.sessions || [])}
              loading={isLoading}
            />
          </div>
        );
      case 'performance':
        return (
          <div className="tab-content">
            <h2>Performance Monitoring</h2>
            <PerformanceHistory componentName="App" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app">
      {/* Skip links for accessibility */}
      <div className="skip-links">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <a href="#navigation" className="skip-link">
          Skip to navigation
        </a>
        <a href="#footer" className="skip-link">
          Skip to footer
        </a>
      </div>
      
      {/* Live regions for screen reader announcements */}
      <LiveRegions />

      {/* Header */}
      <header className="app-header" role="banner">
        <div className="container">
          <div className="header-content">
            <div className="header-brand">
              <h1 className="app-title">
                <span className="gradient-text">EventFlow</span>
                <span className="subtitle">Analytics Dashboard</span>
              </h1>
            </div>
            
            <div className="header-actions">
              {/* Theme Toggle */}
              <button
                className="theme-toggle"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              
              {/* Performance Indicator (for Module 3 demonstrations) */}
              <div className="performance-indicator">
                <span className="indicator-dot"></span>
                <span className="indicator-text">Live</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav id="navigation" className="app-nav" role="navigation" aria-label="Main navigation">
        <div className="container">
          <div className="nav-tabs" role="tablist">
            {tabs.map(tab => (
              <button
                key={tab.id}
                role="tab"
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                aria-selected={activeTab === tab.id}
                aria-controls={`${tab.id}-panel`}
                id={`${tab.id}-tab`}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main 
        id="main-content" 
        className="app-main"
        role="main"
        aria-labelledby={`${activeTab}-tab`}
      >
        <div 
          className="container"
          role="tabpanel"
          id={`${activeTab}-panel`}
          aria-labelledby={`${activeTab}-tab`}
        >
          {renderTabContent()}
        </div>
      </main>

      {/* Footer with Performance Metrics (Module 3) */}
      <footer id="footer" className="app-footer" role="contentinfo">
        <div className="container">
          <div className="footer-content">
            <PerformanceDisplay componentName="App" />
            <div className="footer-info">
              <p>© 2025 EventFlow Solutions • JavaScript Career Launch Capstone</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
