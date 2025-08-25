import React from 'react';
import usePerformanceMonitor from '../../hooks/usePerformanceMonitor';
import './PerformanceDisplay.css';

/**
 * PerformanceDisplay Component
 * Real-time performance metrics display for footer
 * Module 3: Performance Optimization
 */
const PerformanceDisplay = ({ componentName = 'App' }) => {
  const { metrics, getPerformanceRating } = usePerformanceMonitor(componentName);
  const rating = getPerformanceRating();
  
  // Format memory display
  const formatMemory = (bytes) => {
    if (bytes === 0) return '0 MB';
    return `${bytes} MB`;
  };
  
  // Format render time display
  const formatRenderTime = (time) => {
    if (time === 0) return '0ms';
    if (time === Infinity) return '--';
    return `${time}ms`;
  };
  
  // Get status color based on value
  const getStatusColor = (metric, value) => {
    switch (metric) {
      case 'fps':
        if (value >= 50) return 'var(--color-success)';
        if (value >= 30) return 'var(--color-warning)';
        return 'var(--color-danger)';
      case 'renderTime':
        if (value <= 16) return 'var(--color-success)';
        if (value <= 50) return 'var(--color-warning)';
        return 'var(--color-danger)';
      case 'memory':
        const percentage = (value / metrics.memoryLimit) * 100;
        if (percentage <= 50) return 'var(--color-success)';
        if (percentage <= 75) return 'var(--color-warning)';
        return 'var(--color-danger)';
      default:
        return 'var(--text-secondary)';
    }
  };
  
  return (
    <div className="performance-display">
      {/* Main Metrics */}
      <div className="performance-metrics">
        {/* FPS Metric */}
        <div 
          className="performance-metric"
          title={`Frames Per Second: ${metrics.fps}`}
        >
          <span className="metric-label">FPS:</span>
          <span 
            className="metric-value"
            style={{ color: getStatusColor('fps', metrics.fps) }}
          >
            {metrics.fps || '--'}
          </span>
        </div>
        
        {/* Render Time Metric */}
        <div 
          className="performance-metric"
          title={`Current: ${formatRenderTime(metrics.renderTime)} | Avg: ${formatRenderTime(metrics.avgRenderTime)}`}
        >
          <span className="metric-label">Render:</span>
          <span 
            className="metric-value"
            style={{ color: getStatusColor('renderTime', metrics.renderTime) }}
          >
            {formatRenderTime(metrics.renderTime)}
          </span>
          {metrics.avgRenderTime > 0 && (
            <span className="metric-avg">
              (avg: {formatRenderTime(metrics.avgRenderTime)})
            </span>
          )}
        </div>
        
        {/* Memory Metric */}
        <div 
          className="performance-metric"
          title={`Used: ${formatMemory(metrics.memoryUsage)} / Total: ${formatMemory(metrics.totalMemory)} / Limit: ${formatMemory(metrics.memoryLimit)}`}
        >
          <span className="metric-label">Memory:</span>
          <span 
            className="metric-value"
            style={{ color: getStatusColor('memory', metrics.memoryUsage) }}
          >
            {formatMemory(metrics.memoryUsage)}
          </span>
          {metrics.memoryLimit > 0 && (
            <span className="metric-percentage">
              ({Math.round((metrics.memoryUsage / metrics.memoryLimit) * 100)}%)
            </span>
          )}
        </div>
        
        {/* Update Count */}
        <div 
          className="performance-metric"
          title={`Component updates: ${metrics.updateCount}`}
        >
          <span className="metric-label">Updates:</span>
          <span className="metric-value">
            {metrics.updateCount}
          </span>
        </div>
        
        {/* Long Tasks */}
        {metrics.longTaskCount > 0 && (
          <div 
            className="performance-metric warning"
            title={`Long tasks blocking main thread: ${metrics.longTaskCount}`}
          >
            <span className="metric-label">⚠️ Long Tasks:</span>
            <span className="metric-value">
              {metrics.longTaskCount}
            </span>
          </div>
        )}
      </div>
      
      {/* Performance Rating */}
      <div 
        className="performance-rating"
        style={{ backgroundColor: rating.color }}
        title={`Performance: ${rating.level}`}
      >
        <span className="rating-label">Performance:</span>
        <span className="rating-value">{rating.level}</span>
      </div>
      
      {/* Mini Sparkline for render history */}
      {metrics.renderHistory && metrics.renderHistory.length > 0 && (
        <div className="performance-sparkline" title="Render time history">
          <svg width="60" height="20" viewBox="0 0 60 20">
            <polyline
              fill="none"
              stroke={getStatusColor('renderTime', metrics.avgRenderTime)}
              strokeWidth="1"
              points={
                metrics.renderHistory.map((time, i) => {
                  const x = (i / (metrics.renderHistory.length - 1)) * 60;
                  const maxTime = Math.max(...metrics.renderHistory, 100);
                  const y = 20 - (time / maxTime) * 20;
                  return `${x},${y}`;
                }).join(' ')
              }
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default React.memo(PerformanceDisplay);