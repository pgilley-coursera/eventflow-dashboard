import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import '../components/analytics/AttendanceChart.css';

const AttendanceChartUnoptimized = ({ sessions = [], loading = false }) => {
  const [chartData, setChartData] = useState([]);
  const [animationData, setAnimationData] = useState([]);
  
  // PERFORMANCE ISSUE: Heavy calculations on every render without memoization
  const processChartData = () => {
    console.log('Processing chart data - runs on EVERY render and update');
    
    // PERFORMANCE ISSUE: Synchronous heavy operation blocking the main thread
    const startTime = performance.now();
    
    // Simulate expensive calculation with unnecessary iterations
    let processedData = [];
    for (let i = 0; i < 1000; i++) {
      // PERFORMANCE ISSUE: Unnecessary repeated calculations
      const sorted = [...sessions].sort((a, b) => b.currentAttendance - a.currentAttendance);
      if (i === 999) {
        processedData = sorted.slice(0, 10).map(session => ({
          name: session.title.length > 20 ? session.title.substring(0, 20) + '...' : session.title,
          attendance: session.currentAttendance,
          capacity: session.capacity,
          rate: session.attendanceRate,
          speaker: session.speaker,
          engagement: session.engagement
        }));
      }
    }
    
    const endTime = performance.now();
    console.log(`Chart data processing took ${endTime - startTime}ms`);
    
    return processedData;
  };
  
  // PERFORMANCE ISSUE: useEffect running on every render due to missing dependencies
  useEffect(() => {
    const data = processChartData();
    setChartData(data);
    
    // PERFORMANCE ISSUE: Creating animation interval without cleanup
    const interval = setInterval(() => {
      // PERFORMANCE ISSUE: Updating state frequently causing re-renders
      setAnimationData(prev => [...prev, new Date().toISOString()]);
    }, 100); // Updates every 100ms!
    
    // MISSING: No cleanup for interval
  }); // PERFORMANCE ISSUE: No dependency array, runs on every render
  
  // PERFORMANCE ISSUE: Creating new function on every render
  const getBarColor = (rate) => {
    if (rate >= 80) return '#10b981';
    if (rate >= 60) return '#f59e0b';
    return '#ef4444';
  };
  
  // PERFORMANCE ISSUE: Custom tooltip recreated on every render
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      // PERFORMANCE ISSUE: Complex calculations in render
      const averageEngagement = sessions.reduce((acc, s) => acc + s.engagement, 0) / sessions.length;
      const percentageAboveAverage = ((data.engagement - averageEngagement) / averageEngagement * 100).toFixed(2);
      
      return (
        <div className="custom-tooltip">
          <p className="tooltip-title">{label}</p>
          <p className="tooltip-content">
            <span>Attendance:</span> {data.attendance}/{data.capacity}
          </p>
          <p className="tooltip-content">
            <span>Fill Rate:</span> {data.rate}%
          </p>
          <p className="tooltip-content">
            <span>Speaker:</span> {data.speaker}
          </p>
          <p className="tooltip-content">
            <span>Engagement:</span> {data.engagement}%
          </p>
          <p className="tooltip-content">
            <span>vs Average:</span> {percentageAboveAverage}%
          </p>
        </div>
      );
    }
    return null;
  };
  
  if (loading) {
    return (
      <div className="attendance-chart-container">
        <div className="chart-header">
          <h3>Most Popular Sessions (Unoptimized)</h3>
          <span className="chart-subtitle">Top 10 by attendance</span>
        </div>
        <div className="chart-loading">
          <div className="skeleton skeleton-chart"></div>
        </div>
      </div>
    );
  }
  
  // PERFORMANCE ISSUE: Complex render calculations
  const totalCapacity = chartData.reduce((acc, d) => acc + d.capacity, 0);
  const totalAttendance = chartData.reduce((acc, d) => acc + d.attendance, 0);
  const overallRate = totalCapacity > 0 ? ((totalAttendance / totalCapacity) * 100).toFixed(1) : 0;
  
  return (
    <div className="attendance-chart-container">
      <div className="chart-header">
        <h3>Most Popular Sessions (Unoptimized)</h3>
        <span className="chart-subtitle">Top 10 by attendance</span>
      </div>
      
      <div className="chart-summary">
        <div className="summary-item">
          <span className="summary-label">Overall Fill Rate:</span>
          <span className="summary-value">{overallRate}%</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Total Attendees:</span>
          <span className="summary-value">{totalAttendance}</span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <BarChart 
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
        >
          <defs>
            {/* PERFORMANCE ISSUE: Creating gradients for each data point */}
            {chartData.map((entry, index) => (
              <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={getBarColor(entry.rate)} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={getBarColor(entry.rate)} stopOpacity={0.3}/>
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            label={{ value: 'Attendance', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="attendance" name="Current Attendance" animationDuration={2000}>
            {/* PERFORMANCE ISSUE: Creating Cell components without memoization */}
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {/* Debug info showing performance issues */}
      <div style={{ fontSize: '10px', marginTop: '10px', opacity: 0.5 }}>
        Animation updates: {animationData.length} | 
        Last render: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default AttendanceChartUnoptimized;