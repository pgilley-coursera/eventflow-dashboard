import React, { useMemo, memo, useState, useCallback, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';
import './AttendanceChart.css';
import usePerformanceMonitor from '../../hooks/usePerformanceMonitor';

const COLORS = ['#667eea', '#764ba2', '#3b82f6', '#10b981', '#f59e0b'];

// Custom label component for bar tops
const CustomLabel = (props) => {
  const { x, y, width, value } = props;
  if (value > 0) {
    return (
      <text 
        x={x + width / 2} 
        y={y - 5} 
        fill="var(--text-secondary)" 
        textAnchor="middle"
        fontSize="11"
        fontWeight="600"
      >
        {value}
      </text>
    );
  }
  return null;
};

// Memoized tooltip component to prevent re-renders
const CustomTooltip = memo(({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-tooltip animated">
        <p className="tooltip-label">{label}</p>
        <div className="tooltip-stats">
          <div className="stat-row">
            <span className="stat-icon">👥</span>
            <span className="stat-label">Attendance:</span>
            <span className="stat-value">{payload[0].value}</span>
          </div>
          {data.capacity && (
            <div className="stat-row">
              <span className="stat-icon">📊</span>
              <span className="stat-label">Capacity:</span>
              <span className="stat-value">{data.capacity}</span>
            </div>
          )}
          {data.rate && (
            <div className="stat-row">
              <span className="stat-icon">📈</span>
              <span className="stat-label">Fill Rate:</span>
              <span className="stat-value rate">{data.rate}%</span>
            </div>
          )}
          {data.speaker && (
            <div className="stat-row">
              <span className="stat-icon">🎤</span>
              <span className="stat-label">Speaker:</span>
              <span className="stat-value">{data.speaker}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
});

// Main chart component optimized with memo
const AttendanceChart = memo(({ data = [], loading = false, title = "Most Popular Sessions" }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [animationBegin, setAnimationBegin] = useState(0);
  const [isAnimated, setIsAnimated] = useState(false);
  
  // Performance monitoring
  const { markRenderStart, markRenderEnd } = usePerformanceMonitor('AttendanceChart');
  
  // Track render performance
  useEffect(() => {
    markRenderStart();
    return () => {
      markRenderEnd();
    };
  });
  
  // Trigger staggered animation when data changes
  useEffect(() => {
    if (data && data.length > 0 && !isAnimated) {
      const timer = setTimeout(() => {
        setAnimationBegin(0);
        setIsAnimated(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [data, isAnimated]);
  
  // Memoize chart data processing
  const chartData = useMemo(() => {
    performance.mark('chart-data-processing-start');
    if (!data || data.length === 0) return [];
    
    // Take top 10 sessions and format for chart
    const result = data.slice(0, 10).map(item => ({
      ...item,
      name: item.name || item.title,
      attendance: item.attendance || item.currentAttendance || 0,
      capacity: item.capacity || 100,
      rate: item.rate || item.attendanceRate || 0,
      speaker: item.speaker || 'Unknown Speaker'
    }));
    
    performance.mark('chart-data-processing-end');
    performance.measure('chart-data-processing', 'chart-data-processing-start', 'chart-data-processing-end');
    
    return result;
  }, [data]);

  // Handle bar click
  const handleBarClick = useCallback((data, index) => {
    setActiveIndex(index === activeIndex ? null : index);
  }, [activeIndex]);

  // Handle mouse enter/leave for hover effects
  const handleMouseEnter = useCallback((data, index) => {
    setActiveIndex(index);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setActiveIndex(null);
  }, []);

  if (loading) {
    return (
      <div className="chart-container">
        <div className="chart-header">
          <h3>{title}</h3>
        </div>
        <div className="chart-loading">
          <div className="loading-spinner"></div>
          <p>Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-header">
          <h3>{title}</h3>
        </div>
        <div className="chart-empty">
          <p>No data available</p>
        </div>
      </div>
    );
  }

  // Use the memoized chartData from above

  return (
    <div className="chart-container enhanced" role="img" aria-label={`Bar chart showing ${title}`}>
      <div className="chart-header">
        <h3>{title}</h3>
        <div className="chart-controls">
          <div className="chart-legend">
            <span className="legend-item">
              <span className="legend-color" style={{ background: 'var(--gradient-primary)' }}></span>
              Attendance
            </span>
          </div>
          <div className="chart-info">
            {activeIndex !== null && chartData[activeIndex] && (
              <span className="active-session">
                Selected: {chartData[activeIndex].name}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={chartData}
            margin={{ top: 30, right: 30, left: 20, bottom: 80 }}
            onMouseLeave={handleMouseLeave}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="var(--border-color)" 
              strokeOpacity={0.3}
            />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
              interval={0}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
              label={{ 
                value: 'Number of Attendees', 
                angle: -90, 
                position: 'insideLeft',
                style: { fill: 'var(--text-secondary)', fontSize: 12 }
              }}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(102, 126, 234, 0.1)' }}
            />
            <Bar 
              dataKey="attendance" 
              radius={[8, 8, 0, 0]}
              animationBegin={animationBegin}
              animationDuration={2000}
              animationEasing="ease-out"
              onClick={handleBarClick}
              onMouseEnter={handleMouseEnter}
            >
              <LabelList 
                dataKey="attendance" 
                position="top" 
                content={<CustomLabel />}
                animationBegin={animationBegin + 500}
                animationDuration={1000}
              />
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === activeIndex 
                    ? `url(#highlightGradient)` 
                    : COLORS[index % COLORS.length]}
                  fillOpacity={activeIndex === null || index === activeIndex ? 1 : 0.6}
                  style={{
                    filter: index === activeIndex ? 'brightness(1.1)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    animationDelay: `${index * 100}ms`
                  }}
                />
              ))}
            </Bar>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#667eea" stopOpacity={1} />
                <stop offset="100%" stopColor="#764ba2" stopOpacity={1} />
              </linearGradient>
              <linearGradient id="highlightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f093fb" stopOpacity={1} />
                <stop offset="100%" stopColor="#f5576c" stopOpacity={1} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="chart-summary">
        <div className="summary-stat">
          <span className="stat-label">Total Sessions:</span>
          <span className="stat-value">{chartData.length}</span>
        </div>
        <div className="summary-stat">
          <span className="stat-label">Total Attendance:</span>
          <span className="stat-value">
            {chartData.reduce((sum, item) => sum + item.attendance, 0)}
          </span>
        </div>
        <div className="summary-stat">
          <span className="stat-label">Average Fill Rate:</span>
          <span className="stat-value">
            {Math.round(chartData.reduce((sum, item) => sum + (item.rate || 0), 0) / chartData.length)}%
          </span>
        </div>
      </div>
    </div>
  );
});

export default AttendanceChart;