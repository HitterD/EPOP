import type { Meta, StoryObj } from '@storybook/react'
import type { Notification } from '@/types'
import { NotificationItem } from './notification-item'

const meta = {
  title: 'Notifications/NotificationItem',
  component: NotificationItem,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof NotificationItem>

export default meta
type Story = StoryObj<typeof meta>

const baseNotification: Notification = {
  id: 'notif-1',
  userId: 'user-1',
  type: 'chat_message',
  title: 'New Message',
  message: 'You have a new message from John Doe',
  isRead: false,
  timestamp: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  metadata: {
    chatId: 'chat-1',
    senderName: 'John Doe',
  },
}

export const MessageNotification: Story = {
  args: {
    notification: baseNotification,
  },
}

export const MentionNotification: Story = {
  args: {
    notification: {
      ...baseNotification,
      type: 'chat_mention',
      title: 'You were mentioned',
      message: 'Sarah mentioned you in Project Discussion',
    },
  },
}

export const TaskAssignedNotification: Story = {
  args: {
    notification: {
      ...baseNotification,
      type: 'task_assigned',
      title: 'Task Assigned',
      message: 'You have been assigned to "Implement user authentication"',
      metadata: {
        projectId: 'proj-1',
      },
    },
  },
}

export const TaskDueNotification: Story = {
  args: {
    notification: {
      ...baseNotification,
      type: 'project_update',
      title: 'Task Due Soon',
      message: 'Your task "Fix critical bug" is due in 2 hours',
      metadata: {
        projectId: 'proj-1',
      },
    },
  },
}

export const FileSharedNotification: Story = {
  args: {
    notification: {
      ...baseNotification,
      type: 'project_update',
      title: 'File Shared',
      message: 'Mike shared "Q4 Report.pdf" with you',
    },
  },
}

export const SystemNotification: Story = {
  args: {
    notification: {
      ...baseNotification,
      type: 'system_announcement',
      title: 'System Update',
      message: 'The system will be under maintenance tonight from 10 PM - 2 AM',
    },
  },
}

export const ReadNotification: Story = {
  args: {
    notification: {
      ...baseNotification,
      isRead: true,
    },
  },
}

export const LongContent: Story = {
  args: {
    notification: {
      ...baseNotification,
      title: 'Important Update Regarding Project Timeline and Deliverables',
      message: 'This is a longer notification message that contains important information about the project. It should wrap properly and display all the content in a readable format without breaking the layout.',
    },
  },
}
