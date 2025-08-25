import React, { useMemo, useState } from 'react';
import './EngagementHeatmap.css';

/**
 * EngagementHeatmap Component
 * 
 * Visualizes session engagement levels across different time slots and tracks
 * using a color-coded heatmap. This helps identify patterns in attendee
 * engagement throughout the event.
 * 
 * Features:
 * - Color intensity represents engagement levels
 * - Interactive tooltips with detailed information
 * - Time-based grouping (morning/afternoon/evening)
 * - Track-based categorization
 * - Responsive grid layout
 */
const EngagementHeatmap = ({ sessions = [], loading = false }) => {
  const [hoveredCell, setHoveredCell] = useState(null);

  // Process sessions into heatmap data
  const heatmapData = useMemo(() => {
    if (!sessions || sessions.length === 0) return null;

    // Define time slots and tracks
    const timeSlots = ['Morning', 'Afternoon', 'Evening'];
    const tracks = [...new Set(sessions.map(s => s.track || 'General'))].sort();

    // Create matrix for heatmap
    const matrix = {};
    tracks.forEach(track => {
      matrix[track] = {};
      timeSlots.forEach(slot => {
        matrix[track][slot] = {
          sessions: [],
          avgEngagement: 0,
          totalAttendance: 0
        };
      });
    });

    // Categorize sessions
    sessions.forEach(session => {
      const track = session.track || 'General';
      const hour = parseInt(session.time?.split(':')[0] || '12');
      let timeSlot = 'Afternoon';
      
      if (hour < 12) timeSlot = 'Morning';
      else if (hour >= 17) timeSlot = 'Evening';

      if (matrix[track] && matrix[track][timeSlot]) {
        matrix[track][timeSlot].sessions.push(session);
        matrix[track][timeSlot].totalAttendance += session.currentAttendance || 0;
      }
    });

    // Calculate average engagement for each cell
    Object.keys(matrix).forEach(track => {
      Object.keys(matrix[track]).forEach(slot => {
        const cell = matrix[track][slot];
        if (cell.sessions.length > 0) {
          const totalEngagement = cell.sessions.reduce((sum, s) => sum + (s.engagement || 0), 0);
          cell.avgEngagement = Math.round(totalEngagement / cell.sessions.length);
        }
      });
    });

    return {
      matrix,
      timeSlots,
      tracks,
      maxEngagement: Math.max(...Object.values(matrix).flatMap(track => 
        Object.values(track).map(cell => cell.avgEngagement)
      ))
    };
  }, [sessions]);

  // Get color based on engagement level
  const getHeatmapColor = (engagement, maxEngagement) => {
    if (engagement === 0) return 'rgba(200, 200, 200, 0.2)';
    
    const intensity = engagement / maxEngagement;
    
    if (intensity < 0.25) return 'rgba(59, 130, 246, 0.3)';   // Blue - Low
    if (intensity < 0.5) return 'rgba(34, 197, 94, 0.5)';     // Green - Medium-Low
    if (intensity < 0.75) return 'rgba(251, 191, 36, 0.7)';   // Yellow - Medium-High
    return 'rgba(239, 68, 68, 0.9)';                          // Red - High
  };

  // Get text color based on background
  const getTextColor = (engagement, maxEngagement) => {
    const intensity = engagement / maxEngagement;
    return intensity > 0.5 ? '#ffffff' : 'var(--text-primary)';
  };

  if (loading) {
    return (
      <div className="engagement-heatmap-container">
        <div className="heatmap-loading">
          <div className="loading-spinner"></div>
          <p>Loading engagement data...</p>
        </div>
      </div>
    );
  }

  if (!heatmapData) {
    return (
      <div className="engagement-heatmap-container">
        <div className="heatmap-empty">
          <p>No engagement data available</p>
        </div>
      </div>
    );
  }

  const { matrix, timeSlots, tracks, maxEngagement } = heatmapData;

  return (
    <div className="engagement-heatmap-container">
      <div className="heatmap-header">
        <h3>Session Engagement Heatmap</h3>
        <p className="heatmap-subtitle">
          Engagement levels across tracks and time slots
        </p>
      </div>

      <div className="heatmap-content">
        <div className="heatmap-grid">
          {/* Header row with time slots */}
          <div className="heatmap-corner"></div>
          {timeSlots.map(slot => (
            <div key={slot} className="heatmap-time-header">
              {slot}
            </div>
          ))}

          {/* Track rows with cells */}
          {tracks.map(track => (
            <React.Fragment key={track}>
              <div className="heatmap-track-header">{track}</div>
              {timeSlots.map(slot => {
                const cell = matrix[track][slot];
                const isHovered = hoveredCell === `${track}-${slot}`;
                
                return (
                  <div
                    key={`${track}-${slot}`}
                    className={`heatmap-cell ${isHovered ? 'hovered' : ''}`}
                    style={{
                      backgroundColor: getHeatmapColor(cell.avgEngagement, maxEngagement),
                      color: getTextColor(cell.avgEngagement, maxEngagement)
                    }}
                    onMouseEnter={() => setHoveredCell(`${track}-${slot}`)}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    <div className="cell-engagement">
                      {cell.avgEngagement > 0 ? `${cell.avgEngagement}%` : '-'}
                    </div>
                    <div className="cell-sessions">
                      {cell.sessions.length} {cell.sessions.length === 1 ? 'session' : 'sessions'}
                    </div>
                    
                    {isHovered && cell.sessions.length > 0 && (
                      <div className="heatmap-tooltip">
                        <div className="tooltip-header">
                          <strong>{track} - {slot}</strong>
                        </div>
                        <div className="tooltip-stats">
                          <div>Avg Engagement: {cell.avgEngagement}%</div>
                          <div>Total Attendance: {cell.totalAttendance}</div>
                          <div>Sessions: {cell.sessions.length}</div>
                        </div>
                        <div className="tooltip-sessions">
                          <div className="sessions-label">Sessions:</div>
                          {cell.sessions.slice(0, 3).map((s, idx) => (
                            <div key={idx} className="session-item">
                              • {s.title} ({s.engagement}%)
                            </div>
                          ))}
                          {cell.sessions.length > 3 && (
                            <div className="session-item more">
                              ...and {cell.sessions.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {/* Legend */}
        <div className="heatmap-legend">
          <div className="legend-title">Engagement Level</div>
          <div className="legend-scale">
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: 'rgba(59, 130, 246, 0.3)' }}></div>
              <span>Low (0-25%)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: 'rgba(34, 197, 94, 0.5)' }}></div>
              <span>Medium (25-50%)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: 'rgba(251, 191, 36, 0.7)' }}></div>
              <span>High (50-75%)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: 'rgba(239, 68, 68, 0.9)' }}></div>
              <span>Very High (75-100%)</span>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="heatmap-insights">
          <h4>Key Insights</h4>
          <ul>
            {(() => {
              const insights = [];
              
              // Find highest engagement slot
              let highestEngagement = { track: '', slot: '', value: 0 };
              tracks.forEach(track => {
                timeSlots.forEach(slot => {
                  if (matrix[track][slot].avgEngagement > highestEngagement.value) {
                    highestEngagement = {
                      track,
                      slot,
                      value: matrix[track][slot].avgEngagement
                    };
                  }
                });
              });

              if (highestEngagement.value > 0) {
                insights.push(
                  `Highest engagement: ${highestEngagement.track} track during ${highestEngagement.slot} (${highestEngagement.value}%)`
                );
              }

              // Find most active time slot
              const slotTotals = {};
              timeSlots.forEach(slot => {
                slotTotals[slot] = tracks.reduce((sum, track) => 
                  sum + matrix[track][slot].sessions.length, 0
                );
              });
              const mostActiveSlot = Object.entries(slotTotals)
                .sort(([,a], [,b]) => b - a)[0];
              
              if (mostActiveSlot) {
                insights.push(
                  `Most sessions scheduled: ${mostActiveSlot[0]} with ${mostActiveSlot[1]} sessions`
                );
              }

              // Find track with highest overall engagement
              const trackEngagements = {};
              tracks.forEach(track => {
                const totalEng = timeSlots.reduce((sum, slot) => {
                  const cell = matrix[track][slot];
                  return sum + (cell.sessions.length > 0 ? cell.avgEngagement : 0);
                }, 0);
                const avgEng = totalEng / timeSlots.filter(slot => 
                  matrix[track][slot].sessions.length > 0
                ).length;
                trackEngagements[track] = avgEng || 0;
              });
              
              const topTrack = Object.entries(trackEngagements)
                .sort(([,a], [,b]) => b - a)[0];
              
              if (topTrack && topTrack[1] > 0) {
                insights.push(
                  `Top performing track: ${topTrack[0]} with ${Math.round(topTrack[1])}% average engagement`
                );
              }

              return insights.map((insight, idx) => (
                <li key={idx}>{insight}</li>
              ));
            })()}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EngagementHeatmap;