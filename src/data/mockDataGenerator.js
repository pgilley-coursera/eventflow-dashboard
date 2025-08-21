const SESSION_TOPICS = [
  'Keynote: Future of Web Development',
  'React Performance Optimization',
  'Building Scalable Microservices',
  'Cloud Native Architecture',
  'Machine Learning in JavaScript',
  'DevOps Best Practices',
  'Accessibility in Modern Web Apps',
  'State Management Patterns',
  'GraphQL vs REST APIs',
  'Security in Web Applications',
  'Progressive Web Apps',
  'Testing Strategies',
  'CI/CD Pipeline Design',
  'Kubernetes for Developers',
  'Serverless Architecture'
];

const SPEAKER_NAMES = [
  'Dr. Sarah Chen',
  'Michael Rodriguez',
  'Emily Johnson',
  'James Wilson',
  'Maria Garcia',
  'David Kim',
  'Lisa Anderson',
  'Robert Taylor',
  'Jennifer Martinez',
  'Christopher Lee',
  'Amanda White',
  'Daniel Brown',
  'Jessica Davis',
  'Matthew Miller',
  'Sophia Thompson'
];

const ROOM_NAMES = [
  'Main Auditorium',
  'Conference Room A',
  'Conference Room B',
  'Innovation Lab',
  'Workshop Space',
  'Tech Hub',
  'Collaboration Zone',
  'Virtual Studio'
];

const COMPANIES = [
  'TechCorp',
  'InnovateLabs',
  'CloudSystems',
  'DataDynamics',
  'WebWorks',
  'AppForge',
  'CodeCraft',
  'DigitalHub',
  'FutureTech',
  'SmartSoft'
];

const generateTimeSlot = (index) => {
  const startHour = 9 + Math.floor(index * 1.5);
  const startMinute = (index % 2) * 30;
  const endHour = startHour + 1;
  const endMinute = startMinute;
  
  const formatTime = (hour, minute) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };
  
  return {
    start: formatTime(startHour, startMinute),
    end: formatTime(endHour, endMinute),
    startHour,
    startMinute
  };
};

const generateSession = (id, index) => {
  const timeSlot = generateTimeSlot(index);
  const capacity = 50 + Math.floor(Math.random() * 150);
  const currentAttendance = Math.floor(capacity * (0.5 + Math.random() * 0.5));
  const speakerIndex = Math.floor(Math.random() * SPEAKER_NAMES.length);
  
  return {
    id: `session-${id}`,
    title: SESSION_TOPICS[index % SESSION_TOPICS.length],
    speaker: SPEAKER_NAMES[speakerIndex],
    speakerId: `speaker-${speakerIndex}`,
    room: ROOM_NAMES[Math.floor(Math.random() * ROOM_NAMES.length)],
    time: `${timeSlot.start} - ${timeSlot.end}`,
    startHour: timeSlot.startHour,
    startMinute: timeSlot.startMinute,
    duration: 60,
    capacity,
    currentAttendance,
    attendanceRate: Math.round((currentAttendance / capacity) * 100),
    engagement: 60 + Math.floor(Math.random() * 35),
    status: index < 4 ? 'completed' : index < 8 ? 'active' : 'upcoming',
    tags: ['Technology', 'Innovation', 'Workshop'].slice(0, 1 + Math.floor(Math.random() * 2)),
    description: `Join us for an engaging session on ${SESSION_TOPICS[index % SESSION_TOPICS.length]}. This session will cover key concepts and practical applications.`,
    rating: 3.5 + Math.random() * 1.5,
    feedback: []
  };
};

const generateSpeaker = (id, name) => {
  const totalSessions = 2 + Math.floor(Math.random() * 3);
  const totalAttendees = 100 + Math.floor(Math.random() * 400);
  const avgEngagement = 65 + Math.floor(Math.random() * 30);
  const rating = 3.5 + Math.random() * 1.5;
  
  return {
    id: `speaker-${id}`,
    name,
    title: ['Senior Developer', 'Tech Lead', 'Chief Architect', 'VP Engineering', 'CTO'][Math.floor(Math.random() * 5)],
    company: COMPANIES[Math.floor(Math.random() * COMPANIES.length)],
    bio: `${name} is an experienced technology professional with expertise in modern web development and cloud architecture.`,
    imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    sessions: totalSessions,
    totalAttendees,
    avgEngagement,
    rating,
    expertise: ['React', 'Node.js', 'Cloud', 'DevOps', 'Architecture'].slice(0, 2 + Math.floor(Math.random() * 2)),
    social: {
      twitter: `@${name.toLowerCase().replace(' ', '')}`,
      linkedin: `linkedin.com/in/${name.toLowerCase().replace(' ', '-')}`
    }
  };
};

