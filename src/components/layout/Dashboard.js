import React, { useMemo, useEffect } from 'react';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import { useMetricAnnouncement, useAccessibility } from '../../hooks/useAccessibility';
import MetricsCards from '../common/MetricsCards';
import SessionList from '../sessions/SessionList';
import AttendanceChart from '../analytics/AttendanceChart';
import TrendChart from '../analytics/TrendChart';
import SpeakerPerformance from '../speakers/SpeakerPerformance';
import LiveRegion from '../common/LiveRegion';
import analyticsService from '../../services/analyticsService';
import { 
  transformSessionsForChart, 
  transformAttendanceTrends,
  transformSpeakerPerformance,
  getTopPerformingSessions
} from '../../utils/dataTransformers';
import './Dashboard.css';

const Dashboard = () => {
  const { data, isLoading, error } = useRealtimeData(true);
  const { announce } = useAccessibility();
  
  const dashboardData = useMemo(() => {
    if (!data) return null;
    
    const topSessions = getTopPerformingSessions(data.sessions || [], 10);
    const chartData = transformSessionsForChart(topSessions);
    const trendData = transformAttendanceTrends(data.sessions || []);
    const speakerData = transformSpeakerPerformance(
      data.speakers || [], 
      data.sessions || []
    );
    
    const metrics = {
      ...data.metrics,
      sessionsTrend: { direction: 'up', value: '+2 from last hour' },
      attendeesTrend: { direction: 'up', value: '+47 new' },
      engagementTrend: { direction: 'stable', value: 'Stable' },
      ratingTrend: { direction: 'up', value: '+0.2' }
    };
    
    return {
      metrics,
      sessions: data.sessions || [],
      chartData,
      trendData,
      speakerData
    };
  }, [data]);
  
  // Announce metric changes for screen readers
  useMetricAnnouncement(dashboardData?.metrics);
  
  // Announce dashboard load status
  useEffect(() => {
    if (isLoading) {
      announce('Loading dashboard data', 'polite');
    } else if (data && !error) {
      announce('Dashboard data loaded successfully', 'polite');
    } else if (error) {
      announce('Error loading dashboard data', 'assertive');
    }
  }, [isLoading, data, error, announce]);
  
  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          <h3>Error loading dashboard</h3>
          <p>{error.message || 'Failed to load dashboard data'}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>EventFlow Analytics Dashboard</h1>
        <p className="dashboard-subtitle">
          Real-time event tracking and analytics
        </p>
      </div>
      
      <MetricsCards 
        metrics={dashboardData?.metrics} 
        loading={isLoading}
      />
      
      <div className="dashboard-grid">
        <div className="dashboard-main">
          <SessionList 
            sessions={dashboardData?.sessions} 
            loading={isLoading}
            onSessionClick={(session) => console.log('Session clicked:', session)}
          />
          
          <div className="charts-row">
            <AttendanceChart 
              data={dashboardData?.chartData}
              loading={isLoading}
              title="Most Popular Sessions"
            />
            
            <TrendChart 
              data={dashboardData?.trendData}
              loading={isLoading}
              title="Attendance Throughout Day"
              type="area"
            />
          </div>
        </div>
        
        <div className="dashboard-sidebar">
          <SpeakerPerformance 
            speakers={dashboardData?.speakerData}
            loading={isLoading}
          />
          
          {data && data.feedback && data.feedback.length > 0 && (
            <div className="recent-feedback">
              <h3>Recent Feedback</h3>
              <div className="feedback-list">
                {data.feedback.slice(0, 5).map((feedback, index) => (
                  <div key={feedback.id || index} className="feedback-item">
                    <div className="feedback-header">
                      <span className="feedback-author">{feedback.attendeeName}</span>
                      <span className="feedback-rating">
                        {'⭐'.repeat(Math.round(feedback.ratings.overall))}
                      </span>
                    </div>
                    <p className="feedback-comment">{feedback.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {data && (
        <div className="dashboard-footer">
          <span className="update-indicator">
            Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}
          </span>
          <span className="update-count">
            Update #{data.updateCount || 0}
          </span>
        </div>
      )}
    </div>
  );
};

export default Dashboard;