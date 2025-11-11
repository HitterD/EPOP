import type { Meta, StoryObj } from '@storybook/react';
import { PushPermissionPrompt, PushPermissionDenied, PushPermissionBanner } from '@/features/pwa/PushPermissionPrompt';

const meta: Meta<typeof PushPermissionPrompt> = {
  title: 'PWA/PushPermissionPrompt',
  component: PushPermissionPrompt,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PushPermissionPrompt>;

export const DefaultDialog: Story = {
  args: {
    onAllow: () => console.log('Allowed'),
    onDeny: () => console.log('Denied'),
    onDefer: () => console.log('Deferred'),
    autoShow: false,
  },
};

export const DeniedState: StoryObj<typeof PushPermissionDenied> = {
  render: () => <PushPermissionDenied />,
};

export const BannerVersion: StoryObj<typeof PushPermissionBanner> = {
  render: () => (
    <PushPermissionBanner
      onAllow={() => console.log('Allowed')}
      onDeny={() => console.log('Denied')}
    />
  ),
};
