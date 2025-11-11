import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ChatListItem } from '../ChatListItem';
import { mockConversations } from '@/mocks/chat/conversations';

expect.extend(toHaveNoViolations);

describe('ChatListItem', () => {
  const defaultProps = {
    conversation: mockConversations[0],
    selected: false,
    onClick: jest.fn(),
  };

  describe('Accessibility', () => {
    it('has proper role and aria attributes', () => {
      render(<ChatListItem {...defaultProps} />);
      const item = screen.getByRole('listitem');
      expect(item).toHaveAttribute('aria-label');
    });

    it('announces unread count for screen readers', () => {
      render(<ChatListItem {...defaultProps} />);
      const item = screen.getByRole('listitem');
      expect(item).toHaveAttribute('aria-label', expect.stringContaining('3 unread messages'));
    });

    it('has aria-current when selected', () => {
      render(<ChatListItem {...defaultProps} selected={true} />);
      const item = screen.getByRole('listitem');
      expect(item).toHaveAttribute('aria-current', 'true');
    });

    it('has no accessibility violations', async () => {
      const { container } = render(<ChatListItem {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has focus ring styles', () => {
      const { container } = render(<ChatListItem {...defaultProps} />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('focus:ring-2', 'focus:ring-primary');
    });
  });

  describe('Rendering', () => {
    it('renders conversation name', () => {
      render(<ChatListItem {...defaultProps} />);
      expect(screen.getByText(defaultProps.conversation.name)).toBeInTheDocument();
    });

    it('renders last message', () => {
      render(<ChatListItem {...defaultProps} />);
      expect(screen.getByText(defaultProps.conversation.lastMessage)).toBeInTheDocument();
    });

    it('renders unread badge', () => {
      render(<ChatListItem {...defaultProps} />);
      const badge = screen.getByText('3');
      expect(badge).toBeInTheDocument();
    });

    it('does not render unread badge when count is 0', () => {
      render(<ChatListItem {...defaultProps} conversation={mockConversations[1]} />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('shows typing indicator when users are typing', () => {
      render(<ChatListItem {...defaultProps} conversation={mockConversations[2]} />);
      expect(screen.getByText('typing...')).toBeInTheDocument();
    });

    it('renders presence badge', () => {
      const { container } = render(<ChatListItem {...defaultProps} />);
      expect(container.querySelector('[role="status"]')).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      render(<ChatListItem {...defaultProps} onClick={onClick} />);
      
      const item = screen.getByRole('listitem');
      await user.click(item);
      
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('applies selected styles', () => {
      const { container } = render(<ChatListItem {...defaultProps} selected={true} />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('bg-accent');
    });

    it('applies hover styles', () => {
      const { container } = render(<ChatListItem {...defaultProps} />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('hover:bg-accent/50');
    });
  });

  describe('States', () => {
    it('bolds text when there are unread messages', () => {
      const { container } = render(<ChatListItem {...defaultProps} />);
      const name = screen.getByText(defaultProps.conversation.name);
      expect(name).toHaveClass('font-bold');
    });

    it('uses normal font when no unread messages', () => {
      render(<ChatListItem {...defaultProps} conversation={mockConversations[1]} />);
      const name = screen.getByText(mockConversations[1].name);
      expect(name).toHaveClass('font-medium');
      expect(name).not.toHaveClass('font-bold');
    });

    it('shows relative timestamp', () => {
      render(<ChatListItem {...defaultProps} />);
      // Should show something like "3 hours ago"
      expect(screen.getByText(/ago/)).toBeInTheDocument();
    });
  });

  describe('Long content handling', () => {
    it('truncates long names', () => {
      const longName = 'This is a very long conversation name that should be truncated';
      const conversation = { ...mockConversations[0], name: longName };
      render(<ChatListItem {...defaultProps} conversation={conversation} />);
      
      const nameElement = screen.getByText(longName);
      expect(nameElement).toHaveClass('truncate');
    });

    it('truncates long messages', () => {
      const longMessage = 'This is a very long message that should be truncated to fit';
      const conversation = { ...mockConversations[0], lastMessage: longMessage };
      render(<ChatListItem {...defaultProps} conversation={conversation} />);
      
      const messageElement = screen.getByText(longMessage);
      expect(messageElement).toHaveClass('truncate');
    });
  });
});
