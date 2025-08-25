import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import usePerformanceMonitor from '../../hooks/usePerformanceMonitor';
import './PerformanceHistory.css';

/**
 * PerformanceHistory Component
 * Visual representation of performance metrics over time
 * Module 3: Performance Optimization
 */
const PerformanceHistory = ({ componentName = 'App', maxDataPoints = 30 }) => {
  const { metrics, getPerformanceRating } = usePerformanceMonitor(componentName);
  const [historyData, setHistoryData] = useState([]);
  const [chartType, setChartType] = useState('line');
  const [isMonitoring, setIsMonitoring] = useState(true);
  
  // Collect performance data over time
  useEffect(() => {
    if (!isMonitoring) return;
    
    const interval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString();
      const newDataPoint = {
        time: timestamp,
        fps: metrics.fps,
        renderTime: metrics.renderTime,
        memory: metrics.memoryUsage,
        longTasks: metrics.longTaskCount
      };
      
      setHistoryData(prev => {
        const updated = [...prev, newDataPoint];
        // Keep only the last maxDataPoints
        if (updated.length > maxDataPoints) {
          updated.shift();
        }
        return updated;
      });
    }, 2000); // Update every 2 seconds
    
    return () => clearInterval(interval);
  }, [metrics, maxDataPoints, isMonitoring]);
  
  // Calculate summary statistics
  const stats = useMemo(() => {
    if (historyData.length === 0) {
      return {
        avgFps: 0,
        avgRenderTime: 0,
        avgMemory: 0,
        maxRenderTime: 0,
        minFps: 0,
        trend: 'stable'
      };
    }
    
    const fpsValues = historyData.map(d => d.fps).filter(v => v > 0);
    const renderTimes = historyData.map(d => d.renderTime).filter(v => v > 0);
    const memoryValues = historyData.map(d => d.memory).filter(v => v > 0);
    
    // Calculate trend (comparing last 5 values to previous 5)
    let trend = 'stable';
    if (renderTimes.length >= 10) {
      const recent = renderTimes.slice(-5).reduce((a, b) => a + b, 0) / 5;
      const previous = renderTimes.slice(-10, -5).reduce((a, b) => a + b, 0) / 5;
      if (recent > previous * 1.2) trend = 'degrading';
      else if (recent < previous * 0.8) trend = 'improving';
    }
    
    return {
      avgFps: fpsValues.length > 0 ? Math.round(fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length) : 0,
      avgRenderTime: renderTimes.length > 0 ? Math.round(renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length * 100) / 100 : 0,
      avgMemory: memoryValues.length > 0 ? Math.round(memoryValues.reduce((a, b) => a + b, 0) / memoryValues.length) : 0,
      maxRenderTime: renderTimes.length > 0 ? Math.max(...renderTimes) : 0,
      minFps: fpsValues.length > 0 ? Math.min(...fpsValues) : 0,
      trend
    };
  }, [historyData]);
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="performance-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="tooltip-entry" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}${
                entry.dataKey === 'fps' ? ' fps' : 
                entry.dataKey === 'renderTime' ? 'ms' : 
                entry.dataKey === 'memory' ? ' MB' : ''
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  // Render the appropriate chart
  const renderChart = () => {
    if (historyData.length === 0) {
      return (
        <div className="chart-empty">
          <p>Collecting performance data...</p>
        </div>
      );
    }
    
    const ChartComponent = chartType === 'area' ? AreaChart : LineChart;
    const DataComponent = chartType === 'area' ? Area : Line;
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <ChartComponent data={historyData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis 
            dataKey="time" 
            stroke="var(--text-secondary)"
            tick={{ fontSize: 11 }}
          />
          <YAxis 
            stroke="var(--text-secondary)"
            tick={{ fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          <DataComponent
            type="monotone"
            dataKey="fps"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={chartType === 'area' ? 0.3 : 1}
            strokeWidth={2}
            name="FPS"
            dot={false}
          />
          
          <DataComponent
            type="monotone"
            dataKey="renderTime"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={chartType === 'area' ? 0.3 : 1}
            strokeWidth={2}
            name="Render Time"
            dot={false}
          />
          
          <DataComponent
            type="monotone"
            dataKey="memory"
            stroke="#f59e0b"
            fill="#f59e0b"
            fillOpacity={chartType === 'area' ? 0.3 : 1}
            strokeWidth={2}
            name="Memory"
            dot={false}
          />
          
          {metrics.longTaskCount > 0 && (
            <DataComponent
              type="monotone"
              dataKey="longTasks"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={chartType === 'area' ? 0.3 : 1}
              strokeWidth={2}
              name="Long Tasks"
              dot={false}
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    );
  };
  
  const rating = getPerformanceRating();
  
  return (
    <div className="performance-history">
      <div className="history-header">
        <h3 className="history-title">
          Performance History - {componentName}
        </h3>
        
        <div className="history-controls">
          <button
            className={`control-btn ${isMonitoring ? 'active' : ''}`}
            onClick={() => setIsMonitoring(!isMonitoring)}
          >
            {isMonitoring ? '⏸️ Pause' : '▶️ Resume'}
          </button>
          
          <button
            className="control-btn"
            onClick={() => setHistoryData([])}
          >
            🔄 Clear
          </button>
          
          <div className="chart-type-toggle">
            <button
              className={`toggle-btn ${chartType === 'line' ? 'active' : ''}`}
              onClick={() => setChartType('line')}
            >
              Line
            </button>
            <button
              className={`toggle-btn ${chartType === 'area' ? 'active' : ''}`}
              onClick={() => setChartType('area')}
            >
              Area
            </button>
          </div>
        </div>
      </div>
      
      {/* Summary Statistics */}
      <div className="history-stats">
        <div className="stat-card">
          <span className="stat-label">Avg FPS</span>
          <span className="stat-value" style={{ color: stats.avgFps >= 50 ? '#10b981' : '#f59e0b' }}>
            {stats.avgFps}
          </span>
        </div>
        
        <div className="stat-card">
          <span className="stat-label">Avg Render</span>
          <span className="stat-value" style={{ color: stats.avgRenderTime <= 16 ? '#10b981' : '#f59e0b' }}>
            {stats.avgRenderTime}ms
          </span>
        </div>
        
        <div className="stat-card">
          <span className="stat-label">Avg Memory</span>
          <span className="stat-value">
            {stats.avgMemory} MB
          </span>
        </div>
        
        <div className="stat-card">
          <span className="stat-label">Max Render</span>
          <span className="stat-value" style={{ color: stats.maxRenderTime <= 50 ? '#10b981' : '#ef4444' }}>
            {stats.maxRenderTime}ms
          </span>
        </div>
        
        <div className="stat-card">
          <span className="stat-label">Performance</span>
          <span 
            className="stat-value performance-badge"
            style={{ backgroundColor: rating.color }}
          >
            {rating.level}
          </span>
        </div>
        
        <div className="stat-card">
          <span className="stat-label">Trend</span>
          <span className={`stat-value trend-${stats.trend}`}>
            {stats.trend === 'improving' ? '📈' : stats.trend === 'degrading' ? '📉' : '➡️'} {stats.trend}
          </span>
        </div>
      </div>
      
      {/* Performance Chart */}
      <div className="history-chart">
        {renderChart()}
      </div>
      
      {/* Current Metrics Summary */}
      <div className="current-metrics">
        <h4>Current Performance Metrics</h4>
        <div className="metrics-grid">
          <div className="metric-item">
            <span className="metric-label">Render History:</span>
            <span className="metric-value">
              Min: {metrics.minRenderTime}ms | Max: {metrics.maxRenderTime}ms
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Memory Usage:</span>
            <span className="metric-value">
              {metrics.memoryUsage} / {metrics.memoryLimit} MB ({Math.round((metrics.memoryUsage / metrics.memoryLimit) * 100)}%)
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Update Count:</span>
            <span className="metric-value">{metrics.updateCount} renders</span>
          </div>
          {metrics.longTaskCount > 0 && (
            <div className="metric-item warning">
              <span className="metric-label">⚠️ Long Tasks:</span>
              <span className="metric-value">{metrics.longTaskCount} detected</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(PerformanceHistory);