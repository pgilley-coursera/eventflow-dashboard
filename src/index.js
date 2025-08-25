import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Mark app render start for performance monitoring
if (window.performance && window.performance.mark) {
  window.performance.mark('app-render-start');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Performance monitoring callback
reportWebVitals(metric => {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', metric);
  }
  
  // In production, this would send to analytics service
  // Example: sendToAnalytics(metric);
});

// Mark app render complete
if (window.performance && window.performance.mark) {
  window.performance.mark('app-render-complete');
  window.performance.measure('app-render', 'app-render-start', 'app-render-complete');
}
