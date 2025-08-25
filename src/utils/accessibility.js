/**
 * Accessibility Utilities
 * Provides comprehensive accessibility support for EventFlow Dashboard
 * Module 2, Lesson 3: Accessibility Implementation
 * WCAG AA Compliance
 */

/**
 * Announce message to screen readers using ARIA live regions
 * @param {string} message - Message to announce
 * @param {string} priority - 'polite' or 'assertive'
 */
export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Focus management utilities
 */
export const focusManagement = {
  // Store last focused element
  lastFocusedElement: null,
  
  // Save current focus
  saveFocus() {
    this.lastFocusedElement = document.activeElement;
  },
  
  // Restore previous focus
  restoreFocus() {
    if (this.lastFocusedElement && this.lastFocusedElement.focus) {
      this.lastFocusedElement.focus();
    }
  },
  
  // Focus first focusable element in container
  focusFirstElement(container) {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  },
  
  // Get all focusable elements in container
  getFocusableElements(container = document) {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      'audio[controls]',
      'video[controls]',
      '[contenteditable]:not([contenteditable="false"])'
    ];
    
    return Array.from(
      container.querySelectorAll(focusableSelectors.join(', '))
    ).filter(el => {
      // Filter out elements that are not visible
      return el.offsetParent !== null;
    });
  },
  
  // Trap focus within container (for modals)
  trapFocus(container) {
    const focusableElements = this.getFocusableElements(container);
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    
    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }
};

/**
 * Keyboard navigation utilities
 */
export const keyboardNavigation = {
  // Handle arrow key navigation in lists
  handleListNavigation(e, items, currentIndex, onSelect) {
    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        onSelect(prevIndex);
        break;
        
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        onSelect(nextIndex);
        break;
        
      case 'Home':
        e.preventDefault();
        onSelect(0);
        break;
        
      case 'End':
        e.preventDefault();
        onSelect(items.length - 1);
        break;
        
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (items[currentIndex].onClick) {
          items[currentIndex].onClick();
        }
        break;
        
      default:
        break;
    }
  },
  
  // Handle escape key
  handleEscape(e, callback) {
    if (e.key === 'Escape') {
      e.preventDefault();
      callback();
    }
  }
};

/**
 * ARIA helpers
 */
export const ariaHelpers = {
  // Generate unique ID for ARIA relationships
  generateId(prefix = 'aria') {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },
  
  // Set loading state
  setLoadingState(element, isLoading) {
    element.setAttribute('aria-busy', isLoading.toString());
  },
  
  // Set expanded state
  setExpandedState(element, isExpanded) {
    element.setAttribute('aria-expanded', isExpanded.toString());
  },
  
  // Set selected state
  setSelectedState(element, isSelected) {
    element.setAttribute('aria-selected', isSelected.toString());
  },
  
  // Update live region
  updateLiveRegion(regionId, message) {
    const region = document.getElementById(regionId);
    if (region) {
      region.textContent = message;
    }
  }
};

/**
 * Color contrast utilities
 */
export const colorContrast = {
  // Calculate relative luminance
  getRelativeLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },
  
  // Calculate contrast ratio
  getContrastRatio(color1, color2) {
    const l1 = this.getRelativeLuminance(...color1);
    const l2 = this.getRelativeLuminance(...color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  },
  
  // Check if contrast meets WCAG AA standards
  meetsWCAGAA(foreground, background, isLargeText = false) {
    const ratio = this.getContrastRatio(foreground, background);
    return isLargeText ? ratio >= 3 : ratio >= 4.5;
  }
};

/**
 * Create accessible chart description
 */
export const createChartDescription = (chartType, data, summary) => {
  let description = `${chartType} chart`;
  
  if (summary) {
    description += `. ${summary}`;
  }
  
  if (data && data.length > 0) {
    const highest = Math.max(...data.map(d => d.value || 0));
    const lowest = Math.min(...data.map(d => d.value || 0));
    description += `. Values range from ${lowest} to ${highest}`;
  }
  
  return description;
};

/**
 * Format data for screen reader tables
 */
export const formatDataForScreenReader = (data, columns) => {
  return data.map(row => {
    return columns.map(col => `${col.label}: ${row[col.key]}`).join(', ');
  }).join('. ');
};

/**
 * Reduced motion preference
 */
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * High contrast mode detection
 */
export const prefersHighContrast = () => {
  return window.matchMedia('(prefers-contrast: high)').matches;
};

/**
 * Create skip links structure
 */
export const createSkipLinks = () => {
  return [
    { href: '#main-content', text: 'Skip to main content' },
    { href: '#navigation', text: 'Skip to navigation' },
    { href: '#search', text: 'Skip to search' },
    { href: '#footer', text: 'Skip to footer' }
  ];
};

/**
 * Debounce function for screen reader announcements
 */
export const debounceAnnouncement = (func, delay = 500) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Format time for screen readers
 */
export const formatTimeForScreenReader = (time) => {
  const date = new Date(time);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Format numbers for screen readers
 */
export const formatNumberForScreenReader = (num) => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)} million`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)} thousand`;
  }
  return num.toString();
};

/**
 * Create landmark regions
 */
export const landmarkRoles = {
  main: 'main',
  navigation: 'navigation',
  search: 'search',
  banner: 'banner',
  contentinfo: 'contentinfo',
  complementary: 'complementary',
  form: 'form',
  region: 'region'
};

export default {
  announceToScreenReader,
  focusManagement,
  keyboardNavigation,
  ariaHelpers,
  colorContrast,
  createChartDescription,
  formatDataForScreenReader,
  prefersReducedMotion,
  prefersHighContrast,
  createSkipLinks,
  debounceAnnouncement,
  formatTimeForScreenReader,
  formatNumberForScreenReader,
  landmarkRoles
};