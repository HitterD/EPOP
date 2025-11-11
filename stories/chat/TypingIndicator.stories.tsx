import type { Meta, StoryObj } from '@storybook/react';
import { TypingIndicator } from '@/components/chat/TypingIndicator';

const meta: Meta<typeof TypingIndicator> = {
  title: 'Chat/TypingIndicator',
  component: TypingIndicator,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# TypingIndicator

Shows who is currently typing in a conversation with animated dots.

## Features
- Handles 1-3+ users gracefully
- Animated bouncing dots
- Accessible with aria-live announcements
- Automatically hides when no users typing
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TypingIndicator>;

export const SingleUser: Story = {
  args: {
    users: ['Alice'],
  },
};

export const TwoUsers: Story = {
  args: {
    users: ['Alice', 'Bob'],
  },
};

export const ThreeUsers: Story = {
  args: {
    users: ['Alice', 'Bob', 'Carol'],
  },
};

export const ManyUsers: Story = {
  args: {
    users: ['Alice', 'Bob', 'Carol', 'Dave', 'Eve'],
  },
};

export const NoUsers: Story = {
  args: {
    users: [],
  },
};

export const LongNames: Story = {
  args: {
    users: ['Alexandra Richardson', 'Benjamin Montgomery'],
  },
};
