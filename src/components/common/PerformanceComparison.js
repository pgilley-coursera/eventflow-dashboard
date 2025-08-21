import React, { useState, useEffect } from 'react';
import usePerformanceMonitor from '../../hooks/usePerformanceMonitor';
import './PerformanceComparison.css';

const PerformanceMetricCard = ({ title, optimized, unoptimized, unit = 'ms' }) => {
  const improvement = optimized && unoptimized 
    ? Math.round(((unoptimized - optimized) / unoptimized) * 100)
    : 0;
  
  const getImprovementColor = () => {
    if (improvement > 50) return '#10b981';
    if (improvement > 20) return '#3b82f6';
    if (improvement > 0) return '#f59e0b';
    return '#ef4444';
  };
  
  return (
    <div className="perf-metric-card">
      <h4>{title}</h4>
      <div className="perf-values">
        <div className="perf-value unoptimized">
          <span className="label">Unoptimized</span>
          <span className="value">{unoptimized}{unit}</span>
        </div>
        <div className="perf-value optimized">
          <span className="label">Optimized</span>
          <span className="value">{optimized}{unit}</span>
        </div>
      </div>
      {improvement > 0 && (
        <div className="improvement" style={{ color: getImprovementColor() }}>
          ↓ {improvement}% improvement
        </div>
      )}
    </div>
  );
};

