/**
 * Unit Tests for Analytics Service
 * Module 2, Lesson 5: Testing Strategy
 * Tests analytics calculations and data processing
 */

import analyticsService from '../../services/analyticsService';

describe('analyticsService', () => {
  // Mock data
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
      status: 'completed',
      track: 'Frontend',
      feedback: [
        { rating: 4.5, comment: 'Great workshop!' },
        { rating: 5, comment: 'Excellent content' }
      ]
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
      status: 'active',
      track: 'Backend',
      feedback: [
        { rating: 4, comment: 'Good session' }
      ]
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
      track: 'Frontend',
      feedback: []
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

  const mockFeedback = [
    {
      id: 1,
      sessionId: 1,
      attendeeId: 'a1',
      attendeeName: 'Alice',
      ratings: {
        overall: 5,
        content: 5,
        delivery: 4,
        venue: 4
      },
      comment: 'Excellent workshop!',
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      sessionId: 1,
      attendeeId: 'a2',
      attendeeName: 'Bob',
      ratings: {
        overall: 4,
        content: 4,
        delivery: 4,
        venue: 5
      },
      comment: 'Very informative',
      timestamp: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    // Clear cache before each test
    analyticsService.clearCache();
  });

  describe('getSessionAnalytics', () => {
    it('should return comprehensive session analytics', async () => {
      const result = await analyticsService.getSessionAnalytics(mockSessions);
      
      expect(result).toHaveProperty('totalSessions');
      expect(result).toHaveProperty('activeSessions');
      expect(result).toHaveProperty('completedSessions');
      expect(result).toHaveProperty('upcomingSessions');
      expect(result).toHaveProperty('totalAttendees');
      expect(result).toHaveProperty('averageAttendance');
      expect(result).toHaveProperty('averageEngagement');
      expect(result).toHaveProperty('capacityUtilization');
      expect(result).toHaveProperty('topSessions');
      expect(result).toHaveProperty('lowEngagementSessions');
    });

    it('should calculate metrics correctly', async () => {
      const result = await analyticsService.getSessionAnalytics(mockSessions);
      
      expect(result.totalSessions).toBe(3);
      expect(result.activeSessions).toBe(1);
      expect(result.completedSessions).toBe(1);
      expect(result.upcomingSessions).toBe(1);
      expect(result.totalAttendees).toBe(155); // 50 + 75 + 30
      expect(result.averageAttendance).toBeCloseTo(51.67, 1);
      expect(result.averageEngagement).toBeCloseTo(82.33, 1);
    });

    it('should identify top performing sessions', async () => {
      const result = await analyticsService.getSessionAnalytics(mockSessions);
      
      expect(result.topSessions).toHaveLength(3);
      expect(result.topSessions[0].engagement).toBe(92); // Highest engagement
    });

    it('should identify low engagement sessions', async () => {
      const result = await analyticsService.getSessionAnalytics(mockSessions);
      
      expect(result.lowEngagementSessions).toHaveLength(1);
      expect(result.lowEngagementSessions[0].engagement).toBe(70);
    });

    it('should handle empty sessions array', async () => {
      const result = await analyticsService.getSessionAnalytics([]);
      
      expect(result.totalSessions).toBe(0);
      expect(result.totalAttendees).toBe(0);
      expect(result.averageAttendance).toBe(0);
      expect(result.topSessions).toEqual([]);
    });

    it('should use cache for repeated calls', async () => {
      const spy = jest.spyOn(analyticsService, 'calculateSessionStats');
      
      // First call - should calculate
      await analyticsService.getSessionAnalytics(mockSessions);
      expect(spy).toHaveBeenCalledTimes(1);
      
      // Second call - should use cache
      await analyticsService.getSessionAnalytics(mockSessions);
      expect(spy).toHaveBeenCalledTimes(1);
      
      spy.mockRestore();
    });
  });

  describe('getSpeakerAnalytics', () => {
    it('should return speaker performance analytics', async () => {
      const result = await analyticsService.getSpeakerAnalytics(mockSpeakers, mockSessions);
      
      expect(result).toHaveProperty('totalSpeakers');
      expect(result).toHaveProperty('averageRating');
      expect(result).toHaveProperty('topPerformers');
      expect(result).toHaveProperty('speakerComparison');
      expect(result).toHaveProperty('expertiseDistribution');
    });

    it('should identify top performers', async () => {
      const result = await analyticsService.getSpeakerAnalytics(mockSpeakers, mockSessions);
      
      expect(result.topPerformers).toHaveLength(2);
      expect(result.topPerformers[0].rating).toBe(4.8); // Jane Smith has highest rating
    });

    it('should calculate expertise distribution', async () => {
      const result = await analyticsService.getSpeakerAnalytics(mockSpeakers, mockSessions);
      
      expect(result.expertiseDistribution).toHaveProperty('React');
      expect(result.expertiseDistribution).toHaveProperty('Node.js');
      expect(result.expertiseDistribution['React']).toBe(1);
    });

    it('should handle empty arrays', async () => {
      const result = await analyticsService.getSpeakerAnalytics([], []);
      
      expect(result.totalSpeakers).toBe(0);
      expect(result.averageRating).toBe(0);
      expect(result.topPerformers).toEqual([]);
    });
  });

  describe('getFeedbackAnalytics', () => {
    it('should analyze feedback data', async () => {
      const result = await analyticsService.getFeedbackAnalytics(mockFeedback);
      
      expect(result).toHaveProperty('totalFeedback');
      expect(result).toHaveProperty('averageRating');
      expect(result).toHaveProperty('ratingDistribution');
      expect(result).toHaveProperty('sentimentAnalysis');
      expect(result).toHaveProperty('topComments');
      expect(result).toHaveProperty('improvementAreas');
    });

    it('should calculate rating distribution', async () => {
      const result = await analyticsService.getFeedbackAnalytics(mockFeedback);
      
      expect(result.ratingDistribution).toHaveProperty('5');
      expect(result.ratingDistribution).toHaveProperty('4');
      expect(result.ratingDistribution['5']).toBe(1);
      expect(result.ratingDistribution['4']).toBe(1);
    });

    it('should perform sentiment analysis', async () => {
      const result = await analyticsService.getFeedbackAnalytics(mockFeedback);
      
      expect(result.sentimentAnalysis).toHaveProperty('positive');
      expect(result.sentimentAnalysis).toHaveProperty('neutral');
      expect(result.sentimentAnalysis).toHaveProperty('negative');
      expect(result.sentimentAnalysis.positive).toBeGreaterThan(0);
    });

    it('should identify improvement areas', async () => {
      const feedbackWithIssues = [
        ...mockFeedback,
        {
          id: 3,
          ratings: { overall: 2, content: 2, delivery: 3 },
          comment: 'Need better audio system'
        }
      ];
      
      const result = await analyticsService.getFeedbackAnalytics(feedbackWithIssues);
      expect(result.improvementAreas.length).toBeGreaterThan(0);
    });
  });

  describe('getROIAnalytics', () => {
    it('should calculate ROI metrics', async () => {
      const result = await analyticsService.getROIAnalytics(mockSessions, { costPerSession: 1000 });
      
      expect(result).toHaveProperty('totalCost');
      expect(result).toHaveProperty('costPerAttendee');
      expect(result).toHaveProperty('engagementROI');
      expect(result).toHaveProperty('capacityEfficiency');
      expect(result).toHaveProperty('valueScore');
    });

    it('should calculate costs correctly', async () => {
      const result = await analyticsService.getROIAnalytics(mockSessions, { costPerSession: 1000 });
      
      expect(result.totalCost).toBe(3000); // 3 sessions * 1000
      expect(result.costPerAttendee).toBeCloseTo(19.35, 1); // 3000 / 155
    });

    it('should calculate engagement ROI', async () => {
      const result = await analyticsService.getROIAnalytics(mockSessions, { costPerSession: 1000 });
      
      expect(result.engagementROI).toBeGreaterThan(0);
      expect(result.engagementROI).toBeLessThanOrEqual(100);
    });
  });

  describe('getPredictiveAnalytics', () => {
    it('should generate predictions', async () => {
      const result = await analyticsService.getPredictiveAnalytics(mockSessions);
      
      expect(result).toHaveProperty('expectedAttendance');
      expect(result).toHaveProperty('peakTimes');
      expect(result).toHaveProperty('recommendedCapacity');
      expect(result).toHaveProperty('engagementForecast');
    });

    it('should predict peak times', async () => {
      const result = await analyticsService.getPredictiveAnalytics(mockSessions);
      
      expect(Array.isArray(result.peakTimes)).toBe(true);
      expect(result.peakTimes.length).toBeGreaterThan(0);
      
      result.peakTimes.forEach(time => {
        expect(time).toHaveProperty('time');
        expect(time).toHaveProperty('expectedAttendance');
      });
    });

    it('should recommend capacity', async () => {
      const result = await analyticsService.getPredictiveAnalytics(mockSessions);
      
      expect(result.recommendedCapacity).toHaveProperty('small');
      expect(result.recommendedCapacity).toHaveProperty('medium');
      expect(result.recommendedCapacity).toHaveProperty('large');
    });
  });

  describe('getInsights', () => {
    it('should generate actionable insights', async () => {
      const data = {
        sessions: mockSessions,
        speakers: mockSpeakers,
        feedback: mockFeedback
      };
      
      const result = await analyticsService.getInsights(data);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      result.forEach(insight => {
        expect(insight).toHaveProperty('type');
        expect(insight).toHaveProperty('priority');
        expect(insight).toHaveProperty('message');
        expect(insight).toHaveProperty('action');
      });
    });

    it('should prioritize insights', async () => {
      const data = {
        sessions: mockSessions,
        speakers: mockSpeakers,
        feedback: mockFeedback
      };
      
      const result = await analyticsService.getInsights(data);
      const priorities = result.map(i => i.priority);
      
      expect(priorities.some(p => p === 'high')).toBe(true);
    });

    it('should identify trends', async () => {
      const data = {
        sessions: mockSessions,
        speakers: mockSpeakers,
        feedback: mockFeedback
      };
      
      const result = await analyticsService.getInsights(data);
      const trends = result.filter(i => i.type === 'trend');
      
      expect(trends.length).toBeGreaterThan(0);
    });
  });

  describe('getRealTimeActivity', () => {
    it('should generate real-time activity feed', async () => {
      const result = await analyticsService.getRealTimeActivity(mockSessions);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      result.forEach(activity => {
        expect(activity).toHaveProperty('id');
        expect(activity).toHaveProperty('type');
        expect(activity).toHaveProperty('message');
        expect(activity).toHaveProperty('timestamp');
        expect(activity).toHaveProperty('priority');
      });
    });

    it('should order activities by timestamp', async () => {
      const result = await analyticsService.getRealTimeActivity(mockSessions);
      
      for (let i = 1; i < result.length; i++) {
        const prevTime = new Date(result[i - 1].timestamp).getTime();
        const currTime = new Date(result[i].timestamp).getTime();
        expect(prevTime).toBeGreaterThanOrEqual(currTime);
      }
    });
  });

  describe('cache management', () => {
    it('should cache results for performance', async () => {
      const start = Date.now();
      await analyticsService.getSessionAnalytics(mockSessions);
      const firstCallTime = Date.now() - start;
      
      const cachedStart = Date.now();
      await analyticsService.getSessionAnalytics(mockSessions);
      const cachedCallTime = Date.now() - cachedStart;
      
      expect(cachedCallTime).toBeLessThan(firstCallTime);
    });

    it('should clear cache when requested', async () => {
      await analyticsService.getSessionAnalytics(mockSessions);
      analyticsService.clearCache();
      
      const spy = jest.spyOn(analyticsService, 'calculateSessionStats');
      await analyticsService.getSessionAnalytics(mockSessions);
      
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should expire cache after timeout', async () => {
      jest.useFakeTimers();
      
      await analyticsService.getSessionAnalytics(mockSessions);
      
      // Advance time beyond cache timeout (5 seconds)
      jest.advanceTimersByTime(6000);
      
      const spy = jest.spyOn(analyticsService, 'calculateSessionStats');
      await analyticsService.getSessionAnalytics(mockSessions);
      
      expect(spy).toHaveBeenCalled();
      
      spy.mockRestore();
      jest.useRealTimers();
    });
  });
});