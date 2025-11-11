import type { Meta, StoryObj } from '@storybook/react';
import { PresenceBadge } from '@/components/chat/PresenceBadge';

const meta: Meta<typeof PresenceBadge> = {
  title: 'Chat/PresenceBadge',
  component: PresenceBadge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# PresenceBadge

Displays user presence status with configurable size and animation.

## Features
- Three status states: online (green), away (yellow), offline (gray)
- Configurable sizes: sm, md, lg
- Optional pulse animation for online status
- Accessible with proper ARIA labels
- Dark mode support
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['online', 'away', 'offline'],
      description: 'User presence status',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Badge size',
    },
    showPulse: {
      control: 'boolean',
      description: 'Show pulse animation (online status only)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PresenceBadge>;

export const Online: Story = {
  args: {
    status: 'online',
    size: 'md',
    showPulse: true,
  },
};

export const Away: Story = {
  args: {
    status: 'away',
    size: 'md',
    showPulse: false,
  },
};

export const Offline: Story = {
  args: {
    status: 'offline',
    size: 'md',
    showPulse: false,
  },
};

export const SmallSize: Story = {
  args: {
    status: 'online',
    size: 'sm',
    showPulse: true,
  },
};

export const LargeSize: Story = {
  args: {
    status: 'online',
    size: 'lg',
    showPulse: true,
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex gap-6 items-center">
      <div className="flex flex-col items-center gap-2">
        <PresenceBadge status="online" size="md" showPulse />
        <span className="text-xs">Online</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <PresenceBadge status="away" size="md" />
        <span className="text-xs">Away</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <PresenceBadge status="offline" size="md" />
        <span className="text-xs">Offline</span>
      </div>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex gap-6 items-center">
      <div className="flex flex-col items-center gap-2">
        <PresenceBadge status="online" size="sm" showPulse />
        <span className="text-xs">Small</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <PresenceBadge status="online" size="md" showPulse />
        <span className="text-xs">Medium</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <PresenceBadge status="online" size="lg" showPulse />
        <span className="text-xs">Large</span>
      </div>
    </div>
  ),
};

export const DarkMode: Story = {
  args: {
    status: 'online',
    size: 'md',
    showPulse: true,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
};
