import type { Meta, StoryObj } from '@storybook/react'
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

const baseNotification = {
  id: 'notif-1',
  userId: 'user-1',
  type: 'message' as const,
  title: 'New Message',
  body: 'You have a new message from John Doe',
  read: false,
  createdAt: new Date().toISOString(),
  data: {
    chatId: 'chat-1',
    messageId: 'msg-1',
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
      type: 'mention',
      title: 'You were mentioned',
      body: 'Sarah mentioned you in Project Discussion',
    },
  },
}

export const TaskAssignedNotification: Story = {
  args: {
    notification: {
      ...baseNotification,
      type: 'task_assigned',
      title: 'Task Assigned',
      body: 'You have been assigned to "Implement user authentication"',
      data: {
        projectId: 'proj-1',
        taskId: 'task-1',
      },
    },
  },
}

export const TaskDueNotification: Story = {
  args: {
    notification: {
      ...baseNotification,
      type: 'task_due',
      title: 'Task Due Soon',
      body: 'Your task "Fix critical bug" is due in 2 hours',
      data: {
        projectId: 'proj-1',
        taskId: 'task-2',
      },
    },
  },
}

export const FileSharedNotification: Story = {
  args: {
    notification: {
      ...baseNotification,
      type: 'file_shared',
      title: 'File Shared',
      body: 'Mike shared "Q4 Report.pdf" with you',
      data: {
        fileId: 'file-1',
      },
    },
  },
}

export const SystemNotification: Story = {
  args: {
    notification: {
      ...baseNotification,
      type: 'system',
      title: 'System Update',
      body: 'The system will be under maintenance tonight from 10 PM - 2 AM',
    },
  },
}

export const ReadNotification: Story = {
  args: {
    notification: {
      ...baseNotification,
      read: true,
    },
  },
}

export const LongContent: Story = {
  args: {
    notification: {
      ...baseNotification,
      title: 'Important Update Regarding Project Timeline and Deliverables',
      body: 'This is a longer notification message that contains important information about the project. It should wrap properly and display all the content in a readable format without breaking the layout.',
    },
  },
}
