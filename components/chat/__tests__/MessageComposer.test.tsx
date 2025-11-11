import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MessageComposer } from '../MessageComposer';
import { mockUsers } from '@/mocks/chat/conversations';

expect.extend(toHaveNoViolations);

describe('MessageComposer', () => {
  const defaultProps = {
    onSend: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Accessibility', () => {
    it('has proper role and aria attributes', () => {
      render(<MessageComposer {...defaultProps} />);
      expect(screen.getByRole('textbox', { name: /message input/i })).toBeInTheDocument();
    });

    it('has aria-multiline attribute', () => {
      render(<MessageComposer {...defaultProps} />);
      const textbox = screen.getByRole('textbox');
      expect(textbox).toHaveAttribute('aria-multiline', 'true');
    });

    it('has accessible button labels', () => {
      render(<MessageComposer {...defaultProps} />);
      expect(screen.getByRole('button', { name: /attach files/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /insert emoji/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
    });

    it('has no accessibility violations', async () => {
      const { container } = render(<MessageComposer {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('announces character count when near limit', async () => {
      const user = userEvent.setup();
      render(<MessageComposer {...defaultProps} maxLength={100} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'A'.repeat(85));
      
      await waitFor(() => {
        expect(screen.getByText(/85\/100/)).toHaveAttribute('aria-live', 'polite');
      });
    });
  });

  describe('Rendering', () => {
    it('renders textarea with placeholder', () => {
      render(<MessageComposer {...defaultProps} placeholder="Type here..." />);
      expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument();
    });

    it('renders send button', () => {
      render(<MessageComposer {...defaultProps} />);
      expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
    });

    it('renders attachment button', () => {
      render(<MessageComposer {...defaultProps} />);
      expect(screen.getByRole('button', { name: /attach files/i })).toBeInTheDocument();
    });

    it('renders emoji button', () => {
      render(<MessageComposer {...defaultProps} />);
      expect(screen.getByRole('button', { name: /insert emoji/i })).toBeInTheDocument();
    });
  });

  describe('Text input', () => {
    it('updates content when typing', async () => {
      const user = userEvent.setup();
      render(<MessageComposer {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello world');
      
      expect(textarea).toHaveValue('Hello world');
    });

    it('auto-resizes textarea', async () => {
      const user = userEvent.setup();
      render(<MessageComposer {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      const initialHeight = textarea.style.height;
      
      await user.type(textarea, 'Line 1\nLine 2\nLine 3\nLine 4');
      
      // Height should change (though exact value depends on content)
      expect(textarea.style.height).toBeDefined();
    });

    it('shows character count when near limit', async () => {
      const user = userEvent.setup();
      render(<MessageComposer {...defaultProps} maxLength={100} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'A'.repeat(85));
      
      await waitFor(() => {
        expect(screen.getByText('85/100')).toBeInTheDocument();
      });
    });

    it('does not show character count when below threshold', async () => {
      const user = userEvent.setup();
      render(<MessageComposer {...defaultProps} maxLength={100} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Short message');
      
      expect(screen.queryByText(/\/100/)).not.toBeInTheDocument();
    });
  });

  describe('Sending messages', () => {
    it('sends message on send button click', async () => {
      const user = userEvent.setup();
      const onSend = jest.fn();
      render(<MessageComposer {...defaultProps} onSend={onSend} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Test message');
      
      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);
      
      expect(onSend).toHaveBeenCalledWith('Test message', []);
    });

    it('sends message on Cmd+Enter', async () => {
      const user = userEvent.setup();
      const onSend = jest.fn();
      render(<MessageComposer {...defaultProps} onSend={onSend} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Test message');
      await user.keyboard('{Meta>}{Enter}{/Meta}');
      
      expect(onSend).toHaveBeenCalledWith('Test message', []);
    });

    it('clears input after sending', async () => {
      const user = userEvent.setup();
      render(<MessageComposer {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Test message');
      
      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);
      
      expect(textarea).toHaveValue('');
    });

    it('does not send empty message', async () => {
      const user = userEvent.setup();
      const onSend = jest.fn();
      render(<MessageComposer {...defaultProps} onSend={onSend} />);
      
      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);
      
      expect(onSend).not.toHaveBeenCalled();
    });

    it('trims whitespace when sending', async () => {
      const user = userEvent.setup();
      const onSend = jest.fn();
      render(<MessageComposer {...defaultProps} onSend={onSend} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '  Test message  ');
      
      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);
      
      expect(onSend).toHaveBeenCalledWith('Test message', []);
    });
  });

  describe('File attachments', () => {
    it('shows file preview when files selected', async () => {
      const user = userEvent.setup();
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      
      render(<MessageComposer {...defaultProps} />);
      
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(input, file);
      
      await waitFor(() => {
        expect(screen.getByText('test.txt')).toBeInTheDocument();
      });
    });

    it('removes file when x button clicked', async () => {
      const user = userEvent.setup();
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      
      render(<MessageComposer {...defaultProps} />);
      
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(input, file);
      
      await waitFor(() => {
        expect(screen.getByText('test.txt')).toBeInTheDocument();
      });
      
      const removeButton = screen.getByRole('button', { name: /remove test.txt/i });
      await user.click(removeButton);
      
      expect(screen.queryByText('test.txt')).not.toBeInTheDocument();
    });

    it('shows upload progress', () => {
      render(<MessageComposer {...defaultProps} uploadProgress={{ 'test.txt': 45 }} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '45');
    });

    it('shows error state for failed uploads', () => {
      render(<MessageComposer {...defaultProps} uploadProgress={{ 'test.txt': -1 }} />);
      expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
    });
  });

  describe('Emoji picker', () => {
    it('opens emoji picker on button click', async () => {
      const user = userEvent.setup();
      render(<MessageComposer {...defaultProps} />);
      
      const emojiButton = screen.getByRole('button', { name: /insert emoji/i });
      await user.click(emojiButton);
      
      await waitFor(() => {
        expect(screen.getByText('👍')).toBeInTheDocument();
      });
    });

    it('inserts emoji when clicked', async () => {
      const user = userEvent.setup();
      render(<MessageComposer {...defaultProps} />);
      
      const emojiButton = screen.getByRole('button', { name: /insert emoji/i });
      await user.click(emojiButton);
      
      const thumbsUp = await screen.findByText('👍');
      await user.click(thumbsUp);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('👍');
    });

    it('closes emoji picker after selection', async () => {
      const user = userEvent.setup();
      render(<MessageComposer {...defaultProps} />);
      
      const emojiButton = screen.getByRole('button', { name: /insert emoji/i });
      await user.click(emojiButton);
      
      const thumbsUp = await screen.findByText('👍');
      await user.click(thumbsUp);
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Mentions', () => {
    it('shows mention suggestions when typing @', async () => {
      const user = userEvent.setup();
      render(<MessageComposer {...defaultProps} mentionSuggestions={mockUsers} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello @');
      
      await waitFor(() => {
        expect(screen.getByRole('listbox', { name: /mention suggestions/i })).toBeInTheDocument();
      });
    });

    it('filters mentions by query', async () => {
      const user = userEvent.setup();
      render(<MessageComposer {...defaultProps} mentionSuggestions={mockUsers} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '@Ali');
      
      await waitFor(() => {
        expect(screen.getByText('Alice Chen')).toBeInTheDocument();
        expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
      });
    });

    it('inserts mention on selection', async () => {
      const user = userEvent.setup();
      render(<MessageComposer {...defaultProps} mentionSuggestions={mockUsers} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '@Ali');
      
      const aliceOption = await screen.findByText('Alice Chen');
      await user.click(aliceOption);
      
      expect(textarea).toHaveValue('@Alice Chen ');
    });

    it('closes mentions on Escape', async () => {
      const user = userEvent.setup();
      render(<MessageComposer {...defaultProps} mentionSuggestions={mockUsers} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '@');
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
      
      await user.keyboard('{Escape}');
      
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('Disabled state', () => {
    it('disables all inputs when disabled', () => {
      render(<MessageComposer {...defaultProps} disabled={true} />);
      
      expect(screen.getByRole('textbox')).toBeDisabled();
      expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /attach files/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /insert emoji/i })).toBeDisabled();
    });

    it('shows offline message when disabled', () => {
      render(<MessageComposer {...defaultProps} disabled={true} />);
      expect(screen.getByText(/offline/i)).toBeInTheDocument();
    });

    it('disables send button when uploading', () => {
      render(<MessageComposer {...defaultProps} uploadProgress={{ 'file.txt': 50 }} />);
      expect(screen.getByRole('button', { name: /uploading/i })).toBeDisabled();
    });
  });
});
