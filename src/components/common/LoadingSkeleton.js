import React from 'react';
import './LoadingSkeleton.css';

/**
 * LoadingSkeleton Component
 * Module 2, Lesson 4: UI Polish and Animations
 * Provides smooth loading states with shimmer effects
 */

// Card skeleton for session/metric cards
export const CardSkeleton = ({ count = 1, className = '' }) => {
  return (
    <div className={`skeleton-container ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`skeleton-card stagger-${index + 1}`}>
          <div className="skeleton-header">
            <div className="skeleton-title"></div>
            <div className="skeleton-badge"></div>
          </div>
          <div className="skeleton-content">
            <div className="skeleton-line"></div>
            <div className="skeleton-line short"></div>
          </div>
          <div className="skeleton-footer">
            <div className="skeleton-bar"></div>
            <div className="skeleton-bar"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Chart skeleton for data visualizations
export const ChartSkeleton = ({ height = 350, className = '' }) => {
  return (
    <div className={`skeleton-chart ${className}`} style={{ height }}>
      <div className="skeleton-chart-header">
        <div className="skeleton-title"></div>
        <div className="skeleton-legend"></div>
      </div>
      <div className="skeleton-chart-body">
        <div className="skeleton-axis-y"></div>
        <div className="skeleton-bars">
          {Array.from({ length: 5 }).map((_, index) => (
            <div 
              key={index} 
              className={`skeleton-bar-item stagger-${index + 1}`}
              style={{ height: `${Math.random() * 60 + 30}%` }}
            >
              <div className="skeleton-bar-fill"></div>
              <div className="skeleton-bar-label"></div>
            </div>
          ))}
        </div>
        <div className="skeleton-axis-x"></div>
      </div>
    </div>
  );
};

// Table skeleton for list views
export const TableSkeleton = ({ rows = 5, columns = 4, className = '' }) => {
  return (
    <div className={`skeleton-table ${className}`}>
      <div className="skeleton-table-header">
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className="skeleton-th"></div>
        ))}
      </div>
      <div className="skeleton-table-body">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className={`skeleton-table-row stagger-${rowIndex + 1}`}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="skeleton-td"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Metric skeleton for dashboard metrics
export const MetricSkeleton = ({ count = 4, className = '' }) => {
  return (
    <div className={`skeleton-metrics ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`skeleton-metric stagger-${index + 1}`}>
          <div className="skeleton-metric-icon"></div>
          <div className="skeleton-metric-content">
            <div className="skeleton-metric-label"></div>
            <div className="skeleton-metric-value"></div>
            <div className="skeleton-metric-trend"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Text skeleton for paragraphs
export const TextSkeleton = ({ lines = 3, className = '' }) => {
  return (
    <div className={`skeleton-text ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div 
          key={index} 
          className={`skeleton-line ${index === lines - 1 ? 'short' : ''}`}
        ></div>
      ))}
    </div>
  );
};

// Avatar skeleton for user profiles
export const AvatarSkeleton = ({ size = 'medium', className = '' }) => {
  return (
    <div className={`skeleton-avatar skeleton-avatar-${size} ${className}`}>
      <div className="skeleton-avatar-circle"></div>
      <div className="skeleton-avatar-text">
        <div className="skeleton-line"></div>
        <div className="skeleton-line short"></div>
      </div>
    </div>
  );
};

// Loading wrapper with optional message
export const LoadingWrapper = ({ 
  loading, 
  children, 
  skeleton = <CardSkeleton />,
  message = 'Loading...',
  showMessage = false 
}) => {
  if (loading) {
    return (
      <div className="loading-wrapper">
        {skeleton}
        {showMessage && (
          <div className="loading-message">
            <span className="loading-spinner"></span>
            <span>{message}</span>
          </div>
        )}
      </div>
    );
  }
  
  return children;
};

export default LoadingWrapper;