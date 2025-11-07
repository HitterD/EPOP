import type { Meta, StoryObj } from '@storybook/react'
import { TaskCardDraggable } from './task-card-draggable'
import { DndContext } from '@dnd-kit/core'

const meta = {
  title: 'Projects/TaskCardDraggable',
  component: TaskCardDraggable,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <DndContext>
        <div style={{ width: '300px' }}>
          <Story />
        </div>
      </DndContext>
    ),
  ],
} satisfies Meta<typeof TaskCardDraggable>

export default meta
type Story = StoryObj<typeof meta>

const mockTask = {
  id: 'task-1',
  title: 'Implement user authentication',
  description: 'Add OAuth and JWT authentication to the application',
  status: 'in_progress' as const,
  priority: 'high' as const,
  bucketId: 'bucket-1',
  projectId: 'project-1',
  assigneeIds: ['user-1', 'user-2'],
  assignees: [
    { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
    { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com' },
  ],
  labels: [
    { id: 'label-1', name: 'Backend', color: '#0EA5E9' },
  ],
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  progress: 60,
  checklist: [],
  comments: [],
  order: 0,
}

export const Default: Story = {
  args: {
    task: mockTask,
  },
}

export const LowPriority: Story = {
  args: {
    task: {
      ...mockTask,
      priority: 'low',
      title: 'Update documentation',
    },
  },
}

export const CriticalPriority: Story = {
  args: {
    task: {
      ...mockTask,
      priority: 'critical',
      title: 'Fix critical bug in production',
    },
  },
}

export const NoAssignees: Story = {
  args: {
    task: {
      ...mockTask,
      assignees: [],
      title: 'Unassigned task',
    },
  },
}

export const Overdue: Story = {
  args: {
    task: {
      ...mockTask,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      title: 'Overdue task',
      priority: 'critical',
    },
  },
}

export const NearlyComplete: Story = {
  args: {
    task: {
      ...mockTask,
      progress: 95,
      title: 'Almost done',
    },
  },
}

export const WithLongTitle: Story = {
  args: {
    task: {
      ...mockTask,
      title:
        'This is a very long task title that should wrap properly and handle multiple lines of text',
      description:
        'And this is an even longer description that contains multiple sentences and should also wrap properly within the card boundaries.',
    },
  },
}
