import React, { useRef, useEffect } from 'react';
import { useFocusTrap, useAccessibility } from '../../hooks/useAccessibility';
import './AccessibleModal.css';

/**
 * Accessible Modal Component
 * WCAG AA compliant modal with focus trap and screen reader support
 */
const AccessibleModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium',
  showCloseButton = true,
  closeOnEscape = true,
  closeOnOverlayClick = true,
  ariaDescribedBy,
  ariaLabelledBy
}) => {
  const modalRef = useRef(null);
  const { announce } = useAccessibility();
  
  // Use focus trap when modal is open
  useFocusTrap(isOpen, modalRef);
  
  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);
  
  // Announce modal state changes
  useEffect(() => {
    if (isOpen) {
      announce(`${title} dialog opened`, 'assertive');
    }
  }, [isOpen, title, announce]);
  
  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };
  
  // Generate IDs for ARIA
  const titleId = ariaLabelledBy || `modal-title-${Math.random().toString(36).substr(2, 9)}`;
  const descId = ariaDescribedBy || `modal-desc-${Math.random().toString(36).substr(2, 9)}`;
  
  if (!isOpen) return null;
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className="modal-backdrop"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div
        className={`modal-container ${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        ref={modalRef}
        onClick={handleOverlayClick}
      >
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header">
            <h2 id={titleId} className="modal-title">
              {title}
            </h2>
            
            {showCloseButton && (
              <button
                className="modal-close"
                onClick={onClose}
                aria-label="Close dialog"
                type="button"
              >
                <span aria-hidden="true">×</span>
              </button>
            )}
          </div>
          
          {/* Body */}
          <div id={descId} className="modal-body">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default AccessibleModal;