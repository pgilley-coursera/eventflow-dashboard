/**
 * SessionAnalytics Service
 * 
 * Professional architecture pattern: Separation of Concerns
 * This service encapsulates all session-related data processing logic,
 * keeping components focused on presentation and state management.
 */

class SessionAnalytics {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5000; // 5 seconds
  }

  /**
   * Clear cache for a specific key or all cache
   */
  clearCache(key = null) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cached result or compute and cache
   */
  getCachedOrCompute(key, computeFn, data) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.value;
    }

    const value = computeFn(data);
    this.cache.set(key, { value, timestamp: Date.now() });
    return value;
  }

  /**
   * Calculate session statistics
   */
  calculateSessionStats(sessions) {
    return this.getCachedOrCompute('sessionStats', (data) => {
      if (!data || data.length === 0) {
        return {
          total: 0,
          active: 0,
          upcoming: 0,
          completed: 0,
          averageAttendance: 0,
          averageEngagement: 0,
          totalCapacity: 0,
          totalAttendees: 0
        };
      }

      const stats = data.reduce((acc, session) => {
        acc.total++;
        acc[session.status]++;
        acc.totalCapacity += session.capacity || 0;
        acc.totalAttendees += session.currentAttendance || 0;
        acc.totalEngagement += session.engagement || 0;
        return acc;
      }, {
        total: 0,
        active: 0,
        upcoming: 0,
        completed: 0,
        totalCapacity: 0,
        totalAttendees: 0,
        totalEngagement: 0
      });

      stats.averageAttendance = stats.total > 0 
        ? Math.round(stats.totalAttendees / stats.total) 
        : 0;
      
      stats.averageEngagement = stats.total > 0 
        ? Math.round(stats.totalEngagement / stats.total) 
        : 0;

      delete stats.totalEngagement;

      return stats;
    }, sessions);
  }

  /**
   * Get top performing sessions
   */
  getTopSessions(sessions, metric = 'attendance', limit = 5) {
    const cacheKey = `topSessions_${metric}_${limit}`;
    
    return this.getCachedOrCompute(cacheKey, (data) => {
      if (!data || data.length === 0) return [];

      const sorted = [...data].sort((a, b) => {
        switch (metric) {
          case 'engagement':
            return (b.engagement || 0) - (a.engagement || 0);
          case 'capacity':
            return (b.capacity || 0) - (a.capacity || 0);
          case 'rating':
            return (b.averageRating || 0) - (a.averageRating || 0);
          case 'attendance':
          default:
            return (b.currentAttendance || 0) - (a.currentAttendance || 0);
        }
      });

      return sorted.slice(0, limit).map(session => ({
        ...session,
        rank: sorted.indexOf(session) + 1,
        percentile: Math.round(((data.length - sorted.indexOf(session)) / data.length) * 100)
      }));
    }, sessions);
  }

  /**
   * Calculate attendance trends over time
   */
  calculateAttendanceTrends(sessions) {
    return this.getCachedOrCompute('attendanceTrends', (data) => {
      if (!data || data.length === 0) return [];

      // Group sessions by hour
      const hourlyData = data.reduce((acc, session) => {
        const hour = session.startHour || 9;
        if (!acc[hour]) {
          acc[hour] = {
            hour,
            sessions: [],
            totalAttendance: 0,
            totalCapacity: 0,
            averageEngagement: 0
          };
        }
        
        acc[hour].sessions.push(session);
        acc[hour].totalAttendance += session.currentAttendance || 0;
        acc[hour].totalCapacity += session.capacity || 0;
        acc[hour].averageEngagement += session.engagement || 0;
        
        return acc;
      }, {});

      // Calculate averages and format for charts
      return Object.values(hourlyData).map(hourData => ({
        hour: hourData.hour,
        time: `${hourData.hour}:00`,
        attendance: hourData.totalAttendance,
        capacity: hourData.totalCapacity,
        fillRate: hourData.totalCapacity > 0 
          ? Math.round((hourData.totalAttendance / hourData.totalCapacity) * 100)
          : 0,
        engagement: Math.round(hourData.averageEngagement / hourData.sessions.length),
        sessionCount: hourData.sessions.length
      })).sort((a, b) => a.hour - b.hour);
    }, sessions);
  }

  /**
   * Analyze session performance by category
   */
  analyzeByCategory(sessions, category = 'track') {
    return this.getCachedOrCompute(`categoryAnalysis_${category}`, (data) => {
      if (!data || data.length === 0) return [];

      const categoryMap = data.reduce((acc, session) => {
        const key = session[category] || 'Other';
        if (!acc[key]) {
          acc[key] = {
            category: key,
            sessions: [],
            metrics: {
              totalAttendance: 0,
              totalCapacity: 0,
              averageEngagement: 0,
              averageRating: 0,
              sessionCount: 0
            }
          };
        }

        acc[key].sessions.push(session);
        acc[key].metrics.totalAttendance += session.currentAttendance || 0;
        acc[key].metrics.totalCapacity += session.capacity || 0;
        acc[key].metrics.averageEngagement += session.engagement || 0;
        acc[key].metrics.averageRating += session.averageRating || 0;
        acc[key].metrics.sessionCount++;

        return acc;
      }, {});

      // Calculate final metrics
      return Object.values(categoryMap).map(cat => ({
        category: cat.category,
        sessionCount: cat.metrics.sessionCount,
        totalAttendance: cat.metrics.totalAttendance,
        fillRate: cat.metrics.totalCapacity > 0
          ? Math.round((cat.metrics.totalAttendance / cat.metrics.totalCapacity) * 100)
          : 0,
        averageEngagement: Math.round(cat.metrics.averageEngagement / cat.metrics.sessionCount),
        averageRating: (cat.metrics.averageRating / cat.metrics.sessionCount).toFixed(1),
        topSession: cat.sessions.sort((a, b) => 
          (b.currentAttendance || 0) - (a.currentAttendance || 0)
        )[0]
      }));
    }, sessions);
  }

  /**
   * Get session recommendations based on user preferences
   */
  getRecommendations(sessions, preferences = {}) {
    const { minEngagement = 70, preferredTracks = [], timeSlot = null } = preferences;

    return sessions.filter(session => {
      if (session.engagement < minEngagement) return false;
      if (preferredTracks.length > 0 && !preferredTracks.includes(session.track)) return false;
      if (timeSlot && session.startHour !== timeSlot) return false;
      return session.status !== 'completed';
    }).sort((a, b) => {
      // Sort by composite score
      const scoreA = (a.engagement * 0.4) + (a.attendanceRate * 0.3) + ((a.averageRating || 0) * 20 * 0.3);
      const scoreB = (b.engagement * 0.4) + (b.attendanceRate * 0.3) + ((b.averageRating || 0) * 20 * 0.3);
      return scoreB - scoreA;
    }).slice(0, 5);
  }

  /**
   * Identify sessions needing attention
   */
  getSessionsNeedingAttention(sessions) {
    return this.getCachedOrCompute('sessionsNeedingAttention', (data) => {
      const issues = [];

      data.forEach(session => {
        const problems = [];
        
        if (session.attendanceRate < 30) {
          problems.push({ type: 'low_attendance', severity: 'high', message: 'Very low attendance' });
        } else if (session.attendanceRate < 50) {
          problems.push({ type: 'low_attendance', severity: 'medium', message: 'Below average attendance' });
        }

        if (session.engagement < 40) {
          problems.push({ type: 'low_engagement', severity: 'high', message: 'Poor engagement level' });
        } else if (session.engagement < 60) {
          problems.push({ type: 'low_engagement', severity: 'medium', message: 'Moderate engagement' });
        }

        if (session.averageRating && session.averageRating < 3) {
          problems.push({ type: 'low_rating', severity: 'high', message: 'Low audience rating' });
        }

        if (problems.length > 0) {
          issues.push({
            session,
            problems,
            overallSeverity: problems.some(p => p.severity === 'high') ? 'high' : 'medium',
            recommendedActions: this.getRecommendedActions(problems)
          });
        }
      });

      return issues.sort((a, b) => {
        const severityOrder = { high: 0, medium: 1, low: 2 };
        return severityOrder[a.overallSeverity] - severityOrder[b.overallSeverity];
      });
    }, sessions);
  }

  /**
   * Get recommended actions based on problems
   */
  getRecommendedActions(problems) {
    const actions = [];
    
    if (problems.some(p => p.type === 'low_attendance')) {
      actions.push('Send reminder notifications to registered attendees');
      actions.push('Consider room change or schedule adjustment');
    }
    
    if (problems.some(p => p.type === 'low_engagement')) {
      actions.push('Encourage speaker to increase interactivity');
      actions.push('Review session format and content');
    }
    
    if (problems.some(p => p.type === 'low_rating')) {
      actions.push('Collect detailed feedback from attendees');
      actions.push('Schedule follow-up with speaker');
    }
    
    return actions;
  }

  /**
   * Generate performance summary
   */
  generatePerformanceSummary(sessions, speakers, attendees) {
    const sessionStats = this.calculateSessionStats(sessions);
    const topSessions = this.getTopSessions(sessions, 'attendance', 3);
    const trends = this.calculateAttendanceTrends(sessions);
    const issues = this.getSessionsNeedingAttention(sessions);

    const peakHour = trends.reduce((max, current) => 
      current.attendance > (max?.attendance || 0) ? current : max, null);

    return {
      overview: {
        totalSessions: sessionStats.total,
        activeSessions: sessionStats.active,
        totalAttendees: sessionStats.totalAttendees,
        averageEngagement: sessionStats.averageEngagement,
        overallFillRate: sessionStats.totalCapacity > 0
          ? Math.round((sessionStats.totalAttendees / sessionStats.totalCapacity) * 100)
          : 0
      },
      highlights: {
        topSessions,
        peakHour: peakHour ? `${peakHour.time} (${peakHour.attendance} attendees)` : 'N/A',
        sessionsNeedingAttention: issues.length,
        highEngagementSessions: sessions.filter(s => s.engagement > 80).length
      },
      recommendations: {
        immediate: issues.slice(0, 3).map(issue => ({
          session: issue.session.title,
          action: issue.recommendedActions[0]
        })),
        strategic: this.generateStrategicRecommendations(sessions, trends)
      }
    };
  }

  /**
   * Generate strategic recommendations
   */
  generateStrategicRecommendations(sessions, trends) {
    const recommendations = [];

    // Analyze fill rates
    const avgFillRate = trends.reduce((sum, t) => sum + t.fillRate, 0) / trends.length;
    if (avgFillRate < 60) {
      recommendations.push('Consider reducing venue capacity or consolidating sessions');
    }

    // Analyze engagement patterns
    const lowEngagementCount = sessions.filter(s => s.engagement < 50).length;
    if (lowEngagementCount > sessions.length * 0.3) {
      recommendations.push('Review session formats and speaker preparation process');
    }

    // Time slot analysis
    const morningTrends = trends.filter(t => t.hour < 12);
    const afternoonTrends = trends.filter(t => t.hour >= 12);
    
    const morningAvg = morningTrends.reduce((sum, t) => sum + t.attendance, 0) / morningTrends.length;
    const afternoonAvg = afternoonTrends.reduce((sum, t) => sum + t.attendance, 0) / afternoonTrends.length;
    
    if (morningAvg > afternoonAvg * 1.3) {
      recommendations.push('Schedule key sessions in morning slots for maximum attendance');
    }

    return recommendations;
  }
}

// Export singleton instance
const sessionAnalytics = new SessionAnalytics();
export default sessionAnalytics;