const PerformanceComparison = ({ showOptimized = true, showUnoptimized = true }) => {
  const optimizedMonitor = usePerformanceMonitor('OptimizedComponents');
  const unoptimizedMonitor = usePerformanceMonitor('UnoptimizedComponents');
  
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [comparisonData, setComparisonData] = useState({
    renderTimes: { optimized: [], unoptimized: [] },
    avgRenderTime: { optimized: 0, unoptimized: 0 },
    memoryDelta: { optimized: 0, unoptimized: 0 },
    rerenderCount: { optimized: 0, unoptimized: 0 }
  });
  
  // Simulate performance measurements
  useEffect(() => {
    if (!isMonitoring) return;
    
    const interval = setInterval(() => {
      // Simulate render measurements
      if (showOptimized) {
        optimizedMonitor.markRenderStart();
        setTimeout(() => {
          optimizedMonitor.markRenderEnd();
        }, Math.random() * 5 + 10); // 10-15ms render time
      }
      
      if (showUnoptimized) {
        unoptimizedMonitor.markRenderStart();
        setTimeout(() => {
          unoptimizedMonitor.markRenderEnd();
        }, Math.random() * 50 + 150); // 150-200ms render time
      }
      
      // Update comparison data
      setComparisonData(prev => {
        const optimizedTimes = [...prev.renderTimes.optimized, optimizedMonitor.metrics.renderTime];
        const unoptimizedTimes = [...prev.renderTimes.unoptimized, unoptimizedMonitor.metrics.renderTime];
        
        // Keep only last 10 measurements
        if (optimizedTimes.length > 10) optimizedTimes.shift();
        if (unoptimizedTimes.length > 10) unoptimizedTimes.shift();
        
        return {
          renderTimes: {
            optimized: optimizedTimes,
            unoptimized: unoptimizedTimes
          },
          avgRenderTime: {
            optimized: optimizedTimes.length ? 
              Math.round(optimizedTimes.reduce((a, b) => a + b, 0) / optimizedTimes.length) : 0,
            unoptimized: unoptimizedTimes.length ?
              Math.round(unoptimizedTimes.reduce((a, b) => a + b, 0) / unoptimizedTimes.length) : 0
          },
          memoryDelta: {
            optimized: optimizedMonitor.metrics.memoryUsage,
            unoptimized: unoptimizedMonitor.metrics.memoryUsage
          },
          rerenderCount: {
            optimized: optimizedMonitor.metrics.updateCount,
            unoptimized: unoptimizedMonitor.metrics.updateCount
          }
        };
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isMonitoring, showOptimized, showUnoptimized, optimizedMonitor, unoptimizedMonitor]);
  
  const handleToggleMonitoring = () => {
    if (!isMonitoring) {
      optimizedMonitor.resetMetrics();
      unoptimizedMonitor.resetMetrics();
      setComparisonData({
        renderTimes: { optimized: [], unoptimized: [] },
        avgRenderTime: { optimized: 0, unoptimized: 0 },
        memoryDelta: { optimized: 0, unoptimized: 0 },
        rerenderCount: { optimized: 0, unoptimized: 0 }
      });
    }
    setIsMonitoring(!isMonitoring);
  };
  
  const optimizedRating = optimizedMonitor.getPerformanceRating();
  const unoptimizedRating = unoptimizedMonitor.getPerformanceRating();
  
  return (
    <div className="performance-comparison">
      <div className="comparison-header">
        <h3>Performance Comparison</h3>
        <button 
          className={`monitor-toggle ${isMonitoring ? 'active' : ''}`}
          onClick={handleToggleMonitoring}
        >
          {isMonitoring ? '⏸ Stop Monitoring' : '▶ Start Monitoring'}
        </button>
      </div>
      
      <div className="comparison-status">
        <div className="status-item">
          <span className="status-label">Optimized Status:</span>
          <span 
            className="status-value"
            style={{ color: optimizedRating.color }}
          >
            {optimizedRating.level.toUpperCase()}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">Unoptimized Status:</span>
          <span 
            className="status-value"
            style={{ color: unoptimizedRating.color }}
          >
            {unoptimizedRating.level.toUpperCase()}
          </span>
        </div>
      </div>
      
      <div className="comparison-metrics">
        <PerformanceMetricCard
          title="Average Render Time"
          optimized={comparisonData.avgRenderTime.optimized}
          unoptimized={comparisonData.avgRenderTime.unoptimized}
          unit="ms"
        />
        
        <PerformanceMetricCard
          title="Memory Usage"
          optimized={optimizedMonitor.metrics.memoryUsage}
          unoptimized={unoptimizedMonitor.metrics.memoryUsage}
          unit="MB"
        />
        
        <PerformanceMetricCard
          title="FPS"
          optimized={optimizedMonitor.metrics.fps}
          unoptimized={unoptimizedMonitor.metrics.fps}
          unit=""
        />
        
        <PerformanceMetricCard
          title="Re-render Count"
          optimized={comparisonData.rerenderCount.optimized}
          unoptimized={comparisonData.rerenderCount.unoptimized}
          unit=""
        />
      </div>
      
      {isMonitoring && (
        <div className="render-timeline">
          <h4>Render Time History (Last 10)</h4>
          <div className="timeline-chart">
            <div className="timeline-row optimized">
              <span className="timeline-label">Optimized:</span>
              <div className="timeline-bars">
                {comparisonData.renderTimes.optimized.map((time, index) => (
                  <div
                    key={index}
                    className="timeline-bar"
                    style={{
                      height: `${Math.min(time * 2, 100)}px`,
                      backgroundColor: '#10b981'
                    }}
                    title={`${time}ms`}
                  />
                ))}
              </div>
            </div>
            <div className="timeline-row unoptimized">
              <span className="timeline-label">Unoptimized:</span>
              <div className="timeline-bars">
                {comparisonData.renderTimes.unoptimized.map((time, index) => (
                  <div
                    key={index}
                    className="timeline-bar"
                    style={{
                      height: `${Math.min(time / 2, 100)}px`,
                      backgroundColor: '#ef4444'
                    }}
                    title={`${time}ms`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="comparison-insights">
        <h4>Key Improvements</h4>
        <ul>
          <li>✅ React.memo prevents unnecessary re-renders</li>
          <li>✅ useMemo caches expensive calculations</li>
          <li>✅ useCallback stabilizes function references</li>
          <li>✅ Proper cleanup prevents memory leaks</li>
          <li>✅ Efficient algorithms reduce processing time</li>
        </ul>
      </div>
    </div>
  );
};

export default PerformanceComparison;