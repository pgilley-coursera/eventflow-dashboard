import { useState, useEffect, useCallback } from 'react';
import realtimeSimulator from '../services/realtimeSimulator';

export const useRealtimeData = (autoStart = true) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSimulatorRunning, setIsSimulatorRunning] = useState(false);

  useEffect(() => {
    let unsubscribe;
    
    try {
      unsubscribe = realtimeSimulator.subscribe((newData) => {
        setData(newData);
        setIsLoading(false);
      });
      
      if (autoStart && !realtimeSimulator.isRunning) {
        realtimeSimulator.start();
        setIsSimulatorRunning(true);
      }
    } catch (err) {
      setError(err);
      setIsLoading(false);
    }
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [autoStart]);

  const startSimulator = useCallback(() => {
    if (!realtimeSimulator.isRunning) {
      realtimeSimulator.start();
      setIsSimulatorRunning(true);
    }
  }, []);

  const stopSimulator = useCallback(() => {
    if (realtimeSimulator.isRunning) {
      realtimeSimulator.stop();
      setIsSimulatorRunning(false);
    }
  }, []);

  const resetData = useCallback(() => {
    realtimeSimulator.reset();
  }, []);

  return {
    data,
    isLoading,
    error,
    isSimulatorRunning,
    startSimulator,
    stopSimulator,
    resetData
  };
};

export const useSessionData = () => {
  const { data, ...rest } = useRealtimeData();
  
  return {
    sessions: data?.sessions || [],
    metrics: data?.metrics || {},
    ...rest
  };
};

export const useSpeakerData = () => {
  const { data, ...rest } = useRealtimeData();
  
  return {
    speakers: data?.speakers || [],
    sessions: data?.sessions || [],
    ...rest
  };
};

export const useAttendeeData = () => {
  const { data, ...rest } = useRealtimeData();
  
  return {
    attendees: data?.attendees || [],
    totalAttendees: data?.metrics?.totalAttendees || 0,
    ...rest
  };
};

export const useFeedbackData = () => {
  const { data, ...rest } = useRealtimeData();
  
  return {
    feedback: data?.feedback || [],
    avgRating: data?.metrics?.avgRating || 0,
    totalFeedback: data?.metrics?.totalFeedback || 0,
    ...rest
  };
};

export const useMetrics = () => {
  const { data, ...rest } = useRealtimeData();
  
  return {
    metrics: data?.metrics || {
      totalSessions: 0,
      activeSessions: 0,
      totalAttendees: 0,
      avgEngagement: 0,
      totalFeedback: 0,
      avgRating: 0
    },
    lastUpdated: data?.lastUpdated,
    ...rest
  };
};