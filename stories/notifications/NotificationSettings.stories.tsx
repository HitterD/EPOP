import type { Meta, StoryObj } from '@storybook/react';
import { NotificationSettings } from '@/features/notifications/NotificationSettings';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const meta: Meta<typeof NotificationSettings> = {
  title: 'Notifications/NotificationSettings',
  component: NotificationSettings,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NotificationSettings>;

function NotificationSettingsDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open Settings</Button>
      <NotificationSettings
        open={open}
        onOpenChange={setOpen}
        onSave={(prefs) => {
          console.log('Saved preferences:', prefs);
        }}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <NotificationSettingsDemo />,
};
