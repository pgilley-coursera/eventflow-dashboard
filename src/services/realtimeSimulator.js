import { generateInitialData } from '../data/mockDataGenerator';

class RealtimeSimulator {
  constructor() {
    this.data = generateInitialData();
    this.subscribers = new Set();
    this.updateInterval = null;
    this.isRunning = false;
    this.updateCount = 0;
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    callback(this.data);
    
    return () => {
      this.subscribers.delete(callback);
    };
  }

  notifySubscribers() {
    const dataWithTimestamp = {
      ...this.data,
      lastUpdated: new Date().toISOString(),
      updateCount: this.updateCount
    };
    
    this.subscribers.forEach(callback => {
      try {
        callback(dataWithTimestamp);
      } catch (error) {
        console.error('Error notifying subscriber:', error);
      }
    });
  }

  simulateAttendanceChange() {
    const activeSessions = this.data.sessions.filter(s => s.status === 'active');
    
    activeSessions.forEach(session => {
      const changeType = Math.random();
      
      if (changeType < 0.6) {
        const maxIncrease = Math.min(5, session.capacity - session.currentAttendance);
        const change = Math.floor(Math.random() * maxIncrease);
        session.currentAttendance = Math.min(session.capacity, session.currentAttendance + change);
      } else if (changeType < 0.8) {
        const maxDecrease = Math.min(3, session.currentAttendance);
        const change = Math.floor(Math.random() * maxDecrease);
        session.currentAttendance = Math.max(0, session.currentAttendance - change);
      }
      
      session.attendanceRate = Math.round((session.currentAttendance / session.capacity) * 100);
    });
  }

  simulateEngagementFluctuation() {
    this.data.sessions.forEach(session => {
      if (session.status === 'active') {
        const fluctuation = (Math.random() - 0.5) * 10;
        session.engagement = Math.max(0, Math.min(100, session.engagement + fluctuation));
        session.engagement = Math.round(session.engagement);
      }
    });
    
    this.data.metrics.avgEngagement = Math.round(
      this.data.sessions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => sum + s.engagement, 0) / 
      this.data.sessions.filter(s => s.status === 'active').length || 1
    );
  }

  simulateNewFeedback() {
    if (Math.random() < 0.3) {
      const completedSessions = this.data.sessions.filter(s => s.status === 'completed');
      if (completedSessions.length > 0) {
        const session = completedSessions[Math.floor(Math.random() * completedSessions.length)];
        const attendeeIndex = Math.floor(Math.random() * 100);
        
        const feedback = {
          id: `feedback-${Date.now()}-${Math.random()}`,
          sessionId: session.id,
          attendeeId: `attendee-${attendeeIndex}`,
          attendeeName: `User ${attendeeIndex}`,
          ratings: {
            content: 3 + Math.floor(Math.random() * 3),
            presentation: 3 + Math.floor(Math.random() * 3),
            relevance: 3 + Math.floor(Math.random() * 3),
            overall: 3 + Math.floor(Math.random() * 3)
          },
          comment: [
            'Excellent presentation!',
            'Very informative session.',
            'Great insights shared.',
            'Well structured content.',
            'Engaging speaker!'
          ][Math.floor(Math.random() * 5)],
          timestamp: new Date().toISOString(),
          helpful: Math.floor(Math.random() * 10),
          verified: true
        };
        
        this.data.feedback.push(feedback);
        session.feedback.unshift(feedback);
        session.feedback = session.feedback.slice(0, 5);
        
        this.data.metrics.totalFeedback = this.data.feedback.length;
        this.data.metrics.avgRating = Math.round(
          (this.data.feedback.reduce((sum, f) => sum + f.ratings.overall, 0) / 
           this.data.feedback.length) * 10
        ) / 10;
      }
    }
  }

  simulateSessionStatusChange() {
    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();
    
    this.data.sessions.forEach(session => {
      if (session.status === 'upcoming') {
        const sessionTime = currentHour + (currentMinute / 60);
        const sessionStart = session.startHour + (session.startMinute / 60);
        
        if (sessionTime >= sessionStart) {
          session.status = 'active';
          session.currentAttendance = Math.floor(session.capacity * 0.3);
          session.attendanceRate = Math.round((session.currentAttendance / session.capacity) * 100);
        }
      } else if (session.status === 'active') {
        const sessionTime = currentHour + (currentMinute / 60);
        const sessionEnd = session.startHour + 1 + (session.startMinute / 60);
        
        if (sessionTime >= sessionEnd) {
          session.status = 'completed';
        }
      }
    });
    
    this.data.metrics.activeSessions = this.data.sessions.filter(s => s.status === 'active').length;
  }

  simulateNewAttendee() {
    if (Math.random() < 0.1) {
      const newAttendee = {
        id: `attendee-${this.data.attendees.length + 1}`,
        name: `New User ${this.data.attendees.length + 1}`,
        email: `user${this.data.attendees.length + 1}@example.com`,
        company: 'TechCorp',
        role: 'Developer',
        registeredSessions: [],
        attendedSessions: [],
        engagementScore: 50 + Math.floor(Math.random() * 50),
        joinedAt: new Date().toISOString()
      };
      
      const upcomingSessions = this.data.sessions.filter(s => s.status === 'upcoming');
      if (upcomingSessions.length > 0) {
        const session = upcomingSessions[Math.floor(Math.random() * upcomingSessions.length)];
        newAttendee.registeredSessions.push(session.id);
      }
      
      this.data.attendees.push(newAttendee);
      this.data.metrics.totalAttendees = this.data.attendees.length;
    }
  }

  performUpdate() {
    this.updateCount++;
    
    this.simulateAttendanceChange();
    this.simulateEngagementFluctuation();
    this.simulateNewFeedback();
    this.simulateSessionStatusChange();
    this.simulateNewAttendee();
    
    this.notifySubscribers();
  }

  start(intervalMs = 5000) {
    if (this.isRunning) {
      console.warn('Realtime simulator is already running');
      return;
    }
    
    this.isRunning = true;
    this.updateInterval = setInterval(() => {
      this.performUpdate();
    }, intervalMs);
    
    console.log(`Realtime simulator started with ${intervalMs}ms interval`);
  }

  stop() {
    if (!this.isRunning) {
      console.warn('Realtime simulator is not running');
      return;
    }
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    this.isRunning = false;
    console.log('Realtime simulator stopped');
  }

  reset() {
    this.stop();
    this.data = generateInitialData();
    this.updateCount = 0;
    this.notifySubscribers();
  }

  getData() {
    return { ...this.data };
  }

  getMetrics() {
    return { ...this.data.metrics };
  }

  getSessions() {
    return [...this.data.sessions];
  }

  getSpeakers() {
    return [...this.data.speakers];
  }

  getAttendees() {
    return [...this.data.attendees];
  }

  getFeedback() {
    return [...this.data.feedback];
  }
}

const simulatorInstance = new RealtimeSimulator();

export default simulatorInstance;