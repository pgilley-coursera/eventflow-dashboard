/**
 * Unit Tests for useRealtimeData Hook
 * Module 2, Lesson 5: Testing Strategy
 * Tests real-time data hook functionality
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import realtimeSimulator from '../../services/realtimeSimulator';

// Mock the realtimeSimulator
jest.mock('../../services/realtimeSimulator', () => ({
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
  reset: jest.fn(),
  getData: jest.fn(),
  isRunning: jest.fn()
}));

describe('useRealtimeData', () => {
  const mockData = {
    sessions: [
      { id: 1, title: 'Test Session', attendees: 50 }
    ],
    speakers: [
      { id: 1, name: 'Test Speaker' }
    ],
    attendees: [],
    feedback: [],
    metrics: {
      activeSessions: 5,
      totalAttendees: 100,
      avgEngagement: 85,
      avgRating: 4.5
    },
    lastUpdated: new Date().toISOString(),
    updateCount: 1
  };

  beforeEach(() => {
    jest.clearAllMocks();
    realtimeSimulator.getData.mockReturnValue(mockData);
    realtimeSimulator.isRunning.mockReturnValue(false);
  });

  describe('basic functionality', () => {
    it('should initialize with loading state', () => {
      const { result } = renderHook(() => useRealtimeData());
      
      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should load data on mount when autoStart is true', async () => {
      let subscriberCallback;
      realtimeSimulator.subscribe.mockImplementation((callback) => {
        subscriberCallback = callback;
      });

      const { result } = renderHook(() => useRealtimeData(true));

      // Simulate data update
      act(() => {
        subscriberCallback(mockData);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toEqual(mockData);
      });

      expect(realtimeSimulator.start).toHaveBeenCalled();
      expect(realtimeSimulator.subscribe).toHaveBeenCalled();
    });

    it('should not auto-start when autoStart is false', () => {
      renderHook(() => useRealtimeData(false));
      
      expect(realtimeSimulator.start).not.toHaveBeenCalled();
    });

    it('should handle data updates', async () => {
      let subscriberCallback;
      realtimeSimulator.subscribe.mockImplementation((callback) => {
        subscriberCallback = callback;
      });

      const { result } = renderHook(() => useRealtimeData(true));

      // Initial data
      act(() => {
        subscriberCallback(mockData);
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData);
      });

      // Update data
      const updatedData = {
        ...mockData,
        metrics: { ...mockData.metrics, activeSessions: 10 }
      };

      act(() => {
        subscriberCallback(updatedData);
      });

      await waitFor(() => {
        expect(result.current.data.metrics.activeSessions).toBe(10);
      });
    });
  });

  describe('simulator controls', () => {
    it('should start simulator', async () => {
      const { result } = renderHook(() => useRealtimeData(false));

      act(() => {
        result.current.startSimulator();
      });

      expect(realtimeSimulator.start).toHaveBeenCalled();
    });

    it('should stop simulator', async () => {
      const { result } = renderHook(() => useRealtimeData(true));

      act(() => {
        result.current.stopSimulator();
      });

      expect(realtimeSimulator.stop).toHaveBeenCalled();
    });

    it('should reset simulator', async () => {
      const { result } = renderHook(() => useRealtimeData(true));

      act(() => {
        result.current.resetSimulator();
      });

      expect(realtimeSimulator.reset).toHaveBeenCalled();
    });

    it('should report simulator running status', () => {
      realtimeSimulator.isRunning.mockReturnValue(true);
      
      const { result } = renderHook(() => useRealtimeData());
      
      expect(result.current.isSimulatorRunning).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle errors during data loading', async () => {
      const error = new Error('Failed to load data');
      let subscriberCallback;
      
      realtimeSimulator.subscribe.mockImplementation((callback) => {
        subscriberCallback = callback;
        throw error;
      });

      const { result } = renderHook(() => useRealtimeData(true));

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should recover from errors on retry', async () => {
      let subscriberCallback;
      realtimeSimulator.subscribe
        .mockImplementationOnce(() => {
          throw new Error('First attempt failed');
        })
        .mockImplementationOnce((callback) => {
          subscriberCallback = callback;
        });

      const { result, rerender } = renderHook(() => useRealtimeData(true));

      // First render - error
      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });

      // Retry by re-rendering
      rerender();

      // Simulate successful data
      act(() => {
        if (subscriberCallback) {
          subscriberCallback(mockData);
        }
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.data).toEqual(mockData);
      });
    });
  });

  describe('cleanup', () => {
    it('should unsubscribe on unmount', () => {
      const { unmount } = renderHook(() => useRealtimeData(true));
      
      unmount();
      
      expect(realtimeSimulator.unsubscribe).toHaveBeenCalled();
    });

    it('should stop simulator on unmount if it was started', () => {
      realtimeSimulator.isRunning.mockReturnValue(true);
      
      const { unmount } = renderHook(() => useRealtimeData(true));
      
      unmount();
      
      expect(realtimeSimulator.stop).toHaveBeenCalled();
    });
  });

  describe('data filtering', () => {
    it('should provide session data', async () => {
      let subscriberCallback;
      realtimeSimulator.subscribe.mockImplementation((callback) => {
        subscriberCallback = callback;
      });

      const { result } = renderHook(() => useRealtimeData(true));

      act(() => {
        subscriberCallback(mockData);
      });

      await waitFor(() => {
        expect(result.current.data.sessions).toEqual(mockData.sessions);
      });
    });

    it('should provide speaker data', async () => {
      let subscriberCallback;
      realtimeSimulator.subscribe.mockImplementation((callback) => {
        subscriberCallback = callback;
      });

      const { result } = renderHook(() => useRealtimeData(true));

      act(() => {
        subscriberCallback(mockData);
      });

      await waitFor(() => {
        expect(result.current.data.speakers).toEqual(mockData.speakers);
      });
    });

    it('should provide metrics data', async () => {
      let subscriberCallback;
      realtimeSimulator.subscribe.mockImplementation((callback) => {
        subscriberCallback = callback;
      });

      const { result } = renderHook(() => useRealtimeData(true));

      act(() => {
        subscriberCallback(mockData);
      });

      await waitFor(() => {
        expect(result.current.data.metrics).toEqual(mockData.metrics);
      });
    });
  });

  describe('performance', () => {
    it('should not cause unnecessary re-renders', async () => {
      let subscriberCallback;
      let renderCount = 0;
      
      realtimeSimulator.subscribe.mockImplementation((callback) => {
        subscriberCallback = callback;
      });

      const { result } = renderHook(() => {
        renderCount++;
        return useRealtimeData(true);
      });

      const initialRenderCount = renderCount;

      // Simulate same data update
      act(() => {
        subscriberCallback(mockData);
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData);
      });

      const afterFirstUpdate = renderCount;

      // Update with same data
      act(() => {
        subscriberCallback(mockData);
      });

      // Should not cause additional render if data is the same
      expect(renderCount).toBe(afterFirstUpdate);
    });

    it('should handle rapid updates gracefully', async () => {
      let subscriberCallback;
      realtimeSimulator.subscribe.mockImplementation((callback) => {
        subscriberCallback = callback;
      });

      const { result } = renderHook(() => useRealtimeData(true));

      // Simulate rapid updates
      for (let i = 0; i < 10; i++) {
        act(() => {
          subscriberCallback({
            ...mockData,
            updateCount: i
          });
        });
      }

      await waitFor(() => {
        expect(result.current.data.updateCount).toBe(9);
      });
    });
  });
});