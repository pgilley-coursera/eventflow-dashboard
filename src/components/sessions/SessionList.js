import React, { useState, useMemo, useCallback, memo, useEffect, useRef } from 'react';
import './SessionList.css';
import { getStatusColor, getEngagementLevel } from '../../utils/dataTransformers';
import usePerformanceMonitor from '../../hooks/usePerformanceMonitor';
import { useAccessibility, useDataUpdateAnnouncement, useListKeyboardNavigation } from '../../hooks/useAccessibility';
import LiveRegion from '../common/LiveRegion';

// Optimized with React.memo to prevent unnecessary re-renders
const SessionCard = memo(({ session, onClick }) => {
  const engagementLevel = getEngagementLevel(session.engagement);
  const statusColor = getStatusColor(session.status);
  
  return (
    <article 
      className={`session-card ${session.status}`}
      onClick={() => onClick(session)}
      tabIndex={0}
      role="button"
      aria-label={`${session.title} session details`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(session);
        }
      }}
    >
      <div className="session-status-indicator" style={{ backgroundColor: statusColor }}>
        <span className="status-text">{session.status}</span>
      </div>
      
      <div className="session-header">
        <h3 className="session-title">{session.title}</h3>
        <div className="session-meta">
          <span className="session-time">🕐 {session.time}</span>
          <span className="session-room">📍 {session.room}</span>
        </div>
      </div>
      
      <div className="session-speaker">
        <span className="speaker-label">Speaker:</span>
        <span className="speaker-name">{session.speaker}</span>
      </div>
      
      <div className="session-metrics">
        <div className="metric-item">
          <span className="metric-label">Attendance</span>
          <div className="metric-value-wrapper">
            <span className="metric-value">{session.currentAttendance}/{session.capacity}</span>
            <span className="metric-percentage">({session.attendanceRate}%)</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill attendance"
              style={{ width: `${session.attendanceRate}%` }}
              role="progressbar"
              aria-valuenow={session.attendanceRate}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
        </div>
        
        <div className="metric-item">
          <span className="metric-label">Engagement</span>
          <div className="metric-value-wrapper">
            <span className="metric-value">{session.engagement}%</span>
            <span 
              className="engagement-badge"
              style={{ color: engagementLevel.color }}
            >
              {engagementLevel.level}
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill engagement"
              style={{ 
                width: `${session.engagement}%`,
                backgroundColor: engagementLevel.color 
              }}
              role="progressbar"
              aria-valuenow={session.engagement}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
        </div>
      </div>
      
      {session.tags && session.tags.length > 0 && (
        <div className="session-tags">
          {session.tags.map((tag, index) => (
            <span key={index} className="tag">{tag}</span>
          ))}
        </div>
      )}
    </article>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  return prevProps.session.id === nextProps.session.id &&
         prevProps.session.currentAttendance === nextProps.session.currentAttendance &&
         prevProps.session.engagement === nextProps.session.engagement &&
         prevProps.session.status === nextProps.session.status;
});

