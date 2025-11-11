import type { Meta, StoryObj } from '@storybook/react';
import { KanbanBoard } from '@/features/projects/kanban/KanbanBoard';
import { mockKanbanLanes } from '@/mocks/projects/tasks';

const meta: Meta<typeof KanbanBoard> = {
  title: 'Projects/KanbanBoard',
  component: KanbanBoard,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof KanbanBoard>;

export const Default: Story = {
  args: {
    lanes: mockKanbanLanes,
    onMove: (taskId, toLane) => console.log('Move', taskId, 'to', toLane),
    onTaskClick: (task) => console.log('Clicked', task),
  },
};

export const WithWIPLimit: Story = {
  args: Default.args,
};

export const DarkMode: Story = {
  args: Default.args,
  parameters: { backgrounds: { default: 'dark' } },
};
