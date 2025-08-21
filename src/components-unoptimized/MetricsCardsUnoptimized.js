import React, { useState, useEffect } from 'react';
import '../components/common/MetricsCards.css';

const MetricCard = ({ title, value, icon, trend, color, subtitle }) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [rerenderCount, setRerenderCount] = useState(0);
  
  // PERFORMANCE ISSUE: Animation running continuously without cleanup
  useEffect(() => {
    // PERFORMANCE ISSUE: Creating multiple intervals without cleanup
    const interval1 = setInterval(() => {
      setRerenderCount(prev => prev + 1);
    }, 500);
    
    // PERFORMANCE ISSUE: Animating value inefficiently
    const targetValue = typeof value === 'number' ? value : parseInt(value);
    if (!isNaN(targetValue)) {
      let current = 0;
      const step = targetValue / 100;
      
      const interval2 = setInterval(() => {
        current += step;
        if (current >= targetValue) {
          current = targetValue;
        }
        setAnimatedValue(Math.round(current));
        
        // PERFORMANCE ISSUE: This will never clear because condition is inside
        if (current >= targetValue) {
          // Should clear interval here but doesn't
        }
      }, 10);
    }
    
    // MISSING: No cleanup function
  }); // PERFORMANCE ISSUE: No dependency array
  
  // PERFORMANCE ISSUE: Complex style calculation on every render
  const cardStyle = {
    background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
    borderImage: `linear-gradient(135deg, ${color} 0%, ${color}88 100%) 1`,
    transform: `scale(${1 + Math.random() * 0.001})`, // Causes constant re-renders
  };
  
  // PERFORMANCE ISSUE: Creating new function on every render
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend > 0) return '📈';
    if (trend < 0) return '📉';
    return '➡️';
  };
  
  // PERFORMANCE ISSUE: Expensive calculation on every render
  const formatValue = () => {
    if (typeof value === 'string' && value.includes('%')) {
      return value;
    }
    
    // Simulate expensive formatting
    let formatted = animatedValue.toString();
    for (let i = 0; i < 100; i++) {
      formatted = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    return formatted;
  };
  
  return (
    <article className="metric-card" style={cardStyle}>
      <div className="metric-header">
        <span className="metric-icon">{icon}</span>
        <span className="metric-title">{title}</span>
      </div>
      <div className="metric-value">
        <span className="value-text">{formatValue()}</span>
        {trend !== undefined && (
          <span className={`trend-indicator ${trend > 0 ? 'positive' : trend < 0 ? 'negative' : 'neutral'}`}>
            {getTrendIcon()} {Math.abs(trend)}%
          </span>
        )}
      </div>
      {subtitle && <div className="metric-subtitle">{subtitle}</div>}
      <div style={{ fontSize: '8px', opacity: 0.3 }}>
        Rerenders: {rerenderCount}
      </div>
    </article>
  );
};

const MetricsCardsUnoptimized = ({ metrics, loading = false }) => {
  const [dataUpdateCount, setDataUpdateCount] = useState(0);
  const [memoryLeakArray, setMemoryLeakArray] = useState([]);
  
  // PERFORMANCE ISSUE: Memory leak - accumulating data without limit
  useEffect(() => {
    const timer = setInterval(() => {
      setMemoryLeakArray(prev => [...prev, new Array(1000).fill(Math.random())]);
      setDataUpdateCount(prev => prev + 1);
    }, 1000);
    
    // MISSING: No cleanup
  }); // PERFORMANCE ISSUE: No dependency array
  
  if (loading) {
    return (
      <div className="metrics-container">
        <h2 className="metrics-title">Event Metrics (Unoptimized)</h2>
        <div className="metrics-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="metric-card loading">
              <div className="skeleton skeleton-header"></div>
              <div className="skeleton skeleton-value"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // PERFORMANCE ISSUE: Calculating metrics on every render
  const calculateMetrics = () => {
    console.log('Calculating metrics - runs on EVERY render');
    
    const activeSessions = metrics?.activeSessions || 0;
    const totalAttendees = metrics?.totalAttendees || 0;
    const avgEngagement = metrics?.avgEngagement || 0;
    const avgRating = metrics?.avgRating || 0;
    
    // PERFORMANCE ISSUE: Unnecessary complex calculations
    let processedMetrics = [];
    for (let i = 0; i < 100; i++) {
      processedMetrics = [
        {
          title: 'Active Sessions',
          value: activeSessions,
          icon: '📊',
          trend: 8,
          color: '#667eea',
          subtitle: `${metrics?.upcomingSessions || 0} upcoming`
        },
        {
          title: 'Total Attendees',
          value: totalAttendees,
          icon: '👥',
          trend: 12,
          color: '#10b981',
          subtitle: `${metrics?.uniqueSpeakers || 0} speakers`
        },
        {
          title: 'Avg Engagement',
          value: `${avgEngagement}%`,
          icon: '💡',
          trend: avgEngagement > 75 ? 5 : -3,
          color: '#f59e0b',
          subtitle: 'Last 30 minutes'
        },
        {
          title: 'Avg Rating',
          value: avgRating.toFixed(1),
          icon: '⭐',
          trend: 2,
          color: '#ef4444',
          subtitle: `${metrics?.totalFeedback || 0} reviews`
        }
      ];
    }
    
    return processedMetrics;
  };
  
  const metricsData = calculateMetrics();
  
  return (
    <section className="metrics-container" aria-label="Event Metrics">
      <h2 className="metrics-title">Event Metrics (Unoptimized)</h2>
      <div className="metrics-grid">
        {/* PERFORMANCE ISSUE: Not using React.memo for MetricCard */}
        {metricsData.map((metric, index) => (
          <MetricCard
            key={index} // PERFORMANCE ISSUE: Using index as key
            {...metric}
          />
        ))}
      </div>
      
      {/* Debug info showing performance issues */}
      <div style={{ fontSize: '10px', marginTop: '10px', opacity: 0.5 }}>
        Memory leak size: {memoryLeakArray.length} arrays | 
        Data updates: {dataUpdateCount}
      </div>
    </section>
  );
};

export default MetricsCardsUnoptimized;