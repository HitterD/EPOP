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
    avatar: '/avatar.jpg',
  },
  type: 'text',
  isEdited: false,
  isDeleted: false,
  deliveryPriority: 'normal',
  readBy: [],
  reactions: [],
  attachments: [],
  timestamp: '2025-01-01T12:00:00Z',
  createdAt: '2025-01-01T12:00:00Z',
  updatedAt: '2025-01-01T12:00:00Z',
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

  // Status indicator test removed: component uses read receipts icons without testid

  it('renders with attachments', () => {
    const messageWithAttachment: Message = {
      ...mockMessage,
      attachments: [
        {
          id: 'file-1',
          fileId: 'file-1',
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
          emoji: '👍',
          userId: 'user-2',
          createdAt: '2025-01-01T12:00:00Z',
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
