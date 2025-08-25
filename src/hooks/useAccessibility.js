import { useEffect, useCallback, useRef } from 'react';
import { 
  announceToScreenReader, 
  focusManagement,
  keyboardNavigation,
  debounceAnnouncement,
  formatNumberForScreenReader
} from '../utils/accessibility';

/**
 * Custom hook for accessibility features
 * Provides screen reader announcements, focus management, and keyboard navigation
 */
export const useAccessibility = () => {
  const announcementQueue = useRef([]);
  const isProcessing = useRef(false);
  
  // Process announcement queue
  const processQueue = useCallback(() => {
    if (isProcessing.current || announcementQueue.current.length === 0) {
      return;
    }
    
    isProcessing.current = true;
    const { message, priority } = announcementQueue.current.shift();
    announceToScreenReader(message, priority);
    
    setTimeout(() => {
      isProcessing.current = false;
      processQueue();
    }, 100);
  }, []);
  
  // Queue announcement
  const announce = useCallback((message, priority = 'polite') => {
    announcementQueue.current.push({ message, priority });
    processQueue();
  }, [processQueue]);
  
  // Debounced announcement
  const announceDebounced = useCallback(
    debounceAnnouncement((message, priority) => {
      announce(message, priority);
    }, 500),
    [announce]
  );
  
  return {
    announce,
    announceDebounced,
    focusManagement,
    keyboardNavigation
  };
};

/**
 * Hook for announcing data updates
 */
export const useDataUpdateAnnouncement = (data, getMessage) => {
  const { announce } = useAccessibility();
  const previousData = useRef(data);
  
  useEffect(() => {
    if (!data || !previousData.current) {
      return;
    }
    
    // Check if data has changed
    if (JSON.stringify(data) !== JSON.stringify(previousData.current)) {
      const message = getMessage ? getMessage(data, previousData.current) : 'Data updated';
      announce(message, 'polite');
      previousData.current = data;
    }
  }, [data, getMessage, announce]);
};

/**
 * Hook for keyboard navigation in lists
 */
export const useListKeyboardNavigation = (items, onSelect, initialIndex = 0) => {
  const currentIndex = useRef(initialIndex);
  
  const handleKeyDown = useCallback((e) => {
    if (!items || items.length === 0) return;
    
    keyboardNavigation.handleListNavigation(
      e,
      items,
      currentIndex.current,
      (newIndex) => {
        currentIndex.current = newIndex;
        if (onSelect) {
          onSelect(newIndex, items[newIndex]);
        }
      }
    );
  }, [items, onSelect]);
  
  return {
    handleKeyDown,
    currentIndex: currentIndex.current
  };
};

/**
 * Hook for focus trap (modals, dropdowns)
 */
export const useFocusTrap = (isActive, containerRef) => {
  const cleanupRef = useRef(null);
  
  useEffect(() => {
    if (!isActive || !containerRef.current) {
      return;
    }
    
    // Save current focus
    focusManagement.saveFocus();
    
    // Focus first element in container
    setTimeout(() => {
      focusManagement.focusFirstElement(containerRef.current);
    }, 100);
    
    // Setup focus trap
    cleanupRef.current = focusManagement.trapFocus(containerRef.current);
    
    return () => {
      // Cleanup focus trap
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      
      // Restore focus
      focusManagement.restoreFocus();
    };
  }, [isActive, containerRef]);
};

/**
 * Hook for live region updates
 */
export const useLiveRegion = (regionId) => {
  const update = useCallback((message) => {
    const region = document.getElementById(regionId);
    if (region) {
      region.textContent = message;
    }
  }, [regionId]);
  
  const clear = useCallback(() => {
    const region = document.getElementById(regionId);
    if (region) {
      region.textContent = '';
    }
  }, [regionId]);
  
  return { update, clear };
};

/**
 * Hook for metric announcements
 */
export const useMetricAnnouncement = (metrics) => {
  const { announceDebounced } = useAccessibility();
  const previousMetrics = useRef(metrics);
  
  useEffect(() => {
    if (!metrics || !previousMetrics.current) {
      return;
    }
    
    const announcements = [];
    
    // Check each metric for changes
    Object.keys(metrics).forEach(key => {
      const current = metrics[key];
      const previous = previousMetrics.current[key];
      
      if (current !== previous) {
        const formattedCurrent = typeof current === 'number' 
          ? formatNumberForScreenReader(current) 
          : current;
        
        const formattedPrevious = typeof previous === 'number'
          ? formatNumberForScreenReader(previous)
          : previous;
        
        // Determine change direction
        let changeDescription = '';
        if (typeof current === 'number' && typeof previous === 'number') {
          if (current > previous) {
            changeDescription = `increased from ${formattedPrevious} to ${formattedCurrent}`;
          } else {
            changeDescription = `decreased from ${formattedPrevious} to ${formattedCurrent}`;
          }
        } else {
          changeDescription = `changed to ${formattedCurrent}`;
        }
        
        announcements.push(`${key} ${changeDescription}`);
      }
    });
    
    if (announcements.length > 0) {
      announceDebounced(announcements.join('. '), 'polite');
    }
    
    previousMetrics.current = metrics;
  }, [metrics, announceDebounced]);
};

/**
 * Hook for skip link management
 */
export const useSkipLinks = () => {
  useEffect(() => {
    const handleSkipLinkFocus = (e) => {
      if (e.target.classList.contains('skip-link')) {
        e.target.classList.add('skip-link--focused');
      }
    };
    
    const handleSkipLinkBlur = (e) => {
      if (e.target.classList.contains('skip-link')) {
        e.target.classList.remove('skip-link--focused');
      }
    };
    
    document.addEventListener('focus', handleSkipLinkFocus, true);
    document.addEventListener('blur', handleSkipLinkBlur, true);
    
    return () => {
      document.removeEventListener('focus', handleSkipLinkFocus, true);
      document.removeEventListener('blur', handleSkipLinkBlur, true);
    };
  }, []);
};

export default useAccessibility;