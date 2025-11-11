import type { Meta, StoryObj } from '@storybook/react';
import { GanttChart } from '@/features/projects/gantt/GanttChart';
import { mockTasks } from '@/mocks/projects/tasks';

const meta: Meta<typeof GanttChart> = {
  title: 'Projects/GanttChart',
  component: GanttChart,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof GanttChart>;

export const DayView: Story = {
  args: {
    tasks: mockTasks,
    zoom: 'day',
    onZoomChange: (z) => console.log('Zoom:', z),
    onTaskClick: (t) => console.log('Task:', t),
  },
};

export const WeekView: Story = {
  args: {
    ...DayView.args,
    zoom: 'week',
  },
};

export const MonthView: Story = {
  args: {
    ...DayView.args,
    zoom: 'month',
  },
};
