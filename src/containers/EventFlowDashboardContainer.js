import React, { useState, useCallback, useMemo } from 'react';
import useAnalyticsData from '../hooks/useAnalyticsData';
import Dashboard from '../components/layout/Dashboard';
import MetricsCards from '../components/common/MetricsCards';
import SessionList from '../components/sessions/SessionList';
import AttendanceChart from '../components/analytics/AttendanceChart';
import TrendChart from '../components/analytics/TrendChart';
import SpeakerPerformance from '../components/speakers/SpeakerPerformance';
import './EventFlowDashboardContainer.css';

/**
 * EventFlowDashboard Container Component
 * 
 * Professional architecture pattern: Container-Component Pattern
 * This container manages all state and business logic, while
 * presentational components focus purely on UI rendering.
 * 
 * Responsibilities:
 * - State management
 * - Data fetching via custom hooks
 * - Business logic and data processing
 * - Event handling
 * - Passing props to presentational components
 */
const EventFlowDashboardContainer = () => {
  // State management
  const [activeView, setActiveView] = useState('overview');
  const [selectedSession, setSelectedSession] = useState(null);
  const [filters, setFilters] = useState({
    status: null,
    minEngagement: null,
    track: null,
    timeRange: null
  });
  const [showPerformanceMode, setShowPerformanceMode] = useState(false);

  // Fetch analytics data using custom hook
  const {
    data,
    sessions,
    metrics,
    loading,
    error,
    lastUpdate,
    refresh,
    getTopSessionsByMetric,
    getRecommendations
  } = useAnalyticsData({
    autoRefresh: true,
    refreshInterval: 5000,
    enableCache: true,
    filters
  });

  // Memoized data for charts
  const chartData = useMemo(() => {
    if (!data) return { attendance: [], trends: [] };
    
    return {
      attendance: data.topSessions.map(session => ({
        name: session.title,
        attendance: session.currentAttendance,
        capacity: session.capacity,
        rate: session.attendanceRate,
        speaker: session.speaker
      })),
      trends: data.attendanceTrends
    };
  }, [data]);

  // Event handlers
  const handleSessionClick = useCallback((session) => {
    setSelectedSession(session);
    // Could open a modal or navigate to detail view
    console.log('Session selected:', session);
  }, []);

  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  const handleViewChange = useCallback((view) => {
    setActiveView(view);
  }, []);

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  const togglePerformanceMode = useCallback(() => {
    setShowPerformanceMode(prev => !prev);
  }, []);

  // Get view-specific data
  const getViewData = useCallback(() => {
    switch (activeView) {
      case 'sessions':
        return {
          component: SessionList,
          props: {
            sessions,
            loading,
            onSessionClick: handleSessionClick
          }
        };
      
      case 'analytics':
        return {
          component: () => (
            <div className="analytics-view">
              <AttendanceChart 
                data={chartData.attendance}
                loading={loading}
                title="Top Sessions by Attendance"
              />
              <TrendChart
                data={chartData.trends}
                loading={loading}
                title="Attendance Throughout Day"
              />
            </div>
          ),
          props: {}
        };
      
      case 'speakers':
        return {
          component: SpeakerPerformance,
          props: {
            speakers: data?.performanceSummary?.highlights?.topSessions?.map(s => ({
              name: s.speaker,
              sessions: [s],
              engagement: s.engagement,
              rating: s.averageRating || 4.5
            })) || [],
            loading
          }
        };
      
      case 'overview':
      default:
        return {
          component: Dashboard,
          props: {
            sessions,
            metrics: data?.performanceSummary?.overview || {},
            recentFeedback: [],
            loading
          }
        };
    }
  }, [activeView, sessions, data, chartData, loading, handleSessionClick]);

  // Handle errors
  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>Error Loading Analytics</h2>
          <p>{error}</p>
          <button onClick={handleRefresh}>Retry</button>
        </div>
      </div>
    );
  }

  const viewData = getViewData();
  const ViewComponent = viewData.component;

  return (
    <div className="dashboard-container">
      {/* Header with navigation */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>EventFlow Analytics Dashboard</h1>
          <div className="header-controls">
            <nav className="view-navigation">
              <button 
                className={activeView === 'overview' ? 'active' : ''}
                onClick={() => handleViewChange('overview')}
              >
                Overview
              </button>
              <button 
                className={activeView === 'sessions' ? 'active' : ''}
                onClick={() => handleViewChange('sessions')}
              >
                Sessions
              </button>
              <button 
                className={activeView === 'analytics' ? 'active' : ''}
                onClick={() => handleViewChange('analytics')}
              >
                Analytics
              </button>
              <button 
                className={activeView === 'speakers' ? 'active' : ''}
                onClick={() => handleViewChange('speakers')}
              >
                Speakers
              </button>
            </nav>
            <div className="header-actions">
              <button onClick={handleRefresh} className="refresh-btn">
                🔄 Refresh
              </button>
              <button onClick={togglePerformanceMode} className="perf-btn">
                ⚡ Performance
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Metrics overview - always visible */}
      {metrics && (
        <MetricsCards 
          metrics={metrics}
          loading={loading}
        />
      )}

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="filter-controls">
          <select 
            onChange={(e) => handleFilterChange('status', e.target.value || null)}
            className="filter-select"
          >
            <option value="">All Sessions</option>
            <option value="active">Active</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
          </select>
          
          <select 
            onChange={(e) => handleFilterChange('minEngagement', e.target.value ? parseInt(e.target.value) : null)}
            className="filter-select"
          >
            <option value="">Any Engagement</option>
            <option value="50">50%+ Engagement</option>
            <option value="70">70%+ Engagement</option>
            <option value="90">90%+ Engagement</option>
          </select>
        </div>
        
        {lastUpdate && (
          <div className="update-indicator">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Main content area */}
      <main className="dashboard-main">
        <ViewComponent {...viewData.props} />
      </main>

      {/* Performance insights panel */}
      {data?.sessionsNeedingAttention && data.sessionsNeedingAttention.length > 0 && (
        <aside className="insights-panel">
          <h3>Sessions Needing Attention</h3>
          <div className="insights-list">
            {data.sessionsNeedingAttention.slice(0, 3).map((issue, index) => (
              <div key={index} className="insight-item">
                <h4>{issue.session.title}</h4>
                <p className={`severity ${issue.overallSeverity}`}>
                  {issue.problems[0].message}
                </p>
                <p className="action">{issue.recommendedActions[0]}</p>
              </div>
            ))}
          </div>
        </aside>
      )}

      {/* Selected session modal */}
      {selectedSession && (
        <div className="session-modal" onClick={() => setSelectedSession(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedSession.title}</h2>
            <p>Speaker: {selectedSession.speaker}</p>
            <p>Room: {selectedSession.room}</p>
            <p>Time: {selectedSession.time}</p>
            <p>Attendance: {selectedSession.currentAttendance}/{selectedSession.capacity}</p>
            <p>Engagement: {selectedSession.engagement}%</p>
            <button onClick={() => setSelectedSession(null)}>Close</button>
          </div>
        </div>
      )}

      {/* Performance comparison mode */}
      {showPerformanceMode && (
        <div className="performance-overlay">
          <div className="performance-content">
            <h2>Architecture Demonstration</h2>
            <div className="architecture-info">
              <div className="pattern-card">
                <h3>Container-Component Pattern</h3>
                <p>This container manages all state and logic</p>
                <ul>
                  <li>✅ State management centralized</li>
                  <li>✅ Business logic isolated</li>
                  <li>✅ Presentational components are pure</li>
                </ul>
              </div>
              
              <div className="pattern-card">
                <h3>Custom Hook Pattern</h3>
                <p>useAnalyticsData encapsulates data logic</p>
                <ul>
                  <li>✅ Reusable across components</li>
                  <li>✅ No code duplication</li>
                  <li>✅ Clean separation of concerns</li>
                </ul>
              </div>
              
              <div className="pattern-card">
                <h3>Service Layer Pattern</h3>
                <p>SessionAnalytics handles processing</p>
                <ul>
                  <li>✅ Business logic separated</li>
                  <li>✅ Testable in isolation</li>
                  <li>✅ Framework agnostic</li>
                </ul>
              </div>
            </div>
            <button onClick={togglePerformanceMode}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventFlowDashboardContainer;