/**
 * App Component Tests
 * Module 2, Lesson 5: Testing Strategy
 * Tests main app component functionality
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

// Mock child components to isolate App testing
jest.mock('../components/layout/Dashboard', () => {
  return function Dashboard() {
    return <div>Dashboard Component</div>;
  };
});

jest.mock('../components/sessions/SessionList', () => {
  return function SessionList() {
    return <div>SessionList Component</div>;
  };
});

jest.mock('../components/analytics/AttendanceChart', () => {
  return function AttendanceChart() {
    return <div>AttendanceChart Component</div>;
  };
});

jest.mock('../components/analytics/TrendChart', () => {
  return function TrendChart() {
    return <div>TrendChart Component</div>;
  };
});

jest.mock('../components/speakers/SpeakerPerformance', () => {
  return function SpeakerPerformance() {
    return <div>SpeakerPerformance Component</div>;
  };
});

jest.mock('../components/analytics/PerformanceHistory', () => {
  return function PerformanceHistory() {
    return <div>PerformanceHistory Component</div>;
  };
});

jest.mock('../components/common/PerformanceDisplay', () => {
  return function PerformanceDisplay() {
    return <div>Performance Display</div>;
  };
});

// Mock hooks
jest.mock('../hooks/useRealtimeData', () => ({
  useRealtimeData: () => ({
    data: {
      sessions: [],
      speakers: [],
      metrics: {
        activeSessions: 5,
        totalAttendees: 100,
        avgEngagement: 85,
        avgRating: 4.5
      }
    },
    isLoading: false,
    error: null
  })
}));

jest.mock('../hooks/usePerformanceMonitor', () => ({
  __esModule: true,
  default: () => ({
    markRenderStart: jest.fn(),
    markRenderEnd: jest.fn(),
    metrics: {},
    getPerformanceRating: () => 'good'
  })
}));

describe('App Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('EventFlow')).toBeInTheDocument();
  });

  it('displays the header with title', () => {
    render(<App />);
    expect(screen.getByText('EventFlow')).toBeInTheDocument();
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
  });

  it('renders navigation tabs', () => {
    render(<App />);
    
    expect(screen.getByRole('tab', { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Sessions/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Analytics/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Speakers/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Performance/i })).toBeInTheDocument();
  });

  it('switches between tabs', () => {
    render(<App />);
    
    // Initially shows dashboard
    expect(screen.getByText('Dashboard Component')).toBeInTheDocument();
    
    // Click Sessions tab
    const sessionsTab = screen.getByRole('tab', { name: /Sessions/i });
    fireEvent.click(sessionsTab);
    
    expect(screen.getByText('SessionList Component')).toBeInTheDocument();
  });

  it('handles theme toggle', () => {
    render(<App />);
    
    const themeToggle = screen.getByLabelText(/Switch to/i);
    
    // Click to toggle theme
    fireEvent.click(themeToggle);
    
    // Check localStorage was updated
    expect(localStorage.getItem('eventflow-theme')).toBeTruthy();
  });

  it('displays footer with copyright', () => {
    render(<App />);
    
    expect(screen.getByText(/© 2025 EventFlow Solutions/)).toBeInTheDocument();
  });

  it('has skip navigation links for accessibility', () => {
    render(<App />);
    
    // Skip links might be visually hidden but should exist in DOM
    const skipLinks = document.querySelectorAll('.skip-link');
    expect(skipLinks.length).toBeGreaterThan(0);
  });

  it('has proper ARIA attributes on navigation', () => {
    render(<App />);
    
    const nav = screen.getByRole('navigation', { name: /Main navigation/i });
    expect(nav).toBeInTheDocument();
    
    const tablist = screen.getByRole('tablist');
    expect(tablist).toBeInTheDocument();
  });

  it('marks active tab correctly', () => {
    render(<App />);
    
    const dashboardTab = screen.getByRole('tab', { name: /Dashboard/i });
    expect(dashboardTab).toHaveAttribute('aria-selected', 'true');
    expect(dashboardTab).toHaveClass('active');
    
    // Click another tab
    const sessionsTab = screen.getByRole('tab', { name: /Sessions/i });
    fireEvent.click(sessionsTab);
    
    expect(sessionsTab).toHaveAttribute('aria-selected', 'true');
    expect(dashboardTab).toHaveAttribute('aria-selected', 'false');
  });

  it('renders main content area', () => {
    render(<App />);
    
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute('id', 'main-content');
  });

  it('renders footer with performance display', () => {
    render(<App />);
    
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
    expect(screen.getByText('Performance Display')).toBeInTheDocument();
  });
});