import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ChatList } from '../ChatList';
import { mockConversations } from '@/mocks/chat/conversations';

expect.extend(toHaveNoViolations);

describe('ChatList', () => {
  const defaultProps = {
    conversations: mockConversations,
    selectedId: mockConversations[0].id,
    onSelect: jest.fn(),
  };

  describe('Accessibility', () => {
    it('has proper role for list', () => {
      render(<ChatList {...defaultProps} />);
      expect(screen.getByRole('list', { name: /conversations/i })).toBeInTheDocument();
    });

    it('has searchbox with label', () => {
      render(<ChatList {...defaultProps} />);
      expect(screen.getByRole('searchbox', { name: /search conversations/i })).toBeInTheDocument();
    });

    it('has no accessibility violations', async () => {
      const { container } = render(<ChatList {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has keyboard navigation', async () => {
      const user = userEvent.setup();
      const onSelect = jest.fn();
      render(<ChatList {...defaultProps} onSelect={onSelect} />);
      
      const list = screen.getByRole('list');
      list.focus();
      
      await user.keyboard('{ArrowDown}');
      expect(onSelect).toHaveBeenCalled();
    });
  });

  describe('Rendering', () => {
    it('renders all conversations', () => {
      render(<ChatList {...defaultProps} />);
      mockConversations.forEach((conv) => {
        expect(screen.getByText(conv.name)).toBeInTheDocument();
      });
    });

    it('renders search input', () => {
      render(<ChatList {...defaultProps} />);
      expect(screen.getByPlaceholderText(/search conversations/i)).toBeInTheDocument();
    });

    it('renders filter buttons', () => {
      render(<ChatList {...defaultProps} />);
      expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /unread/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /mentions/i })).toBeInTheDocument();
    });
  });

  describe('Loading state', () => {
    it('shows skeleton when loading', () => {
      render(<ChatList {...defaultProps} loading={true} />);
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('does not show conversations when loading', () => {
      render(<ChatList {...defaultProps} loading={true} />);
      expect(screen.queryByText(mockConversations[0].name)).not.toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('shows empty message when no conversations', () => {
      render(<ChatList {...defaultProps} conversations={[]} />);
      expect(screen.getByText(/no conversations yet/i)).toBeInTheDocument();
    });

    it('shows call to action button', () => {
      render(<ChatList {...defaultProps} conversations={[]} />);
      expect(screen.getByRole('button', { name: /start a chat/i })).toBeInTheDocument();
    });
  });

  describe('Error state', () => {
    it('shows error message', () => {
      const error = new Error('Failed to load');
      render(<ChatList {...defaultProps} error={error} />);
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });

    it('shows retry button', () => {
      const error = new Error('Failed to load');
      render(<ChatList {...defaultProps} error={error} />);
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  describe('Search functionality', () => {
    it('filters conversations by search query', async () => {
      const user = userEvent.setup();
      render(<ChatList {...defaultProps} />);
      
      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'Engineering');
      
      await waitFor(() => {
        expect(screen.getByText(/engineering team/i)).toBeInTheDocument();
        expect(screen.queryByText(/bob smith/i)).not.toBeInTheDocument();
      });
    });

    it('shows no results message when search has no matches', async () => {
      const user = userEvent.setup();
      render(<ChatList {...defaultProps} />);
      
      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'NonexistentConversation');
      
      await waitFor(() => {
        expect(screen.getByText(/no conversations match/i)).toBeInTheDocument();
      });
    });
  });

  describe('Filter functionality', () => {
    it('shows unread count in filter button', () => {
      render(<ChatList {...defaultProps} />);
      const unreadButton = screen.getByRole('button', { name: /unread/i });
      expect(unreadButton).toHaveTextContent('(2)');
    });

    it('applies active filter style', () => {
      render(<ChatList {...defaultProps} filter="all" />);
      const allButton = screen.getByRole('button', { name: /^all$/i });
      expect(allButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Keyboard navigation', () => {
    it('navigates down with arrow key', async () => {
      const user = userEvent.setup();
      const onSelect = jest.fn();
      render(<ChatList {...defaultProps} onSelect={onSelect} />);
      
      const list = screen.getByRole('list');
      list.focus();
      
      await user.keyboard('{ArrowDown}');
      
      expect(onSelect).toHaveBeenCalledWith(mockConversations[1].id);
    });

    it('navigates up with arrow key', async () => {
      const user = userEvent.setup();
      const onSelect = jest.fn();
      render(<ChatList {...defaultProps} selectedId={mockConversations[1].id} onSelect={onSelect} />);
      
      const list = screen.getByRole('list');
      list.focus();
      
      await user.keyboard('{ArrowUp}');
      
      expect(onSelect).toHaveBeenCalledWith(mockConversations[0].id);
    });

    it('does not navigate past first item', async () => {
      const user = userEvent.setup();
      const onSelect = jest.fn();
      render(<ChatList {...defaultProps} onSelect={onSelect} />);
      
      const list = screen.getByRole('list');
      list.focus();
      
      await user.keyboard('{ArrowUp}');
      
      expect(onSelect).not.toHaveBeenCalled();
    });

    it('does not navigate past last item', async () => {
      const user = userEvent.setup();
      const onSelect = jest.fn();
      const lastId = mockConversations[mockConversations.length - 1].id;
      render(<ChatList {...defaultProps} selectedId={lastId} onSelect={onSelect} />);
      
      const list = screen.getByRole('list');
      list.focus();
      
      await user.keyboard('{ArrowDown}');
      
      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  describe('Interaction', () => {
    it('calls onSelect when conversation clicked', async () => {
      const user = userEvent.setup();
      const onSelect = jest.fn();
      render(<ChatList {...defaultProps} onSelect={onSelect} />);
      
      const conversation = screen.getByText(mockConversations[1].name);
      await user.click(conversation);
      
      expect(onSelect).toHaveBeenCalledWith(mockConversations[1].id);
    });
  });
});
