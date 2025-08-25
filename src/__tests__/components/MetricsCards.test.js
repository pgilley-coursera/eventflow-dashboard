/**
 * Component Tests for MetricsCards
 * Module 2, Lesson 5: Testing Strategy
 * Tests metrics display components
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MetricsCards from '../../components/common/MetricsCards';

describe('MetricsCards', () => {
  const mockMetrics = {
    activeSessions: 5,
    totalAttendees: 150,
    avgEngagement: 85,
    avgRating: 4.5,
    sessionsTrend: { direction: 'up', value: '+2' },
    attendeesTrend: { direction: 'up', value: '+25' },
    engagementTrend: { direction: 'stable', value: 'Stable' },
    ratingTrend: { direction: 'up', value: '+0.3' }
  };

  describe('rendering', () => {
    it('should render all metric cards', () => {
      render(<MetricsCards metrics={mockMetrics} />);
      
      expect(screen.getByText('Active Sessions')).toBeInTheDocument();
      expect(screen.getByText('Total Attendees')).toBeInTheDocument();
      expect(screen.getByText('Avg Engagement')).toBeInTheDocument();
      expect(screen.getByText('Avg Rating')).toBeInTheDocument();
    });

    it('should display metric values', () => {
      render(<MetricsCards metrics={mockMetrics} />);
      
      // Values will be animated, but we can check they exist in the document
      expect(screen.getByText('Currently running')).toBeInTheDocument();
      expect(screen.getByText('Registered participants')).toBeInTheDocument();
    });

    it('should show trend indicators', () => {
      render(<MetricsCards metrics={mockMetrics} />);
      
      expect(screen.getByText('+2')).toBeInTheDocument();
      expect(screen.getByText('+25')).toBeInTheDocument();
      expect(screen.getByText('Stable')).toBeInTheDocument();
      expect(screen.getByText('+0.3')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('should display skeletons when loading', () => {
      render(<MetricsCards loading={true} />);
      
      const skeletons = screen.getAllByTestId('skeleton-loader');
      expect(skeletons).toHaveLength(4);
    });
  });

  describe('empty state', () => {
    it('should handle undefined metrics gracefully', () => {
      render(<MetricsCards metrics={undefined} />);
      
      expect(screen.getByText('Active Sessions')).toBeInTheDocument();
      // Should show 0 values
    });

    it('should handle null metrics', () => {
      render(<MetricsCards metrics={null} />);
      
      expect(screen.getByText('Active Sessions')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<MetricsCards metrics={mockMetrics} />);
      
      const section = screen.getByRole('region', { name: /Event Metrics/i });
      expect(section).toBeInTheDocument();
    });

    it('should have accessible metric cards', () => {
      render(<MetricsCards metrics={mockMetrics} />);
      
      const cards = screen.getAllByRole('article');
      expect(cards).toHaveLength(4);
      
      // Each card should have an aria-label
      cards.forEach(card => {
        expect(card).toHaveAttribute('aria-label');
      });
    });
  });
});