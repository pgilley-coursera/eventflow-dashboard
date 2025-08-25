import React, { useState } from 'react';
import './SpeakerPerformance.css';

const SpeakerCard = ({ speaker }) => {
  const getRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <span className="rating-stars" aria-label={`Rating: ${rating} out of 5 stars`}>
        {'★'.repeat(fullStars)}
        {hasHalfStar && '⯨'}
        {'☆'.repeat(emptyStars)}
      </span>
    );
  };
  
  const getPerformanceColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };
  
  return (
    <article className="speaker-card">
      <div className="speaker-avatar">
        <div className="avatar-placeholder">
          {speaker.name.split(' ').map(n => n[0]).join('')}
        </div>
      </div>
      
      <div className="speaker-info">
        <h4 className="speaker-name">{speaker.name}</h4>
        <p className="speaker-title">{speaker.title}</p>
        <p className="speaker-company">{speaker.company}</p>
      </div>
      
      <div className="speaker-metrics">
        <div className="metric-row">
          <span className="metric-label">Sessions:</span>
          <span className="metric-value">{speaker.sessions || 0}</span>
        </div>
        
        <div className="metric-row">
          <span className="metric-label">Total Attendance:</span>
          <span className="metric-value">{speaker.totalAttendance || 0}</span>
        </div>
        
        <div className="metric-row">
          <span className="metric-label">Avg Engagement:</span>
          <div className="metric-value-with-bar">
            <span className="metric-value">{speaker.avgEngagement || 0}%</span>
            <div className="mini-progress-bar">
              <div 
                className="mini-progress-fill"
                style={{ 
                  width: `${speaker.avgEngagement || 0}%`,
                  backgroundColor: getPerformanceColor(speaker.avgEngagement || 0)
                }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="metric-row">
          <span className="metric-label">Rating:</span>
          <div className="rating-display">
            {getRatingStars(speaker.rating || 0)}
            <span className="rating-number">({speaker.rating?.toFixed(1) || '0.0'})</span>
          </div>
        </div>
      </div>
      
      {speaker.performance !== undefined && (
        <div className="performance-score">
          <span className="score-label">Performance Score</span>
          <div 
            className="score-value"
            style={{ color: getPerformanceColor(speaker.performance) }}
          >
            {speaker.performance}
          </div>
        </div>
      )}
    </article>
  );
};

const SpeakerPerformance = ({ speakers = [], loading = false }) => {
  const [sortBy, setSortBy] = useState('performance');
  const [filterBy, setFilterBy] = useState('all');
  
  const sortedSpeakers = [...speakers].sort((a, b) => {
    switch (sortBy) {
      case 'performance':
        return (b.performance || 0) - (a.performance || 0);
      case 'engagement':
        return (b.avgEngagement || 0) - (a.avgEngagement || 0);
      case 'attendance':
        return (b.totalAttendance || 0) - (a.totalAttendance || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });
  
  const filteredSpeakers = sortedSpeakers.filter(speaker => {
    if (filterBy === 'all') return true;
    if (filterBy === 'top') return (speaker.performance || 0) >= 70;
    if (filterBy === 'active') return speaker.sessions > 0;
    return true;
  });
  
  if (loading) {
    return (
      <div className="speaker-performance-container">
        <div className="performance-header">
          <h3>Speaker Performance</h3>
        </div>
        <div className="speaker-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="speaker-card loading">
              <div className="skeleton skeleton-avatar"></div>
              <div className="skeleton skeleton-info"></div>
              <div className="skeleton skeleton-metrics"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <section className="speaker-performance-container" aria-label="Speaker Performance">
      <div className="performance-header">
        <h3>Speaker Performance</h3>
        <div className="performance-controls">
          <div className="control-group">
            <label htmlFor="sort-speakers">Sort by:</label>
            <select 
              id="sort-speakers"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort speakers"
            >
              <option value="performance">Performance Score</option>
              <option value="engagement">Engagement</option>
              <option value="attendance">Attendance</option>
              <option value="rating">Rating</option>
              <option value="name">Name</option>
            </select>
          </div>
          
          <div className="control-group">
            <label htmlFor="filter-speakers">Filter:</label>
            <select 
              id="filter-speakers"
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              aria-label="Filter speakers"
            >
              <option value="all">All Speakers</option>
              <option value="top">Top Performers</option>
              <option value="active">Active Only</option>
            </select>
          </div>
        </div>
      </div>
      
      {filteredSpeakers.length === 0 ? (
        <div className="no-speakers">
          <p>No speakers found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="speaker-grid">
            {filteredSpeakers.slice(0, 8).map(speaker => (
              <SpeakerCard key={speaker.id} speaker={speaker} />
            ))}
          </div>
          
          {filteredSpeakers.length > 8 && (
            <div className="view-more">
              <button className="view-more-button">
                View All {filteredSpeakers.length} Speakers
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default SpeakerPerformance;