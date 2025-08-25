import React, { memo } from 'react';
import PropTypes from 'prop-types';
import './SessionCard.css';

/**
 * SessionCard - Pure Presentational Component
 * 
 * Professional architecture pattern: Presentational Component
 * This component is purely focused on rendering UI based on props.
 * 
 * Characteristics:
 * - No state management (stateless)
 * - No side effects
 * - No data fetching
 * - Only receives props and renders UI
 * - Highly reusable and testable
 * - Memoized for performance
 */
const SessionCardPure = memo(({ 
  session, 
  onClick, 
  isHighlighted = false,
  showDetails = true,
  variant = 'default' 
}) => {
  // Derive display values from props
  const statusClass = `session-card-pure ${session.status} ${variant}`;
  const highlightClass = isHighlighted ? 'highlighted' : '';
  const fillPercentage = session.capacity > 0 
    ? Math.round((session.currentAttendance / session.capacity) * 100)
    : 0;
  
  const getEngagementColor = (engagement) => {
    if (engagement >= 80) return '#10b981';
    if (engagement >= 60) return '#3b82f6';
    if (engagement >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return '🔴';
      case 'upcoming': return '🔵';
      case 'completed': return '✅';
      default: return '⭕';
    }
  };

  return (
    <article 
      className={`${statusClass} ${highlightClass}`}
      onClick={() => onClick && onClick(session)}
      role="button"
      tabIndex={onClick ? 0 : -1}
      aria-label={`${session.title} - ${session.status} session`}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick(session);
        }
      }}
    >
      {/* Status Badge */}
      <div className="session-status-badge">
        <span className="status-icon">{getStatusIcon(session.status)}</span>
        <span className="status-text">{session.status}</span>
      </div>

      {/* Header Section */}
      <header className="session-header">
        <h3 className="session-title">{session.title}</h3>
        {session.track && (
          <span className="session-track">{session.track}</span>
        )}
      </header>

      {/* Meta Information */}
      <div className="session-meta">
        <div className="meta-item">
          <span className="meta-icon">👤</span>
          <span className="meta-text">{session.speaker}</span>
        </div>
        <div className="meta-item">
          <span className="meta-icon">📍</span>
          <span className="meta-text">{session.room}</span>
        </div>
        <div className="meta-item">
          <span className="meta-icon">🕐</span>
          <span className="meta-text">{session.time}</span>
        </div>
      </div>

      {/* Metrics Section */}
      {showDetails && (
        <div className="session-metrics">
          {/* Attendance Metric */}
          <div className="metric">
            <div className="metric-header">
              <span className="metric-label">Attendance</span>
              <span className="metric-value">
                {session.currentAttendance}/{session.capacity}
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${fillPercentage}%`,
                  backgroundColor: fillPercentage > 75 ? '#10b981' : '#f59e0b'
                }}
                role="progressbar"
                aria-valuenow={fillPercentage}
                aria-valuemin="0"
                aria-valuemax="100"
              />
            </div>
            <span className="metric-percentage">{fillPercentage}% full</span>
          </div>

          {/* Engagement Metric */}
          <div className="metric">
            <div className="metric-header">
              <span className="metric-label">Engagement</span>
              <span 
                className="metric-value"
                style={{ color: getEngagementColor(session.engagement) }}
              >
                {session.engagement}%
              </span>
            </div>
            <div className="engagement-indicator">
              <div 
                className="engagement-bar"
                style={{ 
                  width: `${session.engagement}%`,
                  backgroundColor: getEngagementColor(session.engagement)
                }}
              />
            </div>
          </div>

          {/* Rating if available */}
          {session.averageRating && (
            <div className="metric">
              <div className="metric-header">
                <span className="metric-label">Rating</span>
                <span className="metric-value">
                  ⭐ {session.averageRating.toFixed(1)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      {session.tags && session.tags.length > 0 && (
        <footer className="session-tags">
          {session.tags.map((tag, index) => (
            <span key={`${tag}-${index}`} className="tag">
              {tag}
            </span>
          ))}
        </footer>
      )}

      {/* Visual Indicator for Highlighted State */}
      {isHighlighted && (
        <div className="highlight-indicator" aria-label="Featured session">
          ⭐ Featured
        </div>
      )}
    </article>
  );
});

// PropTypes for type checking and documentation
SessionCardPure.propTypes = {
  session: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    speaker: PropTypes.string.isRequired,
    room: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['active', 'upcoming', 'completed']).isRequired,
    currentAttendance: PropTypes.number.isRequired,
    capacity: PropTypes.number.isRequired,
    engagement: PropTypes.number.isRequired,
    track: PropTypes.string,
    averageRating: PropTypes.number,
    tags: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  onClick: PropTypes.func,
  isHighlighted: PropTypes.bool,
  showDetails: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'compact', 'detailed'])
};

// Display name for debugging
SessionCardPure.displayName = 'SessionCardPure';

export default SessionCardPure;