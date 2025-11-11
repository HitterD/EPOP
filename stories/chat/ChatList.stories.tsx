import type { Meta, StoryObj } from '@storybook/react';
import { ChatList } from '@/components/chat/ChatList';
import { mockConversations } from '@/mocks/chat/conversations';

const meta: Meta<typeof ChatList> = {
  title: 'Chat/ChatList',
  component: ChatList,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="h-[600px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ChatList>;

export const Default: Story = {
  args: {
    conversations: mockConversations,
    selectedId: mockConversations[0].id,
    onSelect: (id) => console.log('Selected:', id),
    filter: 'all',
  },
};

export const Loading: Story = {
  args: {
    conversations: [],
    onSelect: () => {},
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    conversations: [],
    onSelect: () => {},
    loading: false,
  },
};

export const Error: Story = {
  args: {
    conversations: [],
    onSelect: () => {},
    error: new Error('Failed to load conversations'),
  },
};

export const UnreadFilter: Story = {
  args: {
    conversations: mockConversations,
    selectedId: mockConversations[0].id,
    onSelect: (id) => console.log('Selected:', id),
    filter: 'unread',
  },
};

export const ManyConversations: Story = {
  args: {
    conversations: [
      ...mockConversations,
      ...mockConversations.map((c, i) => ({
        ...c,
        id: `${c.id}-${i}`,
        name: `${c.name} ${i + 1}`,
      })),
    ],
    onSelect: (id) => console.log('Selected:', id),
  },
};

export const DarkMode: Story = {
  args: {
    conversations: mockConversations,
    selectedId: mockConversations[0].id,
    onSelect: (id) => console.log('Selected:', id),
  },
  decorators: [
    (Story) => (
      <div className="dark h-[600px]">
        <Story />
      </div>
    ),
  ],
  parameters: {
    backgrounds: { default: 'dark' },
  },
};
