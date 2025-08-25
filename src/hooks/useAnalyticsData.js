import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import sessionAnalytics from '../services/sessionAnalytics';
import { useRealtimeData } from './useRealtimeData';

/**
 * Custom Hook: useAnalyticsData
 * 
 * Professional architecture pattern: Custom Hooks
 * Encapsulates all analytics data logic in a reusable hook,
 * preventing code duplication across components.
 * 
 * Features:
 * - Automatic data fetching and processing
 * - Intelligent caching with invalidation
 * - Error handling and loading states
 * - Memoized calculations
 * - Real-time updates integration
 */
const useAnalyticsData = (options = {}) => {
  const {
    autoRefresh = true,
    refreshInterval = 5000,
    enableCache = true,
    filters = {}
  } = options;

  // State management
  const [analyticsData, setAnalyticsData] = useState({
    sessionStats: null,
    topSessions: [],
    attendanceTrends: [],
    categoryAnalysis: [],
    sessionsNeedingAttention: [],
    performanceSummary: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Get real-time data
  const { data: realtimeData, isLoading: realtimeLoading } = useRealtimeData();
  
  // Refs for cleanup
  const refreshTimerRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Apply filters to sessions
  const filteredSessions = useMemo(() => {
    if (!realtimeData?.sessions) return [];
    
    let filtered = [...realtimeData.sessions];
    
    if (filters.status) {
      filtered = filtered.filter(s => s.status === filters.status);
    }
    
    if (filters.minEngagement) {
      filtered = filtered.filter(s => s.engagement >= filters.minEngagement);
    }
    
    if (filters.track) {
      filtered = filtered.filter(s => s.track === filters.track);
    }
    
    if (filters.timeRange) {
      const { start, end } = filters.timeRange;
      filtered = filtered.filter(s => s.startHour >= start && s.startHour <= end);
    }
    
    return filtered;
  }, [realtimeData?.sessions, filters]);

  // Process analytics data
  const processAnalytics = useCallback(async () => {
    if (!filteredSessions || filteredSessions.length === 0) {
      setAnalyticsData({
        sessionStats: null,
        topSessions: [],
        attendanceTrends: [],
        categoryAnalysis: [],
        sessionsNeedingAttention: [],
        performanceSummary: null
      });
      return;
    }

    try {
      setError(null);
      
      // Clear cache if disabled
      if (!enableCache) {
        sessionAnalytics.clearCache();
      }

      // Process all analytics in parallel for performance
      const [
        sessionStats,
        topSessions,
        attendanceTrends,
        categoryAnalysis,
        sessionsNeedingAttention,
        performanceSummary
      ] = await Promise.all([
        Promise.resolve(sessionAnalytics.calculateSessionStats(filteredSessions)),
        Promise.resolve(sessionAnalytics.getTopSessions(filteredSessions, 'attendance', 10)),
        Promise.resolve(sessionAnalytics.calculateAttendanceTrends(filteredSessions)),
        Promise.resolve(sessionAnalytics.analyzeByCategory(filteredSessions, 'track')),
        Promise.resolve(sessionAnalytics.getSessionsNeedingAttention(filteredSessions)),
        Promise.resolve(sessionAnalytics.generatePerformanceSummary(
          filteredSessions,
          realtimeData?.speakers || [],
          realtimeData?.attendees || []
        ))
      ]);

      setAnalyticsData({
        sessionStats,
        topSessions,
        attendanceTrends,
        categoryAnalysis,
        sessionsNeedingAttention,
        performanceSummary
      });
      
      setLastUpdate(new Date());
      setLoading(false);
    } catch (err) {
      console.error('Error processing analytics:', err);
      setError(err.message || 'Failed to process analytics data');
      setLoading(false);
    }
  }, [filteredSessions, realtimeData, enableCache]);

  // Initial load and updates
  useEffect(() => {
    if (!realtimeLoading && filteredSessions.length > 0) {
      processAnalytics();
    }
  }, [filteredSessions, realtimeLoading, processAnalytics]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    refreshTimerRef.current = setInterval(() => {
      processAnalytics();
    }, refreshInterval);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, processAnalytics]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, []);

  // Memoized getters for specific data
  const getSessionsByStatus = useCallback((status) => {
    return filteredSessions.filter(s => s.status === status);
  }, [filteredSessions]);

  const getTopSessionsByMetric = useCallback((metric = 'attendance', limit = 5) => {
    return sessionAnalytics.getTopSessions(filteredSessions, metric, limit);
  }, [filteredSessions]);

  const getRecommendations = useCallback((preferences = {}) => {
    return sessionAnalytics.getRecommendations(filteredSessions, preferences);
  }, [filteredSessions]);

  // Refresh function for manual updates
  const refresh = useCallback(() => {
    sessionAnalytics.clearCache();
    processAnalytics();
  }, [processAnalytics]);

  // Export functions for updating filters
  const updateFilters = useCallback((newFilters) => {
    // This will trigger re-filtering through the useMemo dependency
    return newFilters;
  }, []);

  // Calculate derived metrics
  const metrics = useMemo(() => {
    if (!analyticsData.sessionStats) return null;

    const stats = analyticsData.sessionStats;
    return {
      activeSessions: stats.active,
      totalAttendees: stats.totalAttendees,
      avgEngagement: stats.averageEngagement,
      avgRating: realtimeData?.metrics?.avgRating || 0,
      fillRate: stats.totalCapacity > 0 
        ? Math.round((stats.totalAttendees / stats.totalCapacity) * 100)
        : 0,
      sessionHealth: analyticsData.sessionsNeedingAttention.length === 0 
        ? 'excellent'
        : analyticsData.sessionsNeedingAttention.length < 3 
        ? 'good' 
        : 'needs attention'
    };
  }, [analyticsData.sessionStats, analyticsData.sessionsNeedingAttention, realtimeData?.metrics]);

  // Return comprehensive analytics data and utilities
  return {
    // Data
    data: analyticsData,
    sessions: filteredSessions,
    metrics,
    
    // State
    loading: loading || realtimeLoading,
    error,
    lastUpdate,
    
    // Functions
    refresh,
    updateFilters,
    getSessionsByStatus,
    getTopSessionsByMetric,
    getRecommendations,
    
    // Raw data access
    rawData: realtimeData,
    
    // Analytics service access (for advanced use)
    analyticsService: sessionAnalytics
  };
};

export default useAnalyticsData;