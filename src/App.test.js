import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  test('renders EventFlow header', () => {
    render(<App />);
    const headerElement = screen.getByText(/EventFlow/i);
    expect(headerElement).toBeInTheDocument();
  });

  test('renders Analytics Dashboard subtitle', () => {
    render(<App />);
    const subtitleElement = screen.getByText(/Analytics Dashboard/i);
    expect(subtitleElement).toBeInTheDocument();
  });

  test('renders navigation tabs', () => {
    render(<App />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Sessions')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Speakers')).toBeInTheDocument();
  });

  test('renders skip to main content link for accessibility', () => {
    render(<App />);
    const skipLink = screen.getByText(/Skip to main content/i);
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  test('renders theme toggle button', () => {
    render(<App />);
    const themeToggle = screen.getByRole('button', { name: /Switch to/i });
    expect(themeToggle).toBeInTheDocument();
  });

  test('renders performance metrics in footer', () => {
    render(<App />);
    expect(screen.getByText(/Render:/i)).toBeInTheDocument();
    expect(screen.getByText(/Memory:/i)).toBeInTheDocument();
    expect(screen.getByText(/FPS:/i)).toBeInTheDocument();
  });
});
