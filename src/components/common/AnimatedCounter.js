import React, { useEffect, useState, useRef } from 'react';
import './AnimatedCounter.css';

/**
 * AnimatedCounter Component
 * Module 2, Lesson 4: UI Polish and Animations
 * Smooth counter animations for metrics with easing
 */

const AnimatedCounter = ({ 
  value = 0, 
  duration = 1000, 
  prefix = '', 
  suffix = '', 
  decimals = 0,
  separator = ',',
  className = '',
  startOnView = true,
  delay = 0
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const counterRef = useRef(null);
  const animationRef = useRef(null);
  const observerRef = useRef(null);
  const startTimeRef = useRef(null);
  const startValueRef = useRef(0);

  // Easing function for smooth animation
  const easeOutQuart = (t) => {
    return 1 - Math.pow(1 - t, 4);
  };

  // Format number with separator
  const formatNumber = (num) => {
    const fixed = num.toFixed(decimals);
    if (separator) {
      const parts = fixed.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
      return parts.join('.');
    }
    return fixed;
  };

  // Animate the counter
  const animateCounter = () => {
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
      startValueRef.current = displayValue;
    }

    const now = Date.now();
    const elapsed = now - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutQuart(progress);
    
    const currentValue = startValueRef.current + (value - startValueRef.current) * easedProgress;
    setDisplayValue(currentValue);

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animateCounter);
    } else {
      setIsAnimating(false);
      setHasAnimated(true);
      startTimeRef.current = null;
    }
  };

  // Start animation
  const startAnimation = () => {
    if (isAnimating || (hasAnimated && startOnView)) return;
    
    setIsAnimating(true);
    
    if (delay > 0) {
      setTimeout(() => {
        animationRef.current = requestAnimationFrame(animateCounter);
      }, delay);
    } else {
      animationRef.current = requestAnimationFrame(animateCounter);
    }
  };

  // Set up intersection observer for animation on view
  useEffect(() => {
    if (!startOnView || !counterRef.current) {
      startAnimation();
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            startAnimation();
          }
        });
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(counterRef.current);

    return () => {
      if (observerRef.current && counterRef.current) {
        observerRef.current.unobserve(counterRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Handle value changes
  useEffect(() => {
    if (hasAnimated) {
      startTimeRef.current = null;
      animationRef.current = requestAnimationFrame(animateCounter);
    }
  }, [value]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <span 
      ref={counterRef}
      className={`animated-counter ${className} ${isAnimating ? 'animating' : ''}`}
      aria-live="polite"
      aria-label={`${prefix}${formatNumber(value)}${suffix}`}
    >
      <span className="counter-prefix">{prefix}</span>
      <span className="counter-value">
        {formatNumber(displayValue)}
      </span>
      <span className="counter-suffix">{suffix}</span>
    </span>
  );
};

// Percentage counter variant
export const PercentageCounter = ({ value, ...props }) => {
  return (
    <AnimatedCounter 
      value={value} 
      suffix="%" 
      decimals={1}
      {...props}
    />
  );
};

// Currency counter variant
export const CurrencyCounter = ({ value, currency = '$', ...props }) => {
  return (
    <AnimatedCounter 
      value={value} 
      prefix={currency}
      decimals={2}
      separator=","
      {...props}
    />
  );
};

// Compact number counter (1.2k, 3.5M, etc.)
export const CompactCounter = ({ value, ...props }) => {
  const formatCompact = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const compactValue = formatCompact(value);
  const numericValue = parseFloat(compactValue);
  const suffix = compactValue.replace(/[\d.]/g, '');

  return (
    <AnimatedCounter 
      value={numericValue}
      suffix={suffix}
      decimals={suffix ? 1 : 0}
      separator=""
      {...props}
    />
  );
};

export default AnimatedCounter;