import type { Meta, StoryObj } from '@storybook/react';
import { ReconnectBanner } from '@/components/chat/ReconnectBanner';

const meta: Meta<typeof ReconnectBanner> = {
  title: 'Chat/ReconnectBanner',
  component: ReconnectBanner,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# ReconnectBanner

Displays connection status and provides retry functionality.

## Features
- Connecting state with spinner
- Disconnected state with retry button
- Auto-retry countdown
- Accessible with alert role
- Color-coded: yellow for connecting, red for disconnected
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['connecting', 'disconnected'],
    },
    autoRetryIn: {
      control: 'number',
      description: 'Auto-retry countdown in seconds',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ReconnectBanner>;

export const Connecting: Story = {
  args: {
    status: 'connecting',
  },
};

export const Disconnected: Story = {
  args: {
    status: 'disconnected',
    onRetry: () => alert('Retry clicked'),
  },
};

export const AutoRetry: Story = {
  args: {
    status: 'disconnected',
    autoRetryIn: 5,
    onRetry: () => console.log('Auto-retry triggered'),
  },
};

export const ConnectingWithoutRetry: Story = {
  args: {
    status: 'connecting',
    autoRetryIn: 3,
  },
};

export const DisconnectedNoRetry: Story = {
  args: {
    status: 'disconnected',
  },
};
