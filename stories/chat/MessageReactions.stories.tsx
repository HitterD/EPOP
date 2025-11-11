import type { Meta, StoryObj } from '@storybook/react';
import { MessageReactions } from '@/components/chat/MessageReactions';
import type { Reaction } from '@/types/chat';

const meta: Meta<typeof MessageReactions> = {
  title: 'Chat/MessageReactions',
  component: MessageReactions,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MessageReactions>;

const sampleReactions: Reaction[] = [
  {
    id: '1',
    messageId: 'msg-1',
    emoji: '👍',
    userId: 'user-1',
    user: { id: 'user-1', name: 'Alice Chen', avatarUrl: '', presence: 'online' },
    createdAt: new Date(),
  },
  {
    id: '2',
    messageId: 'msg-1',
    emoji: '👍',
    userId: 'user-2',
    user: { id: 'user-2', name: 'Bob Smith', avatarUrl: '', presence: 'online' },
    createdAt: new Date(),
  },
  {
    id: '3',
    messageId: 'msg-1',
    emoji: '❤️',
    userId: 'user-3',
    user: { id: 'user-3', name: 'Carol Lee', avatarUrl: '', presence: 'away' },
    createdAt: new Date(),
  },
  {
    id: '4',
    messageId: 'msg-1',
    emoji: '🎉',
    userId: 'user-4',
    user: { id: 'user-4', name: 'Dave Wilson', avatarUrl: '', presence: 'offline' },
    createdAt: new Date(),
  },
  {
    id: '5',
    messageId: 'msg-1',
    emoji: '🎉',
    userId: 'user-5',
    user: { id: 'user-5', name: 'Eve Martinez', avatarUrl: '', presence: 'online' },
    createdAt: new Date(),
  },
];

export const NoReactions: Story = {
  args: {
    reactions: [],
    currentUserId: 'user-1',
    onReact: (emoji) => console.log('React with:', emoji),
    onRemoveReaction: (emoji) => console.log('Remove reaction:', emoji),
  },
};

export const WithReactions: Story = {
  args: {
    reactions: sampleReactions,
    currentUserId: 'user-1',
    onReact: (emoji) => console.log('React with:', emoji),
    onRemoveReaction: (emoji) => console.log('Remove reaction:', emoji),
  },
};

export const CurrentUserReacted: Story = {
  args: {
    reactions: [
      ...sampleReactions,
      {
        id: '6',
        messageId: 'msg-1',
        emoji: '👍',
        userId: 'current-user',
        user: { id: 'current-user', name: 'You', avatarUrl: '', presence: 'online' },
        createdAt: new Date(),
      },
    ],
    currentUserId: 'current-user',
    onReact: (emoji) => console.log('React with:', emoji),
    onRemoveReaction: (emoji) => console.log('Remove reaction:', emoji),
  },
};

export const ManyReactions: Story = {
  args: {
    reactions: [
      ...sampleReactions,
      { id: '6', messageId: 'msg-1', emoji: '💯', userId: 'user-6', user: { id: 'user-6', name: 'User 6', avatarUrl: '', presence: 'online' }, createdAt: new Date() },
      { id: '7', messageId: 'msg-1', emoji: '🔥', userId: 'user-7', user: { id: 'user-7', name: 'User 7', avatarUrl: '', presence: 'online' }, createdAt: new Date() },
      { id: '8', messageId: 'msg-1', emoji: '✅', userId: 'user-8', user: { id: 'user-8', name: 'User 8', avatarUrl: '', presence: 'online' }, createdAt: new Date() },
    ],
    currentUserId: 'user-1',
    onReact: (emoji) => console.log('React with:', emoji),
    onRemoveReaction: (emoji) => console.log('Remove reaction:', emoji),
  },
};
