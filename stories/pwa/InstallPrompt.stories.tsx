import type { Meta, StoryObj } from '@storybook/react';
import { InstallPrompt } from '@/features/pwa/InstallPrompt';

const meta: Meta<typeof InstallPrompt> = {
  title: 'PWA/InstallPrompt',
  component: InstallPrompt,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof InstallPrompt>;

export const Default: Story = {
  args: {
    onInstall: () => console.log('Install'),
    onDismiss: () => console.log('Dismiss'),
  },
};
