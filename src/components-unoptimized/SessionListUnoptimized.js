import React, { useState, useEffect } from 'react';
import '../components/sessions/SessionList.css';
import { getStatusColor, getEngagementLevel } from '../utils/dataTransformers';

const SessionCard = ({ session, onClick }) => {
  // PERFORMANCE ISSUE: Calculating these on every render without memoization
  const engagementLevel = getEngagementLevel(session.engagement);
  const statusColor = getStatusColor(session.status);
  
  // PERFORMANCE ISSUE: Creating new function on every render
  const handleClick = () => {
    onClick(session);
  };
  
  // PERFORMANCE ISSUE: Creating new function on every render
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(session);
    }
  };
  
  return (
    <article 
      className={`session-card ${session.status}`}
      onClick={handleClick}
      tabIndex={0}
      role="button"
      aria-label={`${session.title} session details`}
      onKeyDown={handleKeyDown}
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
          {/* PERFORMANCE ISSUE: Using index as key */}
          {session.tags.map((tag, index) => (
            <span key={index} className="tag">{tag}</span>
          ))}
        </div>
      )}
    </article>
  );
};

const SessionListUnoptimized = ({ sessions = [], loading = false, onSessionClick }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('time');
  const [eventListeners, setEventListeners] = useState([]);
  
  // PERFORMANCE ISSUE: Memory leak - adding event listeners without cleanup
  useEffect(() => {
    const listener = () => {
      console.log('Window resized');
    };
    window.addEventListener('resize', listener);
    setEventListeners(prev => [...prev, listener]);
    // MISSING: No cleanup function to remove listener
  }, [sessions]); // PERFORMANCE ISSUE: Runs on every sessions update
  
  // PERFORMANCE ISSUE: Inefficient calculation on every render without memoization
  const filteredAndSortedSessions = (() => {
    console.log('Calculating filtered sessions - this runs on EVERY render');
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
    
    // PERFORMANCE ISSUE: Inefficient sorting algorithm
    // Using bubble sort instead of native sort for demonstration
    for (let i = 0; i < filtered.length; i++) {
      for (let j = 0; j < filtered.length - i - 1; j++) {
        let shouldSwap = false;
        switch (sortBy) {
          case 'attendance':
            shouldSwap = filtered[j].currentAttendance < filtered[j + 1].currentAttendance;
            break;
          case 'engagement':
            shouldSwap = filtered[j].engagement < filtered[j + 1].engagement;
            break;
          case 'time':
          default:
            shouldSwap = filtered[j].startHour > filtered[j + 1].startHour;
            break;
        }
        if (shouldSwap) {
          const temp = filtered[j];
          filtered[j] = filtered[j + 1];
          filtered[j + 1] = temp;
        }
      }
    }
    
    return filtered;
  })();
  
  // PERFORMANCE ISSUE: Recalculating counts on every render
  const sessionCounts = {
    all: sessions.length,
    active: sessions.filter(s => s.status === 'active').length,
    upcoming: sessions.filter(s => s.status === 'upcoming').length,
    completed: sessions.filter(s => s.status === 'completed').length
  };
  
  // PERFORMANCE ISSUE: Creating new functions on every render
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };
  
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };
  
  if (loading) {
    return (
      <div className="session-list-container">
        <div className="session-list-header">
          <h2>Session Tracking (Unoptimized)</h2>
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
        <h2>Session Tracking (Unoptimized)</h2>
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
        <div className="no-sessions">
          <p>No sessions found matching your criteria.</p>
        </div>
      ) : (
        <div className="session-grid">
          {/* PERFORMANCE ISSUE: Not using React.memo for SessionCard */}
          {filteredAndSortedSessions.map(session => (
            <SessionCard 
              key={session.id} 
              session={session}
              onClick={onSessionClick || (() => {})}
            />
          ))}
        </div>
      )}
      
      {/* Debug info showing performance issues */}
      <div style={{ fontSize: '10px', marginTop: '10px', opacity: 0.5 }}>
        Event listeners accumulated: {eventListeners.length}
      </div>
    </section>
  );
};

export default SessionListUnoptimized;