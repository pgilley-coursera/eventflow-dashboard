import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import './Toast.css';

/**
 * Toast Notification System
 * Module 2, Lesson 4: UI Polish and Animations
 * Modern toast notifications with slide and fade animations
 */

// Toast context for global access
const ToastContext = createContext();

// Toast types and their properties
const TOAST_TYPES = {
  success: {
    icon: '✅',
    className: 'toast-success',
    duration: 3000
  },
  error: {
    icon: '❌',
    className: 'toast-error',
    duration: 5000
  },
  warning: {
    icon: '⚠️',
    className: 'toast-warning',
    duration: 4000
  },
  info: {
    icon: 'ℹ️',
    className: 'toast-info',
    duration: 3000
  }
};

// Individual toast component
const Toast = ({ id, type, title, message, duration, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);
  const toastConfig = TOAST_TYPES[type] || TOAST_TYPES.info;

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration || toastConfig.duration);

    return () => clearTimeout(timer);
  }, [duration, toastConfig.duration]);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // Match animation duration
  }, [id, onClose]);

  return (
    <div 
      className={`toast ${toastConfig.className} ${isExiting ? 'toast-exit' : ''}`}
      role="alert"
      aria-live="polite"
    >
      <div className="toast-icon">
        <span role="img" aria-label={type}>{toastConfig.icon}</span>
      </div>
      <div className="toast-content">
        {title && <div className="toast-title">{title}</div>}
        <div className="toast-message">{message}</div>
      </div>
      <button 
        className="toast-close"
        onClick={handleClose}
        aria-label="Close notification"
      >
        ×
      </button>
      <div className="toast-progress">
        <div 
          className="toast-progress-bar"
          style={{ animationDuration: `${duration || toastConfig.duration}ms` }}
        />
      </div>
    </div>
  );
};

// Toast container component
const ToastContainer = ({ position = 'top-right', max = 5 }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = { ...toast, id };
    
    setToasts(prev => {
      const updated = [...prev, newToast];
      // Limit number of toasts
      if (updated.length > max) {
        return updated.slice(-max);
      }
      return updated;
    });
    
    return id;
  }, [max]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Create toast helper functions
  const toast = useCallback({
    success: (message, title) => addToast({ type: 'success', message, title }),
    error: (message, title) => addToast({ type: 'error', message, title }),
    warning: (message, title) => addToast({ type: 'warning', message, title }),
    info: (message, title) => addToast({ type: 'info', message, title }),
    custom: (config) => addToast(config)
  }, [addToast]);

  return (
    <ToastContext.Provider value={toast}>
      <div className={`toast-container toast-container-${position}`}>
        {toasts.map((toast, index) => (
          <Toast 
            key={toast.id}
            {...toast}
            onClose={removeToast}
            style={{ '--toast-index': index }}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Hook to use toast notifications
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast provider component
export const ToastProvider = ({ children, ...props }) => {
  return (
    <>
      <ToastContainer {...props} />
      {children}
    </>
  );
};

// Standalone toast function for non-React contexts
let standaloneToast = null;

export const showToast = (type, message, title) => {
  if (standaloneToast) {
    standaloneToast[type](message, title);
  } else {
    console.warn('Toast system not initialized. Wrap your app with ToastProvider.');
  }
};

// Initialize standalone toast
export const initToast = (toastFn) => {
  standaloneToast = toastFn;
};

export default ToastProvider;