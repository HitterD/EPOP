import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ReconnectBanner } from '../ReconnectBanner';

expect.extend(toHaveNoViolations);

describe('ReconnectBanner', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Accessibility', () => {
    it('has proper alert role and aria-live', () => {
      const { container } = render(<ReconnectBanner status="disconnected" />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveAttribute('aria-live', 'assertive');
    });

    it('has no accessibility violations (connecting)', async () => {
      const { container } = render(<ReconnectBanner status="connecting" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations (disconnected)', async () => {
      const { container } = render(<ReconnectBanner status="disconnected" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('retry button has accessible label', () => {
      render(<ReconnectBanner status="disconnected" onRetry={jest.fn()} />);
      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeInTheDocument();
    });
  });

  describe('Visual States', () => {
    it('displays connecting message with spinner', () => {
      render(<ReconnectBanner status="connecting" />);
      expect(screen.getByText('Reconnecting...')).toBeInTheDocument();
      // Spinner icon should be present
      const { container } = render(<ReconnectBanner status="connecting" />);
      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('displays disconnected message', () => {
      render(<ReconnectBanner status="disconnected" />);
      expect(screen.getByText('Connection lost')).toBeInTheDocument();
    });

    it('shows yellow background for connecting state', () => {
      const { container } = render(<ReconnectBanner status="connecting" />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toHaveClass('bg-yellow-500/10', 'border-yellow-500');
    });

    it('shows red background for disconnected state', () => {
      const { container } = render(<ReconnectBanner status="disconnected" />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toHaveClass('bg-red-500/10', 'border-red-500');
    });
  });

  describe('Retry Functionality', () => {
    it('shows retry button when onRetry provided and disconnected', () => {
      render(<ReconnectBanner status="disconnected" onRetry={jest.fn()} />);
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('does not show retry button when connecting', () => {
      render(<ReconnectBanner status="connecting" onRetry={jest.fn()} />);
      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
    });

    it('calls onRetry when retry button clicked', async () => {
      const user = userEvent.setup({ delay: null });
      const onRetry = jest.fn();
      render(<ReconnectBanner status="disconnected" onRetry={onRetry} />);
      
      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);
      
      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('Auto-retry Countdown', () => {
    it('displays countdown when autoRetryIn provided', () => {
      render(<ReconnectBanner status="disconnected" autoRetryIn={5} onRetry={jest.fn()} />);
      expect(screen.getByText(/retrying in 5s/i)).toBeInTheDocument();
    });

    it('decrements countdown every second', () => {
      render(<ReconnectBanner status="disconnected" autoRetryIn={5} onRetry={jest.fn()} />);
      
      expect(screen.getByText(/retrying in 5s/i)).toBeInTheDocument();
      
      jest.advanceTimersByTime(1000);
      expect(screen.getByText(/retrying in 4s/i)).toBeInTheDocument();
      
      jest.advanceTimersByTime(1000);
      expect(screen.getByText(/retrying in 3s/i)).toBeInTheDocument();
    });

    it('calls onRetry when countdown reaches 0', async () => {
      const onRetry = jest.fn();
      render(<ReconnectBanner status="disconnected" autoRetryIn={3} onRetry={onRetry} />);
      
      jest.advanceTimersByTime(3000);
      
      await waitFor(() => {
        expect(onRetry).toHaveBeenCalledTimes(1);
      });
    });

    it('cleans up timer on unmount', () => {
      const { unmount } = render(
        <ReconnectBanner status="disconnected" autoRetryIn={5} onRetry={jest.fn()} />
      );
      
      unmount();
      
      // Advance time to ensure timer doesn't fire
      jest.advanceTimersByTime(5000);
    });
  });

  describe('Color Coding', () => {
    it('uses yellow icon for connecting', () => {
      const { container } = render(<ReconnectBanner status="connecting" />);
      const icon = container.querySelector('.text-yellow-600');
      expect(icon).toBeInTheDocument();
    });

    it('uses red icon for disconnected', () => {
      const { container } = render(<ReconnectBanner status="disconnected" />);
      const icon = container.querySelector('.text-red-600');
      expect(icon).toBeInTheDocument();
    });
  });
});
