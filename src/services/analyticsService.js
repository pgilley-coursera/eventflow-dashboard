import {
  transformSessionsForChart,
  transformAttendanceTrends,
  transformSpeakerPerformance,
  transformFeedbackData,
  aggregateMetrics,
  getTopPerformingSessions,
  getSessionsByTimeSlot,
  calculateEngagementTrend,
  getRecentActivity
} from '../utils/dataTransformers';

class AnalyticsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 10000;
  }

  getCacheKey(method, ...args) {
    return `${method}-${JSON.stringify(args)}`;
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
  }

  getSessionAnalytics(sessions) {
    const key = this.getCacheKey('sessionAnalytics', sessions.length);
    const cached = this.getFromCache(key);
    if (cached) return cached;

    const analytics = {
      chartData: transformSessionsForChart(sessions),
      trends: transformAttendanceTrends(sessions),
      topSessions: getTopPerformingSessions(sessions),
      timeSlots: getSessionsByTimeSlot(sessions),
      engagementTrend: calculateEngagementTrend(sessions)
    };

    this.setCache(key, analytics);
    return analytics;
  }

  getSpeakerAnalytics(speakers, sessions) {
    const key = this.getCacheKey('speakerAnalytics', speakers.length, sessions.length);
    const cached = this.getFromCache(key);
    if (cached) return cached;

    const analytics = {
      performance: transformSpeakerPerformance(speakers, sessions),
      topSpeakers: transformSpeakerPerformance(speakers, sessions).slice(0, 5),
      speakerComparison: this.generateSpeakerComparison(speakers, sessions)
    };

    this.setCache(key, analytics);
    return analytics;
  }

  generateSpeakerComparison(speakers, sessions) {
    const topSpeakers = transformSpeakerPerformance(speakers, sessions).slice(0, 5);
    
    return topSpeakers.map(speaker => ({
      name: speaker.name,
      engagement: speaker.avgEngagement,
      attendance: speaker.totalAttendance,
      rating: speaker.rating * 20,
      sessions: speaker.sessions * 10
    }));
  }

  getFeedbackAnalytics(feedback) {
    const key = this.getCacheKey('feedbackAnalytics', feedback.length);
    const cached = this.getFromCache(key);
    if (cached) return cached;

    const analytics = {
      distribution: transformFeedbackData(feedback),
      recentFeedback: feedback.slice(-10).reverse(),
      averageRatings: this.calculateAverageRatings(feedback),
      sentimentAnalysis: this.analyzeSentiment(feedback)
    };

    this.setCache(key, analytics);
    return analytics;
  }

  calculateAverageRatings(feedback) {
    if (feedback.length === 0) {
      return {
        content: 0,
        presentation: 0,
        relevance: 0,
        overall: 0
      };
    }

    const totals = feedback.reduce((acc, item) => ({
      content: acc.content + item.ratings.content,
      presentation: acc.presentation + item.ratings.presentation,
      relevance: acc.relevance + item.ratings.relevance,
      overall: acc.overall + item.ratings.overall
    }), { content: 0, presentation: 0, relevance: 0, overall: 0 });

    return {
      content: Math.round((totals.content / feedback.length) * 10) / 10,
      presentation: Math.round((totals.presentation / feedback.length) * 10) / 10,
      relevance: Math.round((totals.relevance / feedback.length) * 10) / 10,
      overall: Math.round((totals.overall / feedback.length) * 10) / 10
    };
  }

  analyzeSentiment(feedback) {
    const positive = feedback.filter(f => f.ratings.overall >= 4).length;
    const neutral = feedback.filter(f => f.ratings.overall === 3).length;
    const negative = feedback.filter(f => f.ratings.overall <= 2).length;
    const total = feedback.length || 1;

    return {
      positive: Math.round((positive / total) * 100),
      neutral: Math.round((neutral / total) * 100),
      negative: Math.round((negative / total) * 100)
    };
  }

  getOverallMetrics(sessions, attendees, feedback) {
    const key = this.getCacheKey('overallMetrics', sessions.length, attendees.length, feedback.length);
    const cached = this.getFromCache(key);
    if (cached) return cached;

    const metrics = aggregateMetrics(sessions, attendees, feedback);
    this.setCache(key, metrics);
    return metrics;
  }

  getRealtimeActivity(sessions, feedback, limit = 10) {
    return getRecentActivity(sessions, feedback, limit);
  }

  predictAttendance(session, historicalData = []) {
    const similarSessions = historicalData.filter(s => 
      s.speaker === session.speaker || 
      s.tags?.some(tag => session.tags?.includes(tag))
    );

    if (similarSessions.length === 0) {
      return Math.round(session.capacity * 0.7);
    }

    const avgAttendanceRate = similarSessions.reduce((sum, s) => 
      sum + (s.currentAttendance / s.capacity), 0
    ) / similarSessions.length;

    return Math.round(session.capacity * avgAttendanceRate);
  }

  calculateROI(sessions, feedback) {
    const totalAttendance = sessions.reduce((sum, s) => sum + s.currentAttendance, 0);
    const avgSatisfaction = feedback.length > 0
      ? feedback.reduce((sum, f) => sum + f.ratings.overall, 0) / feedback.length
      : 0;
    
    const engagementScore = sessions.reduce((sum, s) => sum + s.engagement, 0) / sessions.length;
    
    const roi = (totalAttendance * avgSatisfaction * engagementScore) / 100;
    
    return {
      score: Math.round(roi),
      totalAttendance,
      avgSatisfaction: Math.round(avgSatisfaction * 10) / 10,
      engagementScore: Math.round(engagementScore)
    };
  }

  getInsights(data) {
    const insights = [];
    
    const avgEngagement = data.metrics.avgEngagement;
    if (avgEngagement > 80) {
      insights.push({
        type: 'success',
        message: 'Excellent engagement levels across sessions',
        value: `${avgEngagement}%`
      });
    } else if (avgEngagement < 50) {
      insights.push({
        type: 'warning',
        message: 'Low engagement detected',
        value: `${avgEngagement}%`,
        action: 'Consider reviewing session content and delivery'
      });
    }
    
    const attendanceRate = Math.round(
      (data.sessions.reduce((sum, s) => sum + s.currentAttendance, 0) /
       data.sessions.reduce((sum, s) => sum + s.capacity, 0)) * 100
    );
    
    if (attendanceRate > 85) {
      insights.push({
        type: 'success',
        message: 'High attendance rate',
        value: `${attendanceRate}%`
      });
    } else if (attendanceRate < 60) {
      insights.push({
        type: 'warning',
        message: 'Below average attendance',
        value: `${attendanceRate}%`,
        action: 'Consider session scheduling and promotion'
      });
    }
    
    if (data.feedback.length > 50 && data.metrics.avgRating > 4) {
      insights.push({
        type: 'success',
        message: 'Excellent feedback ratings',
        value: `${data.metrics.avgRating}/5`
      });
    }
    
    const activeSessions = data.sessions.filter(s => s.status === 'active');
    if (activeSessions.length > 10) {
      insights.push({
        type: 'info',
        message: 'Multiple concurrent sessions',
        value: `${activeSessions.length} active`,
        action: 'Monitor resource allocation'
      });
    }
    
    return insights;
  }
}

const analyticsServiceInstance = new AnalyticsService();

export default analyticsServiceInstance;