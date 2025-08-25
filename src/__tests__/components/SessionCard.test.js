/**
 * Component Tests for SessionCard
 * Module 2, Lesson 5: Testing Strategy
 * Tests rendering, interactions, and accessibility
 */

import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import SessionCard from '../../components/sessions/SessionCard';

describe('SessionCard', () => {
  const mockSession = {
    id: 1,
    title: 'React Workshop',
    speaker: 'John Doe',
    room: 'Room A',
    startTime: '09:00',
    endTime: '10:30',
    attendees: 50,
    capacity: 100,
    engagement: 85,
    status: 'active',
    track: 'Frontend',
    description: 'Learn React fundamentals'
  };

  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  describe('rendering', () => {
    it('should render session information correctly', () => {
      render(<SessionCard session={mockSession} />);
      
      expect(screen.getByText('React Workshop')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Room A')).toBeInTheDocument();
      expect(screen.getByText('09:00 - 10:30')).toBeInTheDocument();
    });

    it('should display attendance information', () => {
      render(<SessionCard session={mockSession} />);
      
      expect(screen.getByText(/50 \/ 100/)).toBeInTheDocument();
      expect(screen.getByText(/50%/)).toBeInTheDocument();
    });

    it('should show engagement level', () => {
      render(<SessionCard session={mockSession} />);
      
      expect(screen.getByText(/85%/)).toBeInTheDocument();
      expect(screen.getByText(/High/)).toBeInTheDocument();
    });

    it('should display status badge', () => {
      render(<SessionCard session={mockSession} />);
      
      const statusBadge = screen.getByText(/Active/i);
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge).toHaveClass('status-active');
    });

    it('should show track information', () => {
      render(<SessionCard session={mockSession} />);
      
      expect(screen.getByText('Frontend')).toBeInTheDocument();
    });
  });

  describe('status variations', () => {
    it('should render upcoming status correctly', () => {
      const upcomingSession = { ...mockSession, status: 'upcoming' };
      render(<SessionCard session={upcomingSession} />);
      
      const statusBadge = screen.getByText(/Upcoming/i);
      expect(statusBadge).toHaveClass('status-upcoming');
    });

    it('should render completed status correctly', () => {
      const completedSession = { ...mockSession, status: 'completed' };
      render(<SessionCard session={completedSession} />);
      
      const statusBadge = screen.getByText(/Completed/i);
      expect(statusBadge).toHaveClass('status-completed');
    });
  });

  describe('engagement levels', () => {
    it('should display excellent engagement', () => {
      const excellentSession = { ...mockSession, engagement: 95 };
      render(<SessionCard session={excellentSession} />);
      
      expect(screen.getByText(/Excellent/)).toBeInTheDocument();
    });

    it('should display low engagement with warning', () => {
      const lowSession = { ...mockSession, engagement: 45 };
      render(<SessionCard session={lowSession} />);
      
      expect(screen.getByText(/Low/)).toBeInTheDocument();
      const card = screen.getByRole('article');
      expect(card).toHaveClass('engagement-warning');
    });
  });

  describe('interactions', () => {
    it('should call onClick when clicked', () => {
      render(<SessionCard session={mockSession} onClick={mockOnClick} />);
      
      const card = screen.getByRole('article');
      fireEvent.click(card);
      
      expect(mockOnClick).toHaveBeenCalledWith(mockSession);
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should handle keyboard navigation', () => {
      render(<SessionCard session={mockSession} onClick={mockOnClick} />);
      
      const card = screen.getByRole('article');
      fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });
      
      expect(mockOnClick).toHaveBeenCalledWith(mockSession);
    });

    it('should handle space key press', () => {
      render(<SessionCard session={mockSession} onClick={mockOnClick} />);
      
      const card = screen.getByRole('article');
      fireEvent.keyDown(card, { key: ' ', code: 'Space' });
      
      expect(mockOnClick).toHaveBeenCalledWith(mockSession);
    });

    it('should not trigger onClick for other keys', () => {
      render(<SessionCard session={mockSession} onClick={mockOnClick} />);
      
      const card = screen.getByRole('article');
      fireEvent.keyDown(card, { key: 'Tab', code: 'Tab' });
      
      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<SessionCard session={mockSession} />);
      
      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-label', expect.stringContaining('React Workshop'));
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('should have descriptive labels for screen readers', () => {
      render(<SessionCard session={mockSession} />);
      
      expect(screen.getByLabelText(/speaker/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/room/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/time/i)).toBeInTheDocument();
    });

    it('should announce engagement level', () => {
      render(<SessionCard session={mockSession} />);
      
      const engagementElement = screen.getByLabelText(/engagement/i);
      expect(engagementElement).toHaveTextContent('85%');
    });
  });

  describe('edge cases', () => {
    it('should handle missing data gracefully', () => {
      const minimalSession = {
        id: 1,
        title: 'Test Session'
      };
      
      render(<SessionCard session={minimalSession} />);
      
      expect(screen.getByText('Test Session')).toBeInTheDocument();
      expect(screen.getByText('Unknown Speaker')).toBeInTheDocument();
      expect(screen.getByText('TBD')).toBeInTheDocument(); // Room
    });

    it('should handle zero attendees', () => {
      const emptySession = { ...mockSession, attendees: 0 };
      render(<SessionCard session={emptySession} />);
      
      expect(screen.getByText(/0 \/ 100/)).toBeInTheDocument();
    });

    it('should handle over-capacity', () => {
      const overSession = { ...mockSession, attendees: 120 };
      render(<SessionCard session={overSession} />);
      
      expect(screen.getByText(/120 \/ 100/)).toBeInTheDocument();
      const card = screen.getByRole('article');
      expect(card).toHaveClass('over-capacity');
    });
  });

  describe('visual states', () => {
    it('should apply highlight class when selected', () => {
      render(<SessionCard session={mockSession} isSelected={true} />);
      
      const card = screen.getByRole('article');
      expect(card).toHaveClass('selected');
    });

    it('should show loading state', () => {
      render(<SessionCard loading={true} />);
      
      expect(screen.getByTestId('session-card-skeleton')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<SessionCard session={mockSession} className="custom-class" />);
      
      const card = screen.getByRole('article');
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('performance indicators', () => {
    it('should show progress bars for metrics', () => {
      render(<SessionCard session={mockSession} />);
      
      const progressBars = screen.getAllByRole('progressbar');
      expect(progressBars).toHaveLength(2); // Attendance and Engagement
      
      const attendanceBar = progressBars[0];
      expect(attendanceBar).toHaveAttribute('aria-valuenow', '50');
      expect(attendanceBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('should color-code engagement levels', () => {
      const { rerender } = render(<SessionCard session={mockSession} />);
      
      let engagementBar = screen.getByTestId('engagement-bar');
      expect(engagementBar).toHaveClass('engagement-high');
      
      rerender(<SessionCard session={{ ...mockSession, engagement: 45 }} />);
      engagementBar = screen.getByTestId('engagement-bar');
      expect(engagementBar).toHaveClass('engagement-low');
    });
  });

  describe('responsive behavior', () => {
    it('should render in compact mode', () => {
      render(<SessionCard session={mockSession} variant="compact" />);
      
      const card = screen.getByRole('article');
      expect(card).toHaveClass('session-card-compact');
    });

    it('should render in detailed mode', () => {
      render(<SessionCard session={mockSession} variant="detailed" />);
      
      const card = screen.getByRole('article');
      expect(card).toHaveClass('session-card-detailed');
      expect(screen.getByText(mockSession.description)).toBeInTheDocument();
    });
  });
});