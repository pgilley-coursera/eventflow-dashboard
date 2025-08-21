import React, { useMemo, useState } from 'react';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import './SpeakerComparison.css';

/**
 * SpeakerComparison Component
 * 
 * Provides comparative analysis of speaker performance across multiple metrics
 * using interactive radar and bar charts. This helps identify top performers
 * and areas for improvement.
 * 
 * Features:
 * - Radar chart for multi-dimensional comparison
 * - Bar chart for direct metric comparison
 * - Toggle between different chart types
 * - Interactive tooltips with detailed stats
 * - Top performer highlighting
 */
const SpeakerComparison = ({ speakers = [], sessions = [], loading = false }) => {
  const [chartType, setChartType] = useState('radar');
  const [selectedMetric, setSelectedMetric] = useState('overall');

  // Process speaker data for visualization
  const chartData = useMemo(() => {
    if (!speakers || speakers.length === 0 || !sessions || sessions.length === 0) {
      return null;
    }

    // Calculate metrics for each speaker
    const speakerMetrics = speakers.slice(0, 8).map(speaker => {
      const speakerSessions = sessions.filter(s => s.speaker === speaker.name);
      
      if (speakerSessions.length === 0) {
        return null;
      }

      // Calculate average metrics
      const avgEngagement = Math.round(
        speakerSessions.reduce((sum, s) => sum + (s.engagement || 0), 0) / speakerSessions.length
      );
      
      const avgAttendanceRate = Math.round(
        speakerSessions.reduce((sum, s) => {
          const rate = s.capacity > 0 ? (s.currentAttendance / s.capacity) * 100 : 0;
          return sum + rate;
        }, 0) / speakerSessions.length
      );
      
      const totalAttendance = speakerSessions.reduce((sum, s) => sum + (s.currentAttendance || 0), 0);
      
      const avgRating = speaker.rating || 
        (speakerSessions[0]?.averageRating || Math.random() * 2 + 3);
      
      const feedbackCount = speakerSessions.reduce((sum, s) => sum + (s.feedbackCount || 0), 0);

      return {
        name: speaker.name,
        shortName: speaker.name.split(' ').map(n => n[0]).join(''),
        engagement: avgEngagement,
        attendance: avgAttendanceRate,
        rating: Math.round(avgRating * 20), // Convert 5-star to 100 scale
        experience: Math.min(100, speaker.experience || 80),
        interaction: Math.min(100, Math.round(feedbackCount * 10)),
        overall: Math.round((avgEngagement + avgAttendanceRate + (avgRating * 20)) / 3),
        totalAttendance,
        sessionCount: speakerSessions.length
      };
    }).filter(Boolean);

    // Sort by selected metric
    const sorted = [...speakerMetrics].sort((a, b) => {
      switch (selectedMetric) {
        case 'engagement': return b.engagement - a.engagement;
        case 'attendance': return b.attendance - a.attendance;
        case 'rating': return b.rating - a.rating;
        case 'overall':
        default:
          return b.overall - a.overall;
      }
    });

    // Prepare radar chart data
    const radarData = [
      { metric: 'Engagement', fullMark: 100 },
      { metric: 'Attendance', fullMark: 100 },
      { metric: 'Rating', fullMark: 100 },
      { metric: 'Experience', fullMark: 100 },
      { metric: 'Interaction', fullMark: 100 }
    ];

    // Add speaker values to radar data
    sorted.slice(0, 5).forEach((speaker, index) => {
      const color = ['#667eea', '#764ba2', '#f093fb', '#fda4af', '#86efac'][index];
      radarData.forEach(point => {
        const metricKey = point.metric.toLowerCase();
        point[speaker.name] = speaker[metricKey] || 0;
        point[`${speaker.name}Color`] = color;
      });
    });

    return {
      radarData,
      barData: sorted,
      topPerformers: sorted.slice(0, 3),
      metrics: ['overall', 'engagement', 'attendance', 'rating']
    };
  }, [speakers, sessions, selectedMetric]);

  // Custom tooltip for bar chart
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-title">{label}</p>
          <div className="tooltip-content">
            <div>Engagement: {data.engagement}%</div>
            <div>Attendance: {data.attendance}%</div>
            <div>Rating: {(data.rating / 20).toFixed(1)} ⭐</div>
            <div>Sessions: {data.sessionCount}</div>
            <div>Total Attendees: {data.totalAttendance}</div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for radar chart
  const CustomRadarTooltip = ({ active, payload }) => {
    if (active && payload && payload[0]) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-title">{payload[0].payload.metric}</p>
          <div className="tooltip-content">
            {payload.map((entry, index) => (
              <div key={index} style={{ color: entry.color }}>
                {entry.name}: {entry.value}%
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="speaker-comparison-container">
        <div className="comparison-loading">
          <div className="loading-spinner"></div>
          <p>Loading speaker comparison data...</p>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="speaker-comparison-container">
        <div className="comparison-empty">
          <p>No speaker data available for comparison</p>
        </div>
      </div>
    );
  }

  const { radarData, barData, topPerformers } = chartData;

  return (
    <div className="speaker-comparison-container">
      <div className="comparison-header">
        <div className="header-info">
          <h3>Speaker Performance Comparison</h3>
          <p className="comparison-subtitle">
            Comparative analysis across multiple performance dimensions
          </p>
        </div>
        <div className="header-controls">
          <div className="chart-type-toggle">
            <button 
              className={chartType === 'radar' ? 'active' : ''}
              onClick={() => setChartType('radar')}
            >
              Radar View
            </button>
            <button 
              className={chartType === 'bar' ? 'active' : ''}
              onClick={() => setChartType('bar')}
            >
              Bar View
            </button>
          </div>
          {chartType === 'bar' && (
            <select 
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="metric-selector"
            >
              <option value="overall">Overall Score</option>
              <option value="engagement">Engagement</option>
              <option value="attendance">Attendance Rate</option>
              <option value="rating">Rating</option>
            </select>
          )}
        </div>
      </div>

      <div className="comparison-content">
        {/* Top Performers Panel */}
        <div className="top-performers">
          <h4>🏆 Top Performers</h4>
          <div className="performers-list">
            {topPerformers.map((speaker, index) => (
              <div key={speaker.name} className={`performer-card rank-${index + 1}`}>
                <div className="performer-rank">#{index + 1}</div>
                <div className="performer-info">
                  <div className="performer-name">{speaker.name}</div>
                  <div className="performer-score">
                    Overall: {speaker.overall}%
                  </div>
                </div>
                <div className="performer-metrics">
                  <div className="mini-metric">
                    <span className="metric-icon">📊</span>
                    <span>{speaker.engagement}%</span>
                  </div>
                  <div className="mini-metric">
                    <span className="metric-icon">👥</span>
                    <span>{speaker.attendance}%</span>
                  </div>
                  <div className="mini-metric">
                    <span className="metric-icon">⭐</span>
                    <span>{(speaker.rating / 20).toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart Area */}
        <div className="chart-area">
          {chartType === 'radar' ? (
            <div className="radar-chart-container">
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid 
                    gridType="polygon"
                    radialLines={true}
                  />
                  <PolarAngleAxis 
                    dataKey="metric"
                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                  />
                  <PolarRadiusAxis 
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                  />
                  {barData.slice(0, 5).map((speaker, index) => {
                    const colors = ['#667eea', '#764ba2', '#f093fb', '#fda4af', '#86efac'];
                    return (
                      <Radar
                        key={speaker.name}
                        name={speaker.name}
                        dataKey={speaker.name}
                        stroke={colors[index]}
                        fill={colors[index]}
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    );
                  })}
                  <Tooltip content={<CustomRadarTooltip />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="circle"
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="bar-chart-container">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart 
                  data={barData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis 
                    dataKey="shortName"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tick={{ fill: 'var(--text-secondary)' }}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#764ba2" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <Bar 
                    dataKey={selectedMetric}
                    fill="url(#colorGradient)"
                    radius={[8, 8, 0, 0]}
                    animationDuration={500}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Insights Panel */}
        <div className="comparison-insights">
          <h4>Performance Insights</h4>
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-icon">📈</div>
              <div className="insight-content">
                <div className="insight-label">Highest Engagement</div>
                <div className="insight-value">
                  {barData[0]?.name} ({barData[0]?.engagement}%)
                </div>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon">👥</div>
              <div className="insight-content">
                <div className="insight-label">Best Attendance</div>
                <div className="insight-value">
                  {[...barData].sort((a, b) => b.attendance - a.attendance)[0]?.name} 
                  ({[...barData].sort((a, b) => b.attendance - a.attendance)[0]?.attendance}%)
                </div>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon">⭐</div>
              <div className="insight-content">
                <div className="insight-label">Top Rated</div>
                <div className="insight-value">
                  {[...barData].sort((a, b) => b.rating - a.rating)[0]?.name} 
                  ({([...barData].sort((a, b) => b.rating - a.rating)[0]?.rating / 20).toFixed(1)} stars)
                </div>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon">🎯</div>
              <div className="insight-content">
                <div className="insight-label">Average Performance</div>
                <div className="insight-value">
                  {Math.round(barData.reduce((sum, s) => sum + s.overall, 0) / barData.length)}% overall
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeakerComparison;