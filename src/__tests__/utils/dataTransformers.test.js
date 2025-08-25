/**
 * Unit Tests for Data Transformation Utilities
 * Module 2, Lesson 5: Testing Strategy
 * Tests data processing functions with comprehensive coverage
 */

import {
  transformSessionsForChart,
  transformAttendanceTrends,
  transformSpeakerPerformance,
  getTopPerformingSessions,
  calculateEngagementLevel,
  getSessionStatus,
  formatDuration,
  formatNumber,
  getStatusColor,
  generateActivityFeed,
  calculateAverageRating,
  getTimeSlotCategory,
  calculateCapacityPercentage,
  getEngagementTrend
} from '../../utils/dataTransformers';

describe('dataTransformers', () => {
  // Sample test data
  const mockSessions = [
    {
      id: 1,
      title: 'React Workshop',
      speaker: 'John Doe',
      room: 'Room A',
      startTime: '09:00',
      endTime: '10:30',
      attendees: 50,
      capacity: 100,
      engagement: 85,
      status: 'active',
      track: 'Frontend'
    },
    {
      id: 2,
      title: 'Node.js Basics',
      speaker: 'Jane Smith',
      room: 'Room B',
      startTime: '14:00',
      endTime: '15:30',
      attendees: 75,
      capacity: 100,
      engagement: 92,
      status: 'completed',
      track: 'Backend'
    },
    {
      id: 3,
      title: 'TypeScript Advanced',
      speaker: 'Bob Johnson',
      room: 'Room C',
      startTime: '16:00',
      endTime: '17:00',
      attendees: 30,
      capacity: 50,
      engagement: 70,
      status: 'upcoming',
      track: 'Frontend'
    }
  ];

  const mockSpeakers = [
    {
      id: 1,
      name: 'John Doe',
      role: 'Senior Developer',
      expertise: ['React', 'JavaScript'],
      rating: 4.5,
      sessionsCount: 3,
      totalAttendees: 150
    },
    {
      id: 2,
      name: 'Jane Smith',
      role: 'Tech Lead',
      expertise: ['Node.js', 'MongoDB'],
      rating: 4.8,
      sessionsCount: 2,
      totalAttendees: 120
    }
  ];

  describe('transformSessionsForChart', () => {
    it('should transform sessions for chart display', () => {
      const result = transformSessionsForChart(mockSessions);
      
      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('name', 'React Workshop');
      expect(result[0]).toHaveProperty('attendance', 50);
      expect(result[0]).toHaveProperty('capacity', 100);
      expect(result[0]).toHaveProperty('rate', 50);
      expect(result[0]).toHaveProperty('speaker', 'John Doe');
    });

    it('should handle empty sessions array', () => {
      const result = transformSessionsForChart([]);
      expect(result).toEqual([]);
    });

    it('should handle null/undefined input', () => {
      expect(transformSessionsForChart(null)).toEqual([]);
      expect(transformSessionsForChart(undefined)).toEqual([]);
    });

    it('should limit results when specified', () => {
      const result = transformSessionsForChart(mockSessions, 2);
      expect(result).toHaveLength(2);
    });
  });

  describe('transformAttendanceTrends', () => {
    it('should group sessions by time slots', () => {
      const result = transformAttendanceTrends(mockSessions);
      
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('time');
      expect(result[0]).toHaveProperty('attendance');
      expect(result[0]).toHaveProperty('engagement');
    });

    it('should handle empty sessions', () => {
      const result = transformAttendanceTrends([]);
      expect(result).toEqual([]);
    });

    it('should calculate averages correctly', () => {
      const sessionsWithSameTime = [
        { ...mockSessions[0], startTime: '09:00' },
        { ...mockSessions[1], startTime: '09:00', attendees: 100, engagement: 90 }
      ];
      
      const result = transformAttendanceTrends(sessionsWithSameTime);
      const nineAM = result.find(r => r.time === '09:00');
      
      expect(nineAM.attendance).toBe(75); // (50 + 100) / 2
      expect(nineAM.engagement).toBe(87.5); // (85 + 90) / 2
    });
  });

  describe('transformSpeakerPerformance', () => {
    it('should transform speaker data with performance metrics', () => {
      const result = transformSpeakerPerformance(mockSpeakers, mockSessions);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('performance');
      expect(result[0]).toHaveProperty('engagement');
      expect(result[0]).toHaveProperty('attendance');
      expect(result[0]).toHaveProperty('rating');
    });

    it('should calculate performance score correctly', () => {
      const result = transformSpeakerPerformance(mockSpeakers, mockSessions);
      const johnDoe = result.find(s => s.name === 'John Doe');
      
      expect(johnDoe.performance).toBeGreaterThan(0);
      expect(johnDoe.performance).toBeLessThanOrEqual(100);
    });

    it('should handle empty arrays', () => {
      expect(transformSpeakerPerformance([], [])).toEqual([]);
      expect(transformSpeakerPerformance(mockSpeakers, [])).toHaveLength(2);
      expect(transformSpeakerPerformance([], mockSessions)).toEqual([]);
    });
  });

  describe('getTopPerformingSessions', () => {
    it('should return top sessions by engagement', () => {
      const result = getTopPerformingSessions(mockSessions, 2);
      
      expect(result).toHaveLength(2);
      expect(result[0].engagement).toBe(92); // Highest engagement
      expect(result[1].engagement).toBe(85); // Second highest
    });

    it('should handle limit greater than array length', () => {
      const result = getTopPerformingSessions(mockSessions, 10);
      expect(result).toHaveLength(3);
    });

    it('should return empty array for empty input', () => {
      expect(getTopPerformingSessions([], 5)).toEqual([]);
    });
  });

  describe('calculateEngagementLevel', () => {
    it('should return correct engagement level', () => {
      expect(calculateEngagementLevel(95)).toBe('Excellent');
      expect(calculateEngagementLevel(85)).toBe('High');
      expect(calculateEngagementLevel(75)).toBe('Good');
      expect(calculateEngagementLevel(65)).toBe('Moderate');
      expect(calculateEngagementLevel(45)).toBe('Low');
    });

    it('should handle edge cases', () => {
      expect(calculateEngagementLevel(100)).toBe('Excellent');
      expect(calculateEngagementLevel(0)).toBe('Low');
      expect(calculateEngagementLevel(null)).toBe('Low');
      expect(calculateEngagementLevel(undefined)).toBe('Low');
    });
  });

  describe('getSessionStatus', () => {
    it('should determine session status based on time', () => {
      const now = new Date();
      const past = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
      const future = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
      
      const activeSession = {
        startTime: past.toISOString(),
        endTime: future.toISOString()
      };
      
      const upcomingSession = {
        startTime: future.toISOString(),
        endTime: new Date(future.getTime() + 60 * 60 * 1000).toISOString()
      };
      
      const completedSession = {
        startTime: new Date(past.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        endTime: past.toISOString()
      };
      
      expect(getSessionStatus(activeSession)).toBe('active');
      expect(getSessionStatus(upcomingSession)).toBe('upcoming');
      expect(getSessionStatus(completedSession)).toBe('completed');
    });

    it('should handle missing or invalid times', () => {
      expect(getSessionStatus({})).toBe('upcoming');
      expect(getSessionStatus({ startTime: 'invalid' })).toBe('upcoming');
    });
  });

  describe('formatDuration', () => {
    it('should format duration in minutes correctly', () => {
      expect(formatDuration(30)).toBe('30m');
      expect(formatDuration(90)).toBe('1h 30m');
      expect(formatDuration(120)).toBe('2h');
      expect(formatDuration(0)).toBe('0m');
    });

    it('should handle invalid input', () => {
      expect(formatDuration(null)).toBe('0m');
      expect(formatDuration(undefined)).toBe('0m');
      expect(formatDuration(-10)).toBe('0m');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(123)).toBe('123');
      expect(formatNumber(0)).toBe('0');
    });

    it('should handle invalid input', () => {
      expect(formatNumber(null)).toBe('0');
      expect(formatNumber(undefined)).toBe('0');
      expect(formatNumber('not a number')).toBe('0');
    });
  });

  describe('getStatusColor', () => {
    it('should return correct color for status', () => {
      expect(getStatusColor('active')).toBe('#ef4444');
      expect(getStatusColor('upcoming')).toBe('#3b82f6');
      expect(getStatusColor('completed')).toBe('#10b981');
      expect(getStatusColor('cancelled')).toBe('#6b7280');
    });

    it('should return default color for unknown status', () => {
      expect(getStatusColor('unknown')).toBe('#6b7280');
      expect(getStatusColor(null)).toBe('#6b7280');
    });
  });

  describe('generateActivityFeed', () => {
    it('should generate activity feed from sessions', () => {
      const result = generateActivityFeed(mockSessions);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      result.forEach(activity => {
        expect(activity).toHaveProperty('id');
        expect(activity).toHaveProperty('type');
        expect(activity).toHaveProperty('message');
        expect(activity).toHaveProperty('timestamp');
        expect(activity).toHaveProperty('icon');
      });
    });

    it('should handle empty sessions', () => {
      const result = generateActivityFeed([]);
      expect(result).toEqual([]);
    });

    it('should generate different activity types', () => {
      const result = generateActivityFeed(mockSessions);
      const types = result.map(a => a.type);
      
      // Should have variety of activity types
      expect(types.some(t => ['session_started', 'high_engagement', 'session_completed'].includes(t))).toBe(true);
    });
  });

  describe('calculateAverageRating', () => {
    it('should calculate average rating from feedback', () => {
      const feedback = [
        { ratings: { overall: 4 } },
        { ratings: { overall: 5 } },
        { ratings: { overall: 3 } }
      ];
      
      expect(calculateAverageRating(feedback)).toBe(4);
    });

    it('should handle empty feedback', () => {
      expect(calculateAverageRating([])).toBe(0);
      expect(calculateAverageRating(null)).toBe(0);
    });

    it('should handle missing ratings', () => {
      const feedback = [
        { ratings: { overall: 5 } },
        { ratings: {} },
        { }
      ];
      
      expect(calculateAverageRating(feedback)).toBe(5);
    });
  });

  describe('getTimeSlotCategory', () => {
    it('should categorize time slots correctly', () => {
      expect(getTimeSlotCategory('08:00')).toBe('Morning');
      expect(getTimeSlotCategory('09:30')).toBe('Morning');
      expect(getTimeSlotCategory('12:00')).toBe('Afternoon');
      expect(getTimeSlotCategory('14:30')).toBe('Afternoon');
      expect(getTimeSlotCategory('17:00')).toBe('Evening');
      expect(getTimeSlotCategory('19:00')).toBe('Evening');
    });

    it('should handle edge cases', () => {
      expect(getTimeSlotCategory('00:00')).toBe('Evening');
      expect(getTimeSlotCategory('23:59')).toBe('Evening');
      expect(getTimeSlotCategory('invalid')).toBe('Morning');
      expect(getTimeSlotCategory(null)).toBe('Morning');
    });
  });

  describe('calculateCapacityPercentage', () => {
    it('should calculate capacity percentage', () => {
      expect(calculateCapacityPercentage(50, 100)).toBe(50);
      expect(calculateCapacityPercentage(75, 100)).toBe(75);
      expect(calculateCapacityPercentage(100, 100)).toBe(100);
      expect(calculateCapacityPercentage(0, 100)).toBe(0);
    });

    it('should handle edge cases', () => {
      expect(calculateCapacityPercentage(150, 100)).toBe(150); // Over capacity
      expect(calculateCapacityPercentage(50, 0)).toBe(0); // Zero capacity
      expect(calculateCapacityPercentage(null, 100)).toBe(0);
      expect(calculateCapacityPercentage(50, null)).toBe(0);
    });
  });

  describe('getEngagementTrend', () => {
    it('should determine engagement trend', () => {
      const increasing = [60, 70, 80, 85, 90];
      const decreasing = [90, 85, 80, 70, 60];
      const stable = [75, 76, 75, 74, 75];
      
      expect(getEngagementTrend(increasing)).toBe('increasing');
      expect(getEngagementTrend(decreasing)).toBe('decreasing');
      expect(getEngagementTrend(stable)).toBe('stable');
    });

    it('should handle edge cases', () => {
      expect(getEngagementTrend([])).toBe('stable');
      expect(getEngagementTrend([80])).toBe('stable');
      expect(getEngagementTrend(null)).toBe('stable');
    });
  });
});