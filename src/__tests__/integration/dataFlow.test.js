/**
 * Integration Tests for Data Flow
 * Module 2, Lesson 5: Testing Strategy
 * Tests data update flows, filtering, and state management
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../../components/layout/Dashboard';
import SessionList from '../../components/sessions/SessionList';
import { useRealtimeData } from '../../hooks/useRealtimeData';

// Mock the useRealtimeData hook
jest.mock('../../hooks/useRealtimeData');

// Mock the analytics service
jest.mock('../../services/analyticsService', () => ({
  __esModule: true,
  default: {
    getSessionAnalytics: jest.fn().mockResolvedValue({
      totalSessions: 10,
      activeSessions: 3,
      completedSessions: 5,
      upcomingSessions: 2,
      totalAttendees: 500,
      averageAttendance: 50,
      averageEngagement: 85,
      capacityUtilization: 75,
      topSessions: [],
      lowEngagementSessions: []
    }),
    getSpeakerAnalytics: jest.fn().mockResolvedValue({
      totalSpeakers: 5,
      averageRating: 4.5,
      topPerformers: [],
      speakerComparison: [],
      expertiseDistribution: {}
    }),
    getFeedbackAnalytics: jest.fn().mockResolvedValue({
      totalFeedback: 100,
      averageRating: 4.3,
      ratingDistribution: {},
      sentimentAnalysis: { positive: 80, neutral: 15, negative: 5 },
      topComments: [],
      improvementAreas: []
    }),
    clearCache: jest.fn()
  }
}));

describe('Data Flow Integration', () => {
  const mockData = {
    sessions: [
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
    ],
    speakers: [
      { id: 1, name: 'John Doe', rating: 4.5 },
      { id: 2, name: 'Jane Smith', rating: 4.8 }
    ],
    metrics: {
      activeSessions: 1,
      totalAttendees: 155,
      avgEngagement: 82,
      avgRating: 4.5
    },
    lastUpdated: new Date().toISOString(),
    updateCount: 1
  };

  beforeEach(() => {
    useRealtimeData.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      startSimulator: jest.fn(),
      stopSimulator: jest.fn(),
      resetSimulator: jest.fn(),
      isSimulatorRunning: true
    });
  });

  describe('Dashboard Data Flow', () => {
    it('should display real-time data in dashboard', async () => {
      render(<Dashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('EventFlow Analytics Dashboard')).toBeInTheDocument();
      });

      // Check metrics are displayed
      expect(screen.getByText('1')).toBeInTheDocument(); // Active sessions
      expect(screen.getByText('155')).toBeInTheDocument(); // Total attendees
    });

    it('should update when data changes', async () => {
      const { rerender } = render(<Dashboard />);
      
      // Initial render
      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument();
      });

      // Update mock data
      const updatedData = {
        ...mockData,
        metrics: {
          ...mockData.metrics,
          activeSessions: 5
        }
      };

      useRealtimeData.mockReturnValue({
        data: updatedData,
        isLoading: false,
        error: null
      });

      rerender(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('5')).toBeInTheDocument();
      });
    });

    it('should handle loading state', () => {
      useRealtimeData.mockReturnValue({
        data: null,
        isLoading: true,
        error: null
      });

      render(<Dashboard />);
      
      expect(screen.getAllByTestId('skeleton-loader')).toHaveLength(4); // Metric cards
    });

    it('should handle error state', () => {
      useRealtimeData.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to load data')
      });

      render(<Dashboard />);
      
      expect(screen.getByText(/Error loading dashboard/)).toBeInTheDocument();
      expect(screen.getByText(/Failed to load data/)).toBeInTheDocument();
    });
  });

  describe('SessionList Filtering', () => {
    it('should filter sessions by search term', async () => {
      render(<SessionList sessions={mockData.sessions} />);
      
      // All sessions visible initially
      expect(screen.getByText('React Workshop')).toBeInTheDocument();
      expect(screen.getByText('Node.js Basics')).toBeInTheDocument();
      expect(screen.getByText('TypeScript Advanced')).toBeInTheDocument();

      // Search for 'React'
      const searchInput = screen.getByPlaceholderText(/Search sessions/i);
      fireEvent.change(searchInput, { target: { value: 'React' } });

      await waitFor(() => {
        expect(screen.getByText('React Workshop')).toBeInTheDocument();
        expect(screen.queryByText('Node.js Basics')).not.toBeInTheDocument();
        expect(screen.queryByText('TypeScript Advanced')).not.toBeInTheDocument();
      });
    });

    it('should filter sessions by status', async () => {
      render(<SessionList sessions={mockData.sessions} />);
      
      // Click on 'Active' filter
      const activeFilter = screen.getByRole('button', { name: /Active/i });
      fireEvent.click(activeFilter);

      await waitFor(() => {
        expect(screen.getByText('React Workshop')).toBeInTheDocument();
        expect(screen.queryByText('Node.js Basics')).not.toBeInTheDocument();
        expect(screen.queryByText('TypeScript Advanced')).not.toBeInTheDocument();
      });
    });

    it('should sort sessions by different criteria', async () => {
      render(<SessionList sessions={mockData.sessions} />);
      
      // Sort by engagement
      const sortSelect = screen.getByLabelText(/Sort by/i);
      fireEvent.change(sortSelect, { target: { value: 'engagement' } });

      await waitFor(() => {
        const sessionCards = screen.getAllByRole('article');
        const firstSession = within(sessionCards[0]).getByText('Node.js Basics');
        expect(firstSession).toBeInTheDocument(); // Highest engagement (92%)
      });
    });

    it('should combine search and filter', async () => {
      render(<SessionList sessions={mockData.sessions} />);
      
      // Search for 'Frontend' track
      const searchInput = screen.getByPlaceholderText(/Search sessions/i);
      fireEvent.change(searchInput, { target: { value: 'Frontend' } });

      // Filter by upcoming
      const upcomingFilter = screen.getByRole('button', { name: /Upcoming/i });
      fireEvent.click(upcomingFilter);

      await waitFor(() => {
        expect(screen.getByText('TypeScript Advanced')).toBeInTheDocument();
        expect(screen.queryByText('React Workshop')).not.toBeInTheDocument();
      });
    });
  });

  describe('Real-time Updates', () => {
    it('should add new sessions dynamically', async () => {
      const { rerender } = render(<SessionList sessions={mockData.sessions} />);
      
      expect(screen.getAllByRole('article')).toHaveLength(3);

      // Add new session
      const updatedSessions = [
        ...mockData.sessions,
        {
          id: 4,
          title: 'Vue.js Introduction',
          speaker: 'Alice Brown',
          status: 'upcoming'
        }
      ];

      rerender(<SessionList sessions={updatedSessions} />);

      await waitFor(() => {
        expect(screen.getAllByRole('article')).toHaveLength(4);
        expect(screen.getByText('Vue.js Introduction')).toBeInTheDocument();
      });
    });

    it('should update session status in real-time', async () => {
      const { rerender } = render(<SessionList sessions={mockData.sessions} />);
      
      // Check initial status
      const reactCard = screen.getByText('React Workshop').closest('article');
      expect(within(reactCard).getByText(/Active/i)).toBeInTheDocument();

      // Update session status
      const updatedSessions = mockData.sessions.map(session =>
        session.id === 1
          ? { ...session, status: 'completed' }
          : session
      );

      rerender(<SessionList sessions={updatedSessions} />);

      await waitFor(() => {
        const updatedCard = screen.getByText('React Workshop').closest('article');
        expect(within(updatedCard).getByText(/Completed/i)).toBeInTheDocument();
      });
    });

    it('should update metrics when sessions change', async () => {
      const { rerender } = render(<Dashboard />);
      
      // Initial active sessions
      expect(screen.getByText('1')).toBeInTheDocument();

      // Update to have more active sessions
      const updatedData = {
        ...mockData,
        sessions: mockData.sessions.map(session => ({
          ...session,
          status: 'active'
        })),
        metrics: {
          ...mockData.metrics,
          activeSessions: 3
        }
      };

      useRealtimeData.mockReturnValue({
        data: updatedData,
        isLoading: false,
        error: null
      });

      rerender(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('should handle session selection', async () => {
      const onSessionClick = jest.fn();
      render(
        <SessionList 
          sessions={mockData.sessions} 
          onSessionClick={onSessionClick}
        />
      );
      
      const sessionCard = screen.getByText('React Workshop').closest('article');
      fireEvent.click(sessionCard);

      expect(onSessionClick).toHaveBeenCalledWith(mockData.sessions[0]);
    });

    it('should clear filters', async () => {
      render(<SessionList sessions={mockData.sessions} />);
      
      // Apply search filter
      const searchInput = screen.getByPlaceholderText(/Search sessions/i);
      fireEvent.change(searchInput, { target: { value: 'React' } });

      // Only one session visible
      expect(screen.getAllByRole('article')).toHaveLength(1);

      // Clear filters
      const clearButton = screen.getByRole('button', { name: /Clear/i });
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(screen.getAllByRole('article')).toHaveLength(3);
      });
    });

    it('should paginate large session lists', async () => {
      // Create 20 sessions for pagination
      const manySessions = Array.from({ length: 20 }, (_, i) => ({
        ...mockData.sessions[0],
        id: i + 1,
        title: `Session ${i + 1}`
      }));

      render(<SessionList sessions={manySessions} itemsPerPage={10} />);
      
      // First page shows 10 items
      expect(screen.getAllByRole('article')).toHaveLength(10);
      
      // Navigate to second page
      const nextButton = screen.getByRole('button', { name: /Next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Session 11')).toBeInTheDocument();
      });
    });
  });

  describe('Performance Monitoring', () => {
    it('should track component render times', async () => {
      const performanceMark = jest.spyOn(performance, 'mark');
      const performanceMeasure = jest.spyOn(performance, 'measure');

      render(<Dashboard />);

      await waitFor(() => {
        expect(performanceMark).toHaveBeenCalledWith(expect.stringContaining('render-start'));
        expect(performanceMeasure).toHaveBeenCalledWith(
          expect.stringContaining('render-time'),
          expect.any(String),
          expect.any(String)
        );
      });

      performanceMark.mockRestore();
      performanceMeasure.mockRestore();
    });
  });

  describe('Accessibility in Data Flow', () => {
    it('should announce data updates to screen readers', async () => {
      const { rerender } = render(<Dashboard />);
      
      // Check for live region
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toBeInTheDocument();

      // Update data
      const updatedData = {
        ...mockData,
        metrics: {
          ...mockData.metrics,
          totalAttendees: 200
        }
      };

      useRealtimeData.mockReturnValue({
        data: updatedData,
        isLoading: false,
        error: null
      });

      rerender(<Dashboard />);

      // Check announcement was made
      await waitFor(() => {
        expect(liveRegion).toHaveTextContent(/updated/i);
      });
    });

    it('should maintain focus during updates', async () => {
      const { rerender } = render(<SessionList sessions={mockData.sessions} />);
      
      // Focus on search input
      const searchInput = screen.getByPlaceholderText(/Search sessions/i);
      searchInput.focus();
      expect(document.activeElement).toBe(searchInput);

      // Update sessions
      rerender(<SessionList sessions={[...mockData.sessions]} />);

      // Focus should remain on search input
      expect(document.activeElement).toBe(searchInput);
    });
  });
});