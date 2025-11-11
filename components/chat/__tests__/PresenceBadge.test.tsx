import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { PresenceBadge } from '../PresenceBadge';

expect.extend(toHaveNoViolations);

describe('PresenceBadge', () => {
  describe('Accessibility', () => {
    it('has proper role and aria-label', () => {
      render(<PresenceBadge status="online" />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveAttribute('aria-label', 'Status: online');
    });

    it('has no accessibility violations (online)', async () => {
      const { container } = render(<PresenceBadge status="online" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations (away)', async () => {
      const { container } = render(<PresenceBadge status="away" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations (offline)', async () => {
      const { container } = render(<PresenceBadge status="offline" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Visual Rendering', () => {
    it('applies correct color class for online status', () => {
      const { container } = render(<PresenceBadge status="online" />);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('bg-green-500');
    });

    it('applies correct color class for away status', () => {
      const { container } = render(<PresenceBadge status="away" />);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('bg-yellow-500');
    });

    it('applies correct color class for offline status', () => {
      const { container } = render(<PresenceBadge status="offline" />);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('bg-gray-400');
    });
  });

  describe('Sizing', () => {
    it('applies small size class', () => {
      const { container } = render(<PresenceBadge status="online" size="sm" />);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('w-2', 'h-2');
    });

    it('applies medium size class by default', () => {
      const { container } = render(<PresenceBadge status="online" />);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('w-3', 'h-3');
    });

    it('applies large size class', () => {
      const { container } = render(<PresenceBadge status="online" size="lg" />);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('w-4', 'h-4');
    });
  });

  describe('Animation', () => {
    it('shows pulse animation when enabled for online status', () => {
      const { container } = render(<PresenceBadge status="online" showPulse />);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('animate-pulse');
    });

    it('does not show pulse animation when disabled', () => {
      const { container } = render(<PresenceBadge status="online" showPulse={false} />);
      const badge = container.firstChild as HTMLElement;
      expect(badge).not.toHaveClass('animate-pulse');
    });

    it('does not show pulse for away status even if enabled', () => {
      const { container } = render(<PresenceBadge status="away" showPulse />);
      const badge = container.firstChild as HTMLElement;
      expect(badge).not.toHaveClass('animate-pulse');
    });
  });

  describe('Custom className', () => {
    it('merges custom className with base classes', () => {
      const { container } = render(
        <PresenceBadge status="online" className="custom-class" />
      );
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('custom-class', 'bg-green-500', 'rounded-full');
    });
  });
});
