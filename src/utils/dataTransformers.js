export const transformSessionsForChart = (sessions) => {
  return sessions.map(session => ({
    name: session.title.length > 30 
      ? session.title.substring(0, 27) + '...' 
      : session.title,
    attendance: session.currentAttendance,
    capacity: session.capacity,
    engagement: session.engagement,
    rate: session.attendanceRate
  }));
};

export const transformAttendanceTrends = (sessions) => {
  const hourlyData = {};
  
  sessions.forEach(session => {
    const hour = session.startHour;
    const hourKey = `${hour}:00`;
    
    if (!hourlyData[hourKey]) {
      hourlyData[hourKey] = {
        time: hourKey,
        attendance: 0,
        sessions: 0,
        avgEngagement: 0,
        totalEngagement: 0
      };
    }
    
    hourlyData[hourKey].attendance += session.currentAttendance;
    hourlyData[hourKey].sessions += 1;
    hourlyData[hourKey].totalEngagement += session.engagement;
  });
  
  return Object.entries(hourlyData)
    .map(([time, data]) => ({
      time,
      attendance: data.attendance,
      avgAttendance: Math.round(data.attendance / data.sessions),
      avgEngagement: Math.round(data.totalEngagement / data.sessions),
      sessions: data.sessions
    }))
    .sort((a, b) => {
      const hourA = parseInt(a.time);
      const hourB = parseInt(b.time);
      return hourA - hourB;
    });
};

export const transformSpeakerPerformance = (speakers, sessions) => {
  return speakers.map(speaker => {
    const speakerSessions = sessions.filter(s => s.speakerId === speaker.id);
    const totalAttendance = speakerSessions.reduce((sum, s) => sum + s.currentAttendance, 0);
    const avgEngagement = speakerSessions.length > 0
      ? Math.round(speakerSessions.reduce((sum, s) => sum + s.engagement, 0) / speakerSessions.length)
      : 0;
    
    const completedSessions = speakerSessions.filter(s => s.status === 'completed');
    const avgRating = completedSessions.length > 0
      ? Math.round(
          (completedSessions.reduce((sum, s) => sum + s.rating, 0) / completedSessions.length) * 10
        ) / 10
      : 0;
    
    return {
      id: speaker.id,
      name: speaker.name,
      title: speaker.title,
      company: speaker.company,
      sessions: speakerSessions.length,
      totalAttendance,
      avgEngagement,
      rating: avgRating || speaker.rating,
      performance: calculatePerformanceScore(avgEngagement, avgRating || speaker.rating, totalAttendance)
    };
  })
  .sort((a, b) => b.performance - a.performance);
};

const calculatePerformanceScore = (engagement, rating, attendance) => {
  const engagementWeight = 0.4;
  const ratingWeight = 0.4;
  const attendanceWeight = 0.2;
  
  const normalizedEngagement = engagement / 100;
  const normalizedRating = rating / 5;
  const normalizedAttendance = Math.min(attendance / 500, 1);
  
  return Math.round(
    (normalizedEngagement * engagementWeight +
     normalizedRating * ratingWeight +
     normalizedAttendance * attendanceWeight) * 100
  );
};

export const transformFeedbackData = (feedback) => {
  const ratingDistribution = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0
  };
  
  feedback.forEach(item => {
    const rating = Math.round(item.ratings.overall);
    if (rating >= 1 && rating <= 5) {
      ratingDistribution[rating]++;
    }
  });
  
  return Object.entries(ratingDistribution).map(([rating, count]) => ({
    rating: `${rating} Stars`,
    count,
    percentage: feedback.length > 0 
      ? Math.round((count / feedback.length) * 100)
      : 0
  }));
};

