import type { Meta, StoryObj } from '@storybook/react';
import { ThreadView } from '@/components/chat/ThreadView';
import { mockMessages } from '@/mocks/chat/conversations';

const meta: Meta<typeof ThreadView> = {
  title: 'Chat/ThreadView',
  component: ThreadView,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="h-[700px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ThreadView>;

export const Default: Story = {
  args: {
    conversationId: 'c1',
    messages: mockMessages,
    currentUserId: '1',
    onReply: (messageId, content) => console.log('Reply:', { messageId, content }),
    onReact: (messageId, emoji) => console.log('React:', { messageId, emoji }),
    connectionStatus: 'connected',
  },
};

export const Loading: Story = {
  args: {
    conversationId: 'c1',
    messages: [],
    currentUserId: '1',
    onReply: () => {},
    onReact: () => {},
    loading: true,
    connectionStatus: 'connected',
  },
};

export const Empty: Story = {
  args: {
    conversationId: 'c1',
    messages: [],
    currentUserId: '1',
    onReply: () => {},
    onReact: () => {},
    connectionStatus: 'connected',
  },
};

export const Error: Story = {
  args: {
    conversationId: 'c1',
    messages: [],
    currentUserId: '1',
    onReply: () => {},
    onReact: () => {},
    error: new Error('Failed to load messages'),
    connectionStatus: 'connected',
  },
};

export const Connecting: Story = {
  args: {
    conversationId: 'c1',
    messages: mockMessages,
    currentUserId: '1',
    onReply: () => {},
    onReact: () => {},
    connectionStatus: 'connecting',
  },
};

export const Disconnected: Story = {
  args: {
    conversationId: 'c1',
    messages: mockMessages,
    currentUserId: '1',
    onReply: () => {},
    onReact: () => {},
    connectionStatus: 'disconnected',
  },
};

export const WithLoadMore: Story = {
  args: {
    conversationId: 'c1',
    messages: mockMessages,
    currentUserId: '1',
    onReply: () => {},
    onReact: () => {},
    onLoadMore: () => console.log('Load more'),
    hasMore: true,
    connectionStatus: 'connected',
  },
};

export const ManyMessages: Story = {
  args: {
    conversationId: 'c1',
    messages: [
      ...mockMessages,
      ...mockMessages.map((m, i) => ({
        ...m,
        id: `${m.id}-${i}`,
        content: `Message ${i + 1}: ${m.content}`,
      })),
    ],
    currentUserId: '1',
    onReply: () => {},
    onReact: () => {},
    connectionStatus: 'connected',
  },
};

export const DarkMode: Story = {
  args: {
    conversationId: 'c1',
    messages: mockMessages,
    currentUserId: '1',
    onReply: () => {},
    onReact: () => {},
    connectionStatus: 'connected',
  },
  decorators: [
    (Story) => (
      <div className="dark h-[700px]">
        <Story />
      </div>
    ),
  ],
  parameters: {
    backgrounds: { default: 'dark' },
  },
};
