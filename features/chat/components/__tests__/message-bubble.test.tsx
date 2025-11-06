import { render, screen } from '@testing-library/react'
import { MessageBubbleEnhanced } from '../message-bubble-enhanced'
import { Message } from '@/types'

const mockMessage: Message = {
  id: '1',
  chatId: 'chat-1',
  content: 'Hello, World!',
  senderId: 'user-1',
  sender: {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    avatarUrl: '/avatar.jpg',
  },
  createdAt: new Date('2025-01-01T12:00:00Z'),
  updatedAt: new Date('2025-01-01T12:00:00Z'),
  status: 'sent',
  readBy: [],
  reactions: [],
  attachments: [],
  replyTo: null,
}

describe('MessageBubbleEnhanced Component', () => {
  it('renders message content', () => {
    render(<MessageBubbleEnhanced message={mockMessage} isOwn={false} />)
    expect(screen.getByText('Hello, World!')).toBeInTheDocument()
  })

  it('displays sender name for other users', () => {
    render(<MessageBubbleEnhanced message={mockMessage} isOwn={false} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('does not display sender name for own messages', () => {
    render(<MessageBubbleEnhanced message={mockMessage} isOwn={true} />)
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
  })

  it('displays message timestamp', () => {
    render(<MessageBubbleEnhanced message={mockMessage} isOwn={false} />)
    // Timestamp should be visible
    expect(screen.getByText(/12:00/)).toBeInTheDocument()
  })

  it('shows status indicator for own messages', () => {
    const sentMessage = { ...mockMessage, status: 'sent' as const }
    render(<MessageBubbleEnhanced message={sentMessage} isOwn={true} />)
    // Should show sent indicator
    expect(screen.getByTestId('message-status')).toBeInTheDocument()
  })

  it('renders with attachments', () => {
    const messageWithAttachment: Message = {
      ...mockMessage,
      attachments: [
        {
          id: 'file-1',
          name: 'document.pdf',
          mimeType: 'application/pdf',
          size: 1024,
          url: '/files/document.pdf',
        },
      ],
    }
    render(<MessageBubbleEnhanced message={messageWithAttachment} isOwn={false} />)
    expect(screen.getByText('document.pdf')).toBeInTheDocument()
  })

  it('renders with reactions', () => {
    const messageWithReactions: Message = {
      ...mockMessage,
      reactions: [
        {
          id: 'reaction-1',
          emoji: '👍',
          userId: 'user-2',
          createdAt: new Date(),
        },
      ],
    }
    render(<MessageBubbleEnhanced message={messageWithReactions} isOwn={false} />)
    expect(screen.getByText('👍')).toBeInTheDocument()
  })

  it('applies correct styles for own messages', () => {
    const { container } = render(<MessageBubbleEnhanced message={mockMessage} isOwn={true} />)
    const bubble = container.querySelector('[data-own="true"]')
    expect(bubble).toBeInTheDocument()
  })

  it('applies correct styles for other messages', () => {
    const { container } = render(<MessageBubbleEnhanced message={mockMessage} isOwn={false} />)
    const bubble = container.querySelector('[data-own="false"]')
    expect(bubble).toBeInTheDocument()
  })
})
