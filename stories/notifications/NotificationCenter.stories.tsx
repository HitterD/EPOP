import type { Meta, StoryObj } from '@storybook/react';
import { NotificationCenter } from '@/features/notifications/NotificationCenter';

const mockNotifications = [
  {
    id: '1',
    type: 'message' as const,
    title: 'New Message',
    message: 'Alice sent you a message',
    priority: 'medium' as const,
    read: false,
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: '2',
    type: 'mention' as const,
    title: 'You were mentioned',
    message: 'Bob mentioned you in a task',
    priority: 'high' as const,
    read: false,
    timestamp: new Date(Date.now() - 7200000),
  },
  {
    id: '3',
    type: 'task' as const,
    title: 'Task Assigned',
    message: 'You have been assigned a new task',
    priority: 'medium' as const,
    read: true,
    timestamp: new Date(Date.now() - 86400000),
  },
];

const meta: Meta<typeof NotificationCenter> = {
  title: 'Notifications/NotificationCenter',
  component: NotificationCenter,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div className="h-[600px] w-[400px]"><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof NotificationCenter>;

export const Default: Story = {
  args: {
    notifications: mockNotifications,
    onMarkRead: (id) => console.log('Mark read:', id),
    onMarkAllRead: () => console.log('Mark all read'),
    onClear: () => console.log('Clear'),
  },
};

export const Empty: Story = {
  args: {
    ...Default.args,
    notifications: [],
  },
};

export const AllRead: Story = {
  args: {
    ...Default.args,
    notifications: mockNotifications.map((n) => ({ ...n, read: true })),
  },
};
