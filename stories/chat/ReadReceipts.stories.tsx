import type { Meta, StoryObj } from '@storybook/react';
import { ReadReceipts, CompactReadReceipts } from '@/components/chat/ReadReceipts';
import type { User } from '@/types/chat';

const meta: Meta<typeof ReadReceipts> = {
  title: 'Chat/ReadReceipts',
  component: ReadReceipts,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ReadReceipts>;

const sampleUsers: User[] = [
  { id: '1', name: 'Alice Chen', avatarUrl: '', presence: 'online' },
  { id: '2', name: 'Bob Smith', avatarUrl: '', presence: 'online' },
  { id: '3', name: 'Carol Lee', avatarUrl: '', presence: 'away' },
  { id: '4', name: 'Dave Wilson', avatarUrl: '', presence: 'offline' },
  { id: '5', name: 'Eve Martinez', avatarUrl: '', presence: 'online' },
];

export const Sending: Story = {
  args: {
    readBy: [],
    totalRecipients: 5,
    isMine: true,
    status: 'sending',
  },
};

export const Sent: Story = {
  args: {
    readBy: [],
    totalRecipients: 5,
    isMine: true,
    status: 'sent',
  },
};

export const Delivered: Story = {
  args: {
    readBy: [],
    totalRecipients: 5,
    isMine: true,
    status: 'delivered',
  },
};

export const ReadByOne: Story = {
  args: {
    readBy: [sampleUsers[0]],
    totalRecipients: 5,
    isMine: true,
    status: 'read',
  },
};

export const ReadByTwo: Story = {
  args: {
    readBy: sampleUsers.slice(0, 2),
    totalRecipients: 5,
    isMine: true,
    status: 'read',
  },
};

export const ReadByThree: Story = {
  args: {
    readBy: sampleUsers.slice(0, 3),
    totalRecipients: 5,
    isMine: true,
    status: 'read',
  },
};

export const ReadByAll: Story = {
  args: {
    readBy: sampleUsers,
    totalRecipients: 5,
    isMine: true,
    status: 'read',
  },
};

export const ReadByMany: Story = {
  args: {
    readBy: [
      ...sampleUsers,
      { id: '6', name: 'User 6', avatarUrl: '', presence: 'online' },
      { id: '7', name: 'User 7', avatarUrl: '', presence: 'online' },
      { id: '8', name: 'User 8', avatarUrl: '', presence: 'online' },
    ],
    totalRecipients: 10,
    isMine: true,
    status: 'read',
  },
};

export const NotMyMessage: Story = {
  args: {
    readBy: sampleUsers.slice(0, 3),
    totalRecipients: 5,
    isMine: false,
    status: 'read',
  },
};

// Compact version stories
const CompactMeta: Meta<typeof CompactReadReceipts> = {
  title: 'Chat/ReadReceipts/Compact',
  component: CompactReadReceipts,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export const CompactNoReads: StoryObj<typeof CompactReadReceipts> = {
  args: {
    readCount: 0,
    totalRecipients: 5,
    isMine: true,
  },
};

export const CompactPartialReads: StoryObj<typeof CompactReadReceipts> = {
  args: {
    readCount: 3,
    totalRecipients: 5,
    isMine: true,
  },
};

export const CompactAllRead: StoryObj<typeof CompactReadReceipts> = {
  args: {
    readCount: 5,
    totalRecipients: 5,
    isMine: true,
  },
};