const generateAttendee = (id) => {
  const firstName = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emily', 'Chris', 'Lisa'][Math.floor(Math.random() * 8)];
  const lastName = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'][Math.floor(Math.random() * 8)];
  const name = `${firstName} ${lastName}`;
  
  return {
    id: `attendee-${id}`,
    name,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    company: COMPANIES[Math.floor(Math.random() * COMPANIES.length)],
    role: ['Developer', 'Manager', 'Architect', 'Designer', 'Analyst'][Math.floor(Math.random() * 5)],
    registeredSessions: [],
    attendedSessions: [],
    engagementScore: 50 + Math.floor(Math.random() * 50),
    joinedAt: new Date(Date.now() - Math.random() * 7200000).toISOString()
  };
};

const generateFeedback = (sessionId, attendeeId, attendeeName) => {
  const ratings = {
    content: 3 + Math.floor(Math.random() * 3),
    presentation: 3 + Math.floor(Math.random() * 3),
    relevance: 3 + Math.floor(Math.random() * 3),
    overall: 3 + Math.floor(Math.random() * 3)
  };
  
  const comments = [
    'Great presentation! Very informative.',
    'Excellent content and delivery.',
    'Good session, could use more examples.',
    'Very engaging speaker.',
    'Helpful and practical information.',
    'Well organized and clear.',
    'Inspiring talk!',
    'Learned a lot of new concepts.'
  ];
  
  return {
    id: `feedback-${Date.now()}-${Math.random()}`,
    sessionId,
    attendeeId,
    attendeeName,
    ratings,
    comment: comments[Math.floor(Math.random() * comments.length)],
    timestamp: new Date().toISOString(),
    helpful: Math.floor(Math.random() * 20),
    verified: Math.random() > 0.2
  };
};

export const generateInitialData = () => {
  const sessions = [];
  const speakers = [];
  const attendees = [];
  const feedback = [];
  
  for (let i = 0; i < 15; i++) {
    sessions.push(generateSession(i + 1, i));
  }
  
  SPEAKER_NAMES.forEach((name, index) => {
    speakers.push(generateSpeaker(index, name));
  });
  
  for (let i = 0; i < 847; i++) {
    const attendee = generateAttendee(i + 1);
    
    const sessionCount = 2 + Math.floor(Math.random() * 4);
    const selectedSessions = [];
    for (let j = 0; j < sessionCount; j++) {
      const session = sessions[Math.floor(Math.random() * sessions.length)];
      if (!selectedSessions.includes(session.id)) {
        selectedSessions.push(session.id);
        attendee.registeredSessions.push(session.id);
        
        if (session.status === 'completed' && Math.random() > 0.2) {
          attendee.attendedSessions.push(session.id);
          
          if (Math.random() > 0.6) {
            feedback.push(generateFeedback(session.id, attendee.id, attendee.name));
          }
        }
      }
    }
    
    attendees.push(attendee);
  }
  
  sessions.forEach(session => {
    session.feedback = feedback
      .filter(f => f.sessionId === session.id)
      .slice(0, 5);
  });
  
  return {
    sessions,
    speakers,
    attendees,
    feedback,
    metrics: {
      totalSessions: sessions.length,
      activeSessions: sessions.filter(s => s.status === 'active').length,
      totalAttendees: attendees.length,
      avgEngagement: Math.round(
        sessions.reduce((sum, s) => sum + s.engagement, 0) / sessions.length
      ),
      totalFeedback: feedback.length,
      avgRating: Math.round(
        (feedback.reduce((sum, f) => sum + f.ratings.overall, 0) / feedback.length) * 10
      ) / 10
    },
    lastUpdated: new Date().toISOString()
  };
};

export const getSessionsByStatus = (sessions, status) => {
  return sessions.filter(session => session.status === status);
};

export const getTopSessions = (sessions, limit = 5) => {
  return [...sessions]
    .sort((a, b) => b.currentAttendance - a.currentAttendance)
    .slice(0, limit);
};

export const getSpeakerStats = (speakers, sessions) => {
  return speakers.map(speaker => {
    const speakerSessions = sessions.filter(s => s.speakerId === speaker.id);
    const totalAttendance = speakerSessions.reduce((sum, s) => sum + s.currentAttendance, 0);
    const avgEngagement = speakerSessions.length > 0
      ? Math.round(speakerSessions.reduce((sum, s) => sum + s.engagement, 0) / speakerSessions.length)
      : 0;
    
    return {
      ...speaker,
      sessionCount: speakerSessions.length,
      totalAttendance,
      avgEngagement
    };
  });
};

export const getAttendanceTrends = (sessions) => {
  const hourlyData = {};
  
  sessions.forEach(session => {
    const hour = session.startHour;
    if (!hourlyData[hour]) {
      hourlyData[hour] = {
        hour: `${hour}:00`,
        attendance: 0,
        sessions: 0
      };
    }
    hourlyData[hour].attendance += session.currentAttendance;
    hourlyData[hour].sessions += 1;
  });
  
  return Object.values(hourlyData)
    .sort((a, b) => parseInt(a.hour) - parseInt(b.hour))
    .map(data => ({
      ...data,
      avgAttendance: Math.round(data.attendance / data.sessions)
    }));
};