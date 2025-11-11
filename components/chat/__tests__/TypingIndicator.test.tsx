import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TypingIndicator } from '../TypingIndicator';

expect.extend(toHaveNoViolations);

describe('TypingIndicator', () => {
  describe('Accessibility', () => {
    it('has aria-live and aria-atomic attributes', () => {
      const { container } = render(<TypingIndicator users={['Alice']} />);
      const indicator = container.firstChild as HTMLElement;
      expect(indicator).toHaveAttribute('aria-live', 'polite');
      expect(indicator).toHaveAttribute('aria-atomic', 'true');
    });

    it('has no accessibility violations with single user', async () => {
      const { container } = render(<TypingIndicator users={['Alice']} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations with multiple users', async () => {
      const { container } = render(<TypingIndicator users={['Alice', 'Bob', 'Carol']} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Content Rendering', () => {
    it('displays single user typing message', () => {
      render(<TypingIndicator users={['Alice']} />);
      expect(screen.getByText('Alice is typing...')).toBeInTheDocument();
    });

    it('displays two users typing message', () => {
      render(<TypingIndicator users={['Alice', 'Bob']} />);
      expect(screen.getByText('Alice and Bob are typing...')).toBeInTheDocument();
    });

    it('displays three users typing message', () => {
      render(<TypingIndicator users={['Alice', 'Bob', 'Carol']} />);
      expect(screen.getByText('Alice, Bob, and 1 other are typing...')).toBeInTheDocument();
    });

    it('displays many users typing message', () => {
      render(<TypingIndicator users={['Alice', 'Bob', 'Carol', 'Dave', 'Eve']} />);
      expect(screen.getByText('Alice, Bob, and 3 others are typing...')).toBeInTheDocument();
    });

    it('renders null when no users', () => {
      const { container } = render(<TypingIndicator users={[]} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Animation', () => {
    it('renders animated dots', () => {
      const { container } = render(<TypingIndicator users={['Alice']} />);
      const dots = container.querySelectorAll('.animate-bounce');
      expect(dots).toHaveLength(3);
    });

    it('applies different animation delays to dots', () => {
      const { container } = render(<TypingIndicator users={['Alice']} />);
      const dots = container.querySelectorAll('.animate-bounce');
      
      expect(dots[0]).toHaveStyle({ animationDelay: '0ms' });
      expect(dots[1]).toHaveStyle({ animationDelay: '150ms' });
      expect(dots[2]).toHaveStyle({ animationDelay: '300ms' });
    });
  });

  describe('Styling', () => {
    it('applies correct text styles', () => {
      const { container } = render(<TypingIndicator users={['Alice']} />);
      const indicator = container.firstChild as HTMLElement;
      expect(indicator).toHaveClass('text-sm', 'text-muted-foreground');
    });
  });
});
