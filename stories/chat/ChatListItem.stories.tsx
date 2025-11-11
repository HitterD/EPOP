import type { Meta, StoryObj } from '@storybook/react';
import { ChatListItem } from '@/components/chat/ChatListItem';
import { mockConversations } from '@/mocks/chat/conversations';

const meta: Meta<typeof ChatListItem> = {
  title: 'Chat/ChatListItem',
  component: ChatListItem,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ChatListItem>;

export const Default: Story = {
  args: {
    conversation: mockConversations[0],
    selected: false,
    onClick: () => console.log('Clicked'),
  },
};

export const Selected: Story = {
  args: {
    conversation: mockConversations[0],
    selected: true,
    onClick: () => console.log('Clicked'),
  },
};

export const WithUnread: Story = {
  args: {
    conversation: mockConversations[0],
    selected: false,
    onClick: () => console.log('Clicked'),
  },
};

export const Typing: Story = {
  args: {
    conversation: mockConversations[2],
    selected: false,
    onClick: () => console.log('Clicked'),
  },
};

export const NoUnread: Story = {
  args: {
    conversation: mockConversations[1],
    selected: false,
    onClick: () => console.log('Clicked'),
  },
};

export const LongName: Story = {
  args: {
    conversation: {
      ...mockConversations[0],
      name: 'Engineering Team - Frontend Development Discussion',
      lastMessage: 'This is a very long message that should be truncated to fit in the available space',
    },
    selected: false,
    onClick: () => console.log('Clicked'),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="w-96 space-y-2 border rounded-lg overflow-hidden">
      <ChatListItem
        conversation={mockConversations[0]}
        selected={false}
        onClick={() => {}}
      />
      <ChatListItem
        conversation={mockConversations[1]}
        selected={true}
        onClick={() => {}}
      />
      <ChatListItem
        conversation={mockConversations[2]}
        selected={false}
        onClick={() => {}}
      />
    </div>
  ),
};

export const DarkMode: Story = {
  args: {
    conversation: mockConversations[0],
    selected: false,
    onClick: () => {},
  },
  decorators: [
    (Story) => (
      <div className="dark w-96">
        <Story />
      </div>
    ),
  ],
  parameters: {
    backgrounds: { default: 'dark' },
  },
};
