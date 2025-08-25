import React from 'react';
import AnimatedCounter, { PercentageCounter } from './AnimatedCounter';
import './MetricsCards.css';

const MetricCard = ({ title, value, icon, trend, color, description, isPercentage = false, delay = 0 }) => {
  return (
    <div className={`metric-card ${color}`} role="article" aria-label={`${title}: ${value}`}>
      <div className="metric-card-header">
        <span className="metric-icon" aria-hidden="true">{icon}</span>
        <span className="metric-title">{title}</span>
      </div>
      <div className="metric-value">
        {isPercentage ? (
          <PercentageCounter 
            value={value} 
            duration={1500}
            delay={delay}
            className="large gradient"
          />
        ) : (
          <AnimatedCounter 
            value={value}
            duration={1500}
            delay={delay}
            separator=","
            className="large gradient"
          />
        )}
      </div>
      {description && (
        <div className="metric-description">{description}</div>
      )}
      {trend && (
        <div className={`metric-trend ${trend.direction}`}>
          <span className="trend-icon" aria-hidden="true">
            {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}
          </span>
          <span className="trend-value">{trend.value}</span>
        </div>
      )}
    </div>
  );
};

const MetricsCards = ({ metrics, loading = false }) => {
  if (loading) {
    return (
      <div className="metrics-container">
        <div className="metrics-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="metric-card loading">
              <div className="skeleton skeleton-header"></div>
              <div className="skeleton skeleton-value"></div>
              <div className="skeleton skeleton-trend"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const cards = [
    {
      title: 'Active Sessions',
      value: metrics?.activeSessions || 0,
      icon: '🎯',
      color: 'metric-primary',
      description: 'Currently running',
      trend: metrics?.sessionsTrend,
      isPercentage: false,
      delay: 0
    },
    {
      title: 'Total Attendees',
      value: metrics?.totalAttendees || 0,
      icon: '👥',
      color: 'metric-success',
      description: 'Registered participants',
      trend: metrics?.attendeesTrend,
      isPercentage: false,
      delay: 200
    },
    {
      title: 'Avg Engagement',
      value: metrics?.avgEngagement || 0,
      icon: '📊',
      color: 'metric-info',
      description: 'Participant interaction',
      trend: metrics?.engagementTrend,
      isPercentage: true,
      delay: 400
    },
    {
      title: 'Avg Rating',
      value: metrics?.avgRating || 0,
      icon: '⭐',
      color: 'metric-warning',
      description: 'Session feedback',
      trend: metrics?.ratingTrend,
      isPercentage: false,
      delay: 600
    }
  ];

  return (
    <section className="metrics-container" aria-label="Event Metrics">
      <div className="metrics-grid">
        {cards.map((card, index) => (
          <MetricCard key={index} {...card} />
        ))}
      </div>
    </section>
  );
};

export default MetricsCards;