export const aggregateMetrics = (sessions, attendees, feedback) => {
  const activeSessions = sessions.filter(s => s.status === 'active');
  const completedSessions = sessions.filter(s => s.status === 'completed');
  
  const totalCapacity = sessions.reduce((sum, s) => sum + s.capacity, 0);
  const totalAttendance = sessions.reduce((sum, s) => sum + s.currentAttendance, 0);
  
  const avgEngagement = activeSessions.length > 0
    ? Math.round(activeSessions.reduce((sum, s) => sum + s.engagement, 0) / activeSessions.length)
    : 0;
  
  const avgRating = feedback.length > 0
    ? Math.round((feedback.reduce((sum, f) => sum + f.ratings.overall, 0) / feedback.length) * 10) / 10
    : 0;
  
  return {
    totalSessions: sessions.length,
    activeSessions: activeSessions.length,
    completedSessions: completedSessions.length,
    upcomingSessions: sessions.filter(s => s.status === 'upcoming').length,
    totalAttendees: attendees.length,
    totalCapacity,
    totalAttendance,
    overallAttendanceRate: Math.round((totalAttendance / totalCapacity) * 100),
    avgEngagement,
    totalFeedback: feedback.length,
    avgRating,
    satisfactionRate: Math.round(
      (feedback.filter(f => f.ratings.overall >= 4).length / feedback.length) * 100
    ) || 0
  };
};

export const getTopPerformingSessions = (sessions, limit = 5) => {
  return [...sessions]
    .map(session => ({
      ...session,
      score: (session.attendanceRate * 0.5) + (session.engagement * 0.3) + (session.rating * 20 * 0.2)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

export const getSessionsByTimeSlot = (sessions) => {
  const timeSlots = {
    morning: [],
    afternoon: [],
    evening: []
  };
  
  sessions.forEach(session => {
    if (session.startHour < 12) {
      timeSlots.morning.push(session);
    } else if (session.startHour < 17) {
      timeSlots.afternoon.push(session);
    } else {
      timeSlots.evening.push(session);
    }
  });
  
  return timeSlots;
};

export const calculateEngagementTrend = (sessions) => {
  const sortedSessions = [...sessions]
    .filter(s => s.status === 'completed')
    .sort((a, b) => a.startHour - b.startHour);
  
  if (sortedSessions.length < 2) {
    return 'stable';
  }
  
  const firstHalf = sortedSessions.slice(0, Math.floor(sortedSessions.length / 2));
  const secondHalf = sortedSessions.slice(Math.floor(sortedSessions.length / 2));
  
  const firstHalfAvg = firstHalf.reduce((sum, s) => sum + s.engagement, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, s) => sum + s.engagement, 0) / secondHalf.length;
  
  const difference = secondHalfAvg - firstHalfAvg;
  
  if (difference > 5) {
    return 'increasing';
  } else if (difference < -5) {
    return 'decreasing';
  } else {
    return 'stable';
  }
};

export const getRecentActivity = (sessions, feedback, limit = 10) => {
  const activities = [];
  
  sessions.forEach(session => {
    if (session.status === 'active') {
      activities.push({
        type: 'session_started',
        title: `${session.title} started`,
        description: `Speaker: ${session.speaker}`,
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        icon: '🎤',
        priority: 'high'
      });
    }
  });
  
  feedback.slice(-5).forEach(item => {
    activities.push({
      type: 'feedback_received',
      title: 'New feedback received',
      description: `Rating: ${item.ratings.overall}/5 stars`,
      timestamp: item.timestamp,
      icon: '⭐',
      priority: 'medium'
    });
  });
  
  return activities
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
};

export const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

export const formatNumber = (num) => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

export const getStatusColor = (status) => {
  const colors = {
    active: '#10b981',
    completed: '#6b7280',
    upcoming: '#3b82f6',
    cancelled: '#ef4444'
  };
  return colors[status] || '#6b7280';
};

export const getEngagementLevel = (engagement) => {
  if (engagement >= 80) {
    return { level: 'Excellent', color: '#10b981' };
  }
  if (engagement >= 60) {
    return { level: 'Good', color: '#3b82f6' };
  }
  if (engagement >= 40) {
    return { level: 'Fair', color: '#f59e0b' };
  }
  return { level: 'Low', color: '#ef4444' };
};