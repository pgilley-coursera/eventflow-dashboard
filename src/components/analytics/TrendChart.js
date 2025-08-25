import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import './TrendChart.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="tooltip-value" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const TrendChart = ({ 
  data = [], 
  loading = false, 
  title = "Attendance Throughout Day",
  type = "line" 
}) => {
  if (loading) {
    return (
      <div className="trend-chart-container">
        <div className="chart-header">
          <h3>{title}</h3>
        </div>
        <div className="chart-loading">
          <div className="loading-spinner"></div>
          <p>Loading trend data...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="trend-chart-container">
        <div className="chart-header">
          <h3>{title}</h3>
        </div>
        <div className="chart-empty">
          <p>No trend data available</p>
        </div>
      </div>
    );
  }

  const ChartComponent = type === 'area' ? AreaChart : LineChart;
  const DataComponent = type === 'area' ? Area : Line;

  return (
    <div className="trend-chart-container" role="img" aria-label={`Line chart showing ${title}`}>
      <div className="chart-header">
        <h3>{title}</h3>
        <div className="chart-legend">
          <span className="legend-item">
            <span className="legend-color attendance"></span>
            Attendance
          </span>
          {data[0]?.avgEngagement !== undefined && (
            <span className="legend-item">
              <span className="legend-color engagement"></span>
              Engagement
            </span>
          )}
        </div>
      </div>
      
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <ChartComponent
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <defs>
              <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
              label={{ 
                value: 'Count', 
                angle: -90, 
                position: 'insideLeft',
                style: { fill: 'var(--text-secondary)' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {type === 'area' ? (
              <>
                <Area
                  type="monotone"
                  dataKey="attendance"
                  stroke="#3b82f6"
                  fill="url(#attendanceGradient)"
                  strokeWidth={2}
                  animationDuration={1000}
                  name="Attendance"
                />
                {data[0]?.avgEngagement !== undefined && (
                  <Area
                    type="monotone"
                    dataKey="avgEngagement"
                    stroke="#10b981"
                    fill="url(#engagementGradient)"
                    strokeWidth={2}
                    animationDuration={1200}
                    name="Avg Engagement"
                  />
                )}
              </>
            ) : (
              <>
                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                  animationDuration={1000}
                  name="Attendance"
                />
                {data[0]?.avgEngagement !== undefined && (
                  <Line
                    type="monotone"
                    dataKey="avgEngagement"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                    animationDuration={1200}
                    name="Avg Engagement"
                  />
                )}
              </>
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </div>
      
      {data.length > 0 && (
        <div className="chart-summary">
          <div className="summary-item">
            <span className="summary-label">Peak Time:</span>
            <span className="summary-value">
              {data.reduce((max, item) => 
                item.attendance > max.attendance ? item : max
              ).time}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Sessions:</span>
            <span className="summary-value">
              {data.reduce((sum, item) => sum + (item.sessions || 0), 0)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendChart;