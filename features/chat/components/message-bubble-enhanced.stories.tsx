import type { Meta, StoryObj } from '@storybook/react'
import { MessageBubbleEnhanced } from './message-bubble-enhanced'

const meta = {
  title: 'Chat/MessageBubbleEnhanced',
  component: MessageBubbleEnhanced,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MessageBubbleEnhanced>

export default meta
type Story = StoryObj<typeof meta>

const mockMessage = {
  id: '1',
  content: 'Hello! This is a test message.',
  senderId: 'user-1',
  chatId: 'chat-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  sender: {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: null,
  },
  readBy: [],
  reactions: [],
  attachments: [],
}

export const Default: Story = {
  args: {
    message: mockMessage,
    isOwn: false,
    showAvatar: true,
    showSender: true,
    showTimestamp: true,
  },
}

export const OwnMessage: Story = {
  args: {
    message: mockMessage,
    isOwn: true,
    showAvatar: false,
    showSender: false,
    showTimestamp: true,
  },
}

export const WithReactions: Story = {
  args: {
    message: {
      ...mockMessage,
      reactions: [
        { emoji: '👍', users: ['user-2', 'user-3'], count: 2 },
        { emoji: '❤️', users: ['user-4'], count: 1 },
      ],
    },
    isOwn: false,
    showAvatar: true,
  },
}

export const WithAttachment: Story = {
  args: {
    message: {
      ...mockMessage,
      content: 'Check out this file',
      attachments: [
        {
          id: 'file-1',
          name: 'document.pdf',
          size: 1024000,
          mimeType: 'application/pdf',
          url: '/files/document.pdf',
        },
      ],
    },
    isOwn: false,
    showAvatar: true,
  },
}

export const LongMessage: Story = {
  args: {
    message: {
      ...mockMessage,
      content:
        'This is a very long message that contains multiple sentences. It demonstrates how the message bubble handles longer text content. The bubble should wrap the text properly and maintain good readability. It should also handle line breaks and spacing appropriately.',
    },
    isOwn: false,
    showAvatar: true,
  },
}

export const WithReadReceipts: Story = {
  args: {
    message: {
      ...mockMessage,
      readBy: [
        { userId: 'user-2', readAt: new Date().toISOString() },
        { userId: 'user-3', readAt: new Date().toISOString() },
      ],
    },
    isOwn: true,
    showAvatar: false,
  },
}
