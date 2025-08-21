import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for monitoring React application performance
 * Tracks FPS, render times, memory usage, component updates, and performance history
 * Module 3: Performance Optimization
 */
const usePerformanceMonitor = (componentName = 'Unknown') => {
  const [metrics, setMetrics] = useState({
    fps: 0,
    renderTime: 0,
    memoryUsage: 0,
    updateCount: 0,
    lastUpdate: null,
    avgRenderTime: 0,
    maxRenderTime: 0,
    minRenderTime: Infinity,
    totalMemory: 0,
    memoryLimit: 0,
    longTaskCount: 0,
    renderHistory: []
  });
  
  const frameCount = useRef(0);
  const lastFrameTime = useRef(performance.now());
  const updateCount = useRef(0);
  const renderStartTime = useRef(0);
  const renderHistory = useRef([]);
  const longTaskCount = useRef(0);
  
  // Calculate FPS
  useEffect(() => {
    let animationId;
    
    const calculateFPS = () => {
      const now = performance.now();
      const delta = now - lastFrameTime.current;
      frameCount.current++;
      
      // Update FPS every second
      if (delta >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / delta);
        frameCount.current = 0;
        lastFrameTime.current = now;
        
        setMetrics(prev => ({ ...prev, fps }));
      }
      
      animationId = requestAnimationFrame(calculateFPS);
    };
    
    animationId = requestAnimationFrame(calculateFPS);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);
  
  // Track memory usage if available
  useEffect(() => {
    if (!performance.memory) return;
    
    const interval = setInterval(() => {
      const memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
      const totalMemory = Math.round(performance.memory.totalJSHeapSize / 1024 / 1024);
      const memoryLimit = Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024);
      
      setMetrics(prev => ({ 
        ...prev, 
        memoryUsage,
        totalMemory,
        memoryLimit
      }));
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Track long tasks (tasks that block main thread > 50ms)
  useEffect(() => {
    if (!window.PerformanceObserver) return;
    
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            longTaskCount.current++;
            setMetrics(prev => ({ 
              ...prev, 
              longTaskCount: longTaskCount.current 
            }));
          }
        }
      });
      
      observer.observe({ entryTypes: ['longtask'] });
      
      return () => observer.disconnect();
    } catch (error) {
      // Long task observer not supported
      console.debug('Long task observer not supported');
    }
  }, []);
  
  // Mark render start
  const markRenderStart = useCallback(() => {
    renderStartTime.current = performance.now();
    performance.mark(`${componentName}-render-start`);
  }, [componentName]);
  
  // Mark render end and calculate render time
  const markRenderEnd = useCallback(() => {
    if (renderStartTime.current === 0) return;
    
    const renderTime = performance.now() - renderStartTime.current;
    performance.mark(`${componentName}-render-end`);
    performance.measure(
      `${componentName}-render`,
      `${componentName}-render-start`,
      `${componentName}-render-end`
    );
    
    updateCount.current++;
    
    // Update render history (keep last 20 renders)
    renderHistory.current.push(renderTime);
    if (renderHistory.current.length > 20) {
      renderHistory.current.shift();
    }
    
    // Calculate statistics
    const avgRenderTime = renderHistory.current.reduce((a, b) => a + b, 0) / renderHistory.current.length;
    const maxRenderTime = Math.max(...renderHistory.current);
    const minRenderTime = Math.min(...renderHistory.current);
    
    setMetrics(prev => ({
      ...prev,
      renderTime: Math.round(renderTime * 100) / 100,
      avgRenderTime: Math.round(avgRenderTime * 100) / 100,
      maxRenderTime: Math.round(maxRenderTime * 100) / 100,
      minRenderTime: Math.round(minRenderTime * 100) / 100,
      updateCount: updateCount.current,
      lastUpdate: new Date().toISOString(),
      renderHistory: [...renderHistory.current.slice(-10)] // Keep last 10 for display
    }));
    
    renderStartTime.current = 0;
  }, [componentName]);
  
  // Get performance rating based on metrics
  const getPerformanceRating = useCallback(() => {
    const { fps, renderTime, memoryUsage } = metrics;
    
    if (fps >= 50 && renderTime < 16 && memoryUsage < 100) {
      return { level: 'excellent', color: '#10b981' };
    } else if (fps >= 30 && renderTime < 50 && memoryUsage < 200) {
      return { level: 'good', color: '#3b82f6' };
    } else if (fps >= 20 && renderTime < 100 && memoryUsage < 300) {
      return { level: 'fair', color: '#f59e0b' };
    } else {
      return { level: 'poor', color: '#ef4444' };
    }
  }, [metrics]);
  
  // Clear all performance marks for this component
  const clearMarks = useCallback(() => {
    performance.clearMarks(`${componentName}-render-start`);
    performance.clearMarks(`${componentName}-render-end`);
    performance.clearMeasures(`${componentName}-render`);
  }, [componentName]);
  
  // Reset metrics
  const resetMetrics = useCallback(() => {
    updateCount.current = 0;
    renderHistory.current = [];
    longTaskCount.current = 0;
    setMetrics({
      fps: 0,
      renderTime: 0,
      memoryUsage: 0,
      updateCount: 0,
      lastUpdate: null,
      avgRenderTime: 0,
      maxRenderTime: 0,
      minRenderTime: Infinity,
      totalMemory: 0,
      memoryLimit: 0,
      longTaskCount: 0,
      renderHistory: []
    });
    clearMarks();
  }, [clearMarks]);
  
  // Get all performance entries for this component
  const getPerformanceEntries = useCallback(() => {
    return performance.getEntriesByName(`${componentName}-render`, 'measure');
  }, [componentName]);
  
  return {
    metrics,
    markRenderStart,
    markRenderEnd,
    getPerformanceRating,
    clearMarks,
    resetMetrics,
    getPerformanceEntries
  };
};

export default usePerformanceMonitor;