const SessionList = ({ sessions = [], loading = false, onSessionClick }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('time');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef(null);
  
  // Accessibility hooks
  const { announce, announceDebounced } = useAccessibility();
  
  // Performance monitoring
  const { markRenderStart, markRenderEnd } = usePerformanceMonitor('SessionList');
  
  // Track render performance
  useEffect(() => {
    markRenderStart();
    return () => {
      markRenderEnd();
    };
  });
  
  // Optimized callbacks to prevent re-creation on every render
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);
  
  const handleFilterChange = useCallback((e) => {
    setFilter(e.target.value);
  }, []);
  
  const handleSortChange = useCallback((e) => {
    setSortBy(e.target.value);
  }, []);
  
  // Memoized callback for session clicks
  const handleSessionClick = useCallback((session) => {
    if (onSessionClick) {
      onSessionClick(session);
    }
  }, [onSessionClick]);
  
  // Optimized with useMemo to recalculate only when dependencies change
  const filteredAndSortedSessions = useMemo(() => {
    let filtered = [...sessions];
    
    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(session => session.status === filter);
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(session => 
        session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.speaker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.room.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'attendance':
          return b.currentAttendance - a.currentAttendance;
        case 'engagement':
          return b.engagement - a.engagement;
        case 'time':
        default:
          return a.startHour - b.startHour;
      }
    });
    
    return filtered;
  }, [sessions, filter, searchTerm, sortBy]);
  
  const sessionCounts = useMemo(() => ({
    all: sessions.length,
    active: sessions.filter(s => s.status === 'active').length,
    upcoming: sessions.filter(s => s.status === 'upcoming').length,
    completed: sessions.filter(s => s.status === 'completed').length
  }), [sessions]);
  
  // Keyboard navigation for session list
  const { handleKeyDown } = useListKeyboardNavigation(
    filteredAndSortedSessions,
    (index, session) => {
      setSelectedIndex(index);
      if (onSessionClick) {
        onSessionClick(session);
      }
    },
    selectedIndex
  );
  
  // Announce session count changes
  useDataUpdateAnnouncement(sessionCounts, (current, previous) => {
    const changes = [];
    if (current.active !== previous.active) {
      changes.push(`${current.active} active sessions`);
    }
    if (current.upcoming !== previous.upcoming) {
      changes.push(`${current.upcoming} upcoming sessions`);
    }
    if (current.completed !== previous.completed) {
      changes.push(`${current.completed} completed sessions`);
    }
    return changes.length > 0 ? `Session counts updated: ${changes.join(', ')}` : '';
  });
  
  // Announce filter/search results
  useEffect(() => {
    if (searchTerm || filter !== 'all') {
      const resultCount = filteredAndSortedSessions.length;
      const message = `Showing ${resultCount} ${resultCount === 1 ? 'session' : 'sessions'}`;
      announceDebounced(message, 'polite');
    }
  }, [filteredAndSortedSessions.length, searchTerm, filter, announceDebounced]);
  
  if (loading) {
    return (
      <div className="session-list-container">
        <div className="session-list-header">
          <h2>Session Tracking</h2>
        </div>
        <div className="session-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="session-card loading">
              <div className="skeleton skeleton-title"></div>
              <div className="skeleton skeleton-meta"></div>
              <div className="skeleton skeleton-metrics"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <section className="session-list-container" aria-label="Session Tracking">
      <div className="session-list-header">
        <h2>Session Tracking</h2>
        <div className="session-controls">
          <div className="search-box">
            <input
              type="search"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={handleSearchChange}
              aria-label="Search sessions"
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="filter-controls">
            <div className="filter-group">
              <label htmlFor="status-filter">Status:</label>
              <select 
                id="status-filter"
                value={filter} 
                onChange={handleFilterChange}
                aria-label="Filter by status"
              >
                <option value="all">All ({sessionCounts.all})</option>
                <option value="active">Active ({sessionCounts.active})</option>
                <option value="upcoming">Upcoming ({sessionCounts.upcoming})</option>
                <option value="completed">Completed ({sessionCounts.completed})</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="sort-by">Sort by:</label>
              <select 
                id="sort-by"
                value={sortBy} 
                onChange={handleSortChange}
                aria-label="Sort sessions"
              >
                <option value="time">Time</option>
                <option value="attendance">Attendance</option>
                <option value="engagement">Engagement</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {filteredAndSortedSessions.length === 0 ? (
        <div className="no-sessions" role="status">
          <p>No sessions found matching your criteria.</p>
        </div>
      ) : (
        <div 
          className="session-grid"
          ref={listRef}
          onKeyDown={handleKeyDown}
          role="list"
          aria-label={`${filteredAndSortedSessions.length} sessions`}
        >
          {filteredAndSortedSessions.map((session, index) => (
            <div
              key={session.id}
              role="listitem"
              aria-selected={selectedIndex === index}
              tabIndex={selectedIndex === index ? 0 : -1}
            >
              <SessionCard 
                session={session}
                onClick={handleSessionClick}
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Live region for announcements */}
      <LiveRegion id="session-list-announcements" />
    </section>
  );
};

export default SessionList;