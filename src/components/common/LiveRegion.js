import React from 'react';

/**
 * LiveRegion Component
 * Provides ARIA live region for screen reader announcements
 * WCAG AA Compliant
 */
const LiveRegion = ({ 
  id = 'live-region', 
  ariaLive = 'polite', 
  ariaAtomic = true,
  className = 'sr-only',
  children 
}) => {
  return (
    <div
      id={id}
      role="status"
      aria-live={ariaLive}
      aria-atomic={ariaAtomic}
      className={className}
    >
      {children}
    </div>
  );
};

/**
 * Multiple live regions for different priorities
 */
export const LiveRegions = () => {
  return (
    <>
      {/* Polite announcements (wait for screen reader to finish) */}
      <LiveRegion 
        id="live-region-polite" 
        ariaLive="polite"
        className="sr-only"
      />
      
      {/* Assertive announcements (interrupt screen reader) */}
      <LiveRegion 
        id="live-region-assertive" 
        ariaLive="assertive"
        className="sr-only"
      />
      
      {/* Alert announcements (highest priority) */}
      <div
        id="live-region-alert"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />
    </>
  );
};

export default LiveRegion;