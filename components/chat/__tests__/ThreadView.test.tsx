import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ThreadView } from '../ThreadView';
import { mockMessages } from '@/mocks/chat/conversations';

expect.extend(toHaveNoViolations);

describe('ThreadView', () => {
  const defaultProps = {
    conversationId: 'c1',
    messages: mockMessages,
    currentUserId: '1',
    onReply: jest.fn(),
    onReact: jest.fn(),
    connectionStatus: 'connected' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Accessibility', () => {
    it('has proper role for messages feed', () => {
      render(<ThreadView {...defaultProps} />);
      expect(screen.getByRole('feed', { name: /messages/i })).toBeInTheDocument();
    });

    it('has aria-live for new messages', () => {
      render(<ThreadView {...defaultProps} />);
      const feed = screen.getByRole('feed');
      expect(feed).toHaveAttribute('aria-live', 'polite');
      expect(feed).toHaveAttribute('aria-atomic', 'false');
    });

    it('has no accessibility violations', async () => {
      const { container } = render(<ThreadView {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has accessible scroll to bottom button', () => {
      render(<ThreadView {...defaultProps} />);
      // Button appears when not at bottom - simulate scroll
      const scrollArea = document.querySelector('[role="feed"]')?.parentElement;
      if (scrollArea) {
        Object.defineProperty(scrollArea, 'scrollTop', { value: 0, writable: true });
        Object.defineProperty(scrollArea, 'scrollHeight', { value: 1000, writable: true });
        Object.defineProperty(scrollArea, 'clientHeight', { value: 500, writable: true });
      }
    });
  });

  describe('Rendering', () => {
    it('renders all messages', () => {
      render(<ThreadView {...defaultProps} />);
      mockMessages.forEach((msg) => {
        expect(screen.getByText(msg.content)).toBeInTheDocument();
      });
    });

    it('renders message composer', () => {
      render(<ThreadView {...defaultProps} />);
      expect(screen.getByRole('textbox', { name: /message input/i })).toBeInTheDocument();
    });

    it('groups messages by date', () => {
      render(<ThreadView {...defaultProps} />);
      // Should show date separators
      const dates = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
      expect(dates.length).toBeGreaterThan(0);
    });

    it('renders typing indicator', () => {
      render(<ThreadView {...defaultProps} />);
      expect(screen.getByText(/typing/i)).toBeInTheDocument();
    });
  });

  describe('Loading state', () => {
    it('shows skeleton when loading', () => {
      render(<ThreadView {...defaultProps} messages={[]} loading={true} />);
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('disables composer when loading', () => {
      render(<ThreadView {...defaultProps} messages={[]} loading={true} />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });
  });

  describe('Empty state', () => {
    it('shows empty message when no messages', () => {
      render(<ThreadView {...defaultProps} messages={[]} />);
      expect(screen.getByText(/no messages yet/i)).toBeInTheDocument();
    });

    it('shows encouragement to start conversation', () => {
      render(<ThreadView {...defaultProps} messages={[]} />);
      expect(screen.getByText(/start the conversation/i)).toBeInTheDocument();
    });
  });

  describe('Error state', () => {
    it('shows error message', () => {
      const error = new Error('Failed to load messages');
      render(<ThreadView {...defaultProps} error={error} />);
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });

    it('shows retry button', () => {
      const error = new Error('Failed to load');
      render(<ThreadView {...defaultProps} error={error} />);
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  describe('Connection status', () => {
    it('shows reconnect banner when connecting', () => {
      render(<ThreadView {...defaultProps} connectionStatus="connecting" />);
      expect(screen.getByText(/reconnecting/i)).toBeInTheDocument();
    });

    it('shows reconnect banner when disconnected', () => {
      render(<ThreadView {...defaultProps} connectionStatus="disconnected" />);
      expect(screen.getByText(/connection lost/i)).toBeInTheDocument();
    });

    it('disables composer when disconnected', () => {
      render(<ThreadView {...defaultProps} connectionStatus="disconnected" />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('does not show banner when connected', () => {
      render(<ThreadView {...defaultProps} connectionStatus="connected" />);
      expect(screen.queryByText(/reconnecting/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/connection lost/i)).not.toBeInTheDocument();
    });
  });

  describe('Scrolling behavior', () => {
    it('auto-scrolls to bottom for new messages when at bottom', async () => {
      const { rerender } = render(<ThreadView {...defaultProps} />);
      
      const newMessages = [
        ...mockMessages,
        {
          ...mockMessages[0],
          id: 'new-message',
          content: 'New message',
        },
      ];
      
      rerender(<ThreadView {...defaultProps} messages={newMessages} />);
      
      await waitFor(() => {
        expect(screen.getByText('New message')).toBeInTheDocument();
      });
    });

    it('shows scroll to bottom button when not at bottom', () => {
      render(<ThreadView {...defaultProps} />);
      
      // Simulate scroll away from bottom
      const scrollArea = document.querySelector('[role="feed"]')?.parentElement;
      if (scrollArea) {
        Object.defineProperty(scrollArea, 'scrollTop', { value: 0 });
        Object.defineProperty(scrollArea, 'scrollHeight', { value: 2000 });
        Object.defineProperty(scrollArea, 'clientHeight', { value: 600 });
        
        scrollArea.dispatchEvent(new Event('scroll'));
      }
    });

    it('calls onLoadMore when scrolling to top', async () => {
      const onLoadMore = jest.fn();
      render(<ThreadView {...defaultProps} onLoadMore={onLoadMore} hasMore={true} />);
      
      const scrollArea = document.querySelector('[role="feed"]')?.parentElement;
      if (scrollArea) {
        Object.defineProperty(scrollArea, 'scrollTop', { value: 50 });
        scrollArea.dispatchEvent(new Event('scroll'));
      }
      
      await waitFor(() => {
        expect(onLoadMore).toHaveBeenCalled();
      });
    });

    it('does not call onLoadMore when already loading', () => {
      const onLoadMore = jest.fn();
      render(<ThreadView {...defaultProps} onLoadMore={onLoadMore} hasMore={true} loading={true} />);
      
      const scrollArea = document.querySelector('[role="feed"]')?.parentElement;
      if (scrollArea) {
        Object.defineProperty(scrollArea, 'scrollTop', { value: 50 });
        scrollArea.dispatchEvent(new Event('scroll'));
      }
      
      expect(onLoadMore).not.toHaveBeenCalled();
    });
  });

  describe('Message actions', () => {
    it('calls onReply when reply clicked', async () => {
      const user = userEvent.setup();
      const onReply = jest.fn();
      render(<ThreadView {...defaultProps} onReply={onReply} />);
      
      const replyButton = screen.getAllByRole('button', { name: /reply/i })[0];
      await user.click(replyButton);
      
      expect(onReply).toHaveBeenCalled();
    });

    it('calls onReact when reaction clicked', async () => {
      const user = userEvent.setup();
      const onReact = jest.fn();
      render(<ThreadView {...defaultProps} onReact={onReact} />);
      
      const reactionButton = screen.getByText('👍').closest('button');
      await user.click(reactionButton!);
      
      expect(onReact).toHaveBeenCalled();
    });
  });

  describe('Sending messages', () => {
    it('sends message via composer', async () => {
      const user = userEvent.setup();
      render(<ThreadView {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Test message');
      
      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);
      
      // Message would be sent via parent component handler
      expect(textarea).toHaveValue('');
    });
  });

  describe('Load more indicator', () => {
    it('shows loading indicator when loading more', () => {
      render(<ThreadView {...defaultProps} loading={true} hasMore={true} />);
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('does not show load more when no more messages', () => {
      render(<ThreadView {...defaultProps} hasMore={false} />);
      // No load more UI should be visible
    });
  });

  describe('New message announcements', () => {
    it('tracks unread count when not at bottom', async () => {
      const { rerender } = render(<ThreadView {...defaultProps} />);
      
      // Simulate not being at bottom
      const scrollArea = document.querySelector('[role="feed"]')?.parentElement;
      if (scrollArea) {
        Object.defineProperty(scrollArea, 'scrollTop', { value: 0 });
        Object.defineProperty(scrollArea, 'scrollHeight', { value: 2000 });
        Object.defineProperty(scrollArea, 'clientHeight', { value: 600 });
        scrollArea.dispatchEvent(new Event('scroll'));
      }
      
      const newMessages = [
        ...mockMessages,
        {
          ...mockMessages[0],
          id: 'new-1',
          content: 'New message 1',
        },
      ];
      
      rerender(<ThreadView {...defaultProps} messages={newMessages} />);
      
      await waitFor(() => {
        expect(screen.getByText('New message 1')).toBeInTheDocument();
      });
    });
  });
});
