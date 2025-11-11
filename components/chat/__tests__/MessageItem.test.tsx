import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MessageItem } from '../MessageItem';
import { mockMessages, mockSendingMessage, mockFailedMessage } from '@/mocks/chat/conversations';

expect.extend(toHaveNoViolations);

describe('MessageItem', () => {
  const defaultProps = {
    message: mockMessages[0],
    isMine: false,
    onReply: jest.fn(),
    onReact: jest.fn(),
  };

  describe('Accessibility', () => {
    it('has proper role and aria-label', () => {
      render(<MessageItem {...defaultProps} />);
      const article = screen.getByRole('article');
      expect(article).toHaveAttribute('aria-label');
    });

    it('has no accessibility violations', async () => {
      const { container } = render(<MessageItem {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has accessible reaction buttons', () => {
      render(<MessageItem {...defaultProps} />);
      const reactionButtons = screen.getAllByRole('button');
      reactionButtons.forEach((button) => {
        expect(button).toHaveAccessibleName();
      });
    });

    it('announces read receipts to screen readers', () => {
      render(<MessageItem {...defaultProps} isMine={true} />);
      const readReceipt = screen.getByText(/read by/i);
      expect(readReceipt).toHaveAttribute('aria-label');
    });
  });

  describe('Rendering', () => {
    it('renders message content', () => {
      render(<MessageItem {...defaultProps} />);
      expect(screen.getByText(defaultProps.message.content)).toBeInTheDocument();
    });

    it('renders author name', () => {
      render(<MessageItem {...defaultProps} />);
      expect(screen.getByText(defaultProps.message.author.name)).toBeInTheDocument();
    });

    it('renders avatar', () => {
      render(<MessageItem {...defaultProps} />);
      const avatar = screen.getByAltText(defaultProps.message.author.name);
      expect(avatar).toBeInTheDocument();
    });

    it('renders timestamp', () => {
      render(<MessageItem {...defaultProps} />);
      expect(screen.getByText(/ago/)).toBeInTheDocument();
    });

    it('shows edited label when message is edited', () => {
      const editedMessage = { ...mockMessages[0], isEdited: true };
      render(<MessageItem {...defaultProps} message={editedMessage} />);
      expect(screen.getByText('(edited)')).toBeInTheDocument();
    });
  });

  describe('Reactions', () => {
    it('renders reaction badges', () => {
      render(<MessageItem {...defaultProps} />);
      mockMessages[0].reactions.forEach((reaction) => {
        expect(screen.getByText(reaction.emoji)).toBeInTheDocument();
      });
    });

    it('calls onReact when reaction clicked', async () => {
      const user = userEvent.setup();
      const onReact = jest.fn();
      render(<MessageItem {...defaultProps} onReact={onReact} />);
      
      const reactionButton = screen.getByText('👍').closest('button');
      await user.click(reactionButton!);
      
      expect(onReact).toHaveBeenCalledWith('👍');
    });

    it('highlights reactions from current user', () => {
      const { container } = render(<MessageItem {...defaultProps} />);
      const reactionButtons = container.querySelectorAll('[class*="border-primary"]');
      expect(reactionButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Attachments', () => {
    it('renders attachment chips', () => {
      render(<MessageItem {...defaultProps} message={mockMessages[3]} />);
      expect(screen.getByText('project-specs.pdf')).toBeInTheDocument();
    });

    it('shows file size', () => {
      render(<MessageItem {...defaultProps} message={mockMessages[3]} />);
      expect(screen.getByText(/MB/)).toBeInTheDocument();
    });
  });

  describe('Message states', () => {
    it('shows sending indicator', () => {
      render(<MessageItem {...defaultProps} message={mockSendingMessage} isMine={true} />);
      expect(screen.getByRole('article')).toHaveClass('opacity-60');
    });

    it('shows failed indicator', () => {
      render(<MessageItem {...defaultProps} message={mockFailedMessage} isMine={true} />);
      expect(screen.getByText(/failed to send/i)).toBeInTheDocument();
    });

    it('shows retry button for failed messages', () => {
      render(<MessageItem {...defaultProps} message={mockFailedMessage} isMine={true} />);
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('shows read receipts for own messages', () => {
      render(<MessageItem {...defaultProps} isMine={true} />);
      expect(screen.getByText(/read by/i)).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('shows reply button on hover', () => {
      render(<MessageItem {...defaultProps} />);
      expect(screen.getByRole('button', { name: /reply/i })).toBeInTheDocument();
    });

    it('calls onReply when reply clicked', async () => {
      const user = userEvent.setup();
      const onReply = jest.fn();
      render(<MessageItem {...defaultProps} onReply={onReply} />);
      
      const replyButton = screen.getByRole('button', { name: /reply/i });
      await user.click(replyButton);
      
      expect(onReply).toHaveBeenCalled();
    });

    it('shows actions menu for own messages', () => {
      render(<MessageItem {...defaultProps} isMine={true} onEdit={jest.fn()} onDelete={jest.fn()} />);
      expect(screen.getByRole('button', { name: /message actions/i })).toBeInTheDocument();
    });

    it('calls onEdit when edit clicked', async () => {
      const user = userEvent.setup();
      const onEdit = jest.fn();
      render(<MessageItem {...defaultProps} isMine={true} onEdit={onEdit} onDelete={jest.fn()} />);
      
      const menuButton = screen.getByRole('button', { name: /message actions/i });
      await user.click(menuButton);
      
      const editButton = screen.getByRole('menuitem', { name: /edit/i });
      await user.click(editButton);
      
      expect(onEdit).toHaveBeenCalled();
    });

    it('calls onDelete when delete clicked', async () => {
      const user = userEvent.setup();
      const onDelete = jest.fn();
      render(<MessageItem {...defaultProps} isMine={true} onEdit={jest.fn()} onDelete={onDelete} />);
      
      const menuButton = screen.getByRole('button', { name: /message actions/i });
      await user.click(menuButton);
      
      const deleteButton = screen.getByRole('menuitem', { name: /delete/i });
      await user.click(deleteButton);
      
      expect(onDelete).toHaveBeenCalled();
    });
  });

  describe('Layout', () => {
    it('aligns other messages to left', () => {
      const { container } = render(<MessageItem {...defaultProps} isMine={false} />);
      const wrapper = container.firstChild;
      expect(wrapper).not.toHaveClass('flex-row-reverse');
    });

    it('aligns own messages to right', () => {
      const { container } = render(<MessageItem {...defaultProps} isMine={true} />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('flex-row-reverse');
    });

    it('uses primary color for own messages', () => {
      const { container } = render(<MessageItem {...defaultProps} isMine={true} />);
      const content = container.querySelector('.bg-primary');
      expect(content).toBeInTheDocument();
    });

    it('uses muted color for other messages', () => {
      const { container } = render(<MessageItem {...defaultProps} isMine={false} />);
      const content = container.querySelector('.bg-muted');
      expect(content).toBeInTheDocument();
    });
  });

  describe('Long content', () => {
    it('wraps long messages', () => {
      const longMessage = { ...mockMessages[0], content: 'A'.repeat(500) };
      render(<MessageItem {...defaultProps} message={longMessage} />);
      const content = screen.getByText('A'.repeat(500));
      expect(content).toHaveClass('whitespace-pre-wrap', 'break-words');
    });
  });
});
