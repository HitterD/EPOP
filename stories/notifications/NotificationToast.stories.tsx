import type { Meta, StoryObj } from '@storybook/react';
import { NotificationToast, ToastContainer, useToast } from '@/features/notifications/NotificationToast';
import { Button } from '@/components/ui/button';
import type { Notification } from '@/types/notifications';

const meta: Meta<typeof NotificationToast> = {
  title: 'Notifications/NotificationToast',
  component: NotificationToast,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NotificationToast>;

const sampleNotification: Notification = {
  id: '1',
  title: 'New message from Alice',
  body: 'Can you review the design specs?',
  type: 'mention',
  read: false,
  createdAt: new Date(),
  userId: 'user-1',
};

export const Info: Story = {
  args: {
    notification: {
      ...sampleNotification,
      title: 'Info notification',
      body: 'This is an informational message.',
    },
    type: 'info',
    duration: 0,
    onClose: () => console.log('Closed'),
  },
};

export const Success: Story = {
  args: {
    notification: {
      ...sampleNotification,
      title: 'Success!',
      body: 'Your changes have been saved successfully.',
    },
    type: 'success',
    duration: 0,
    onClose: () => console.log('Closed'),
  },
};

export const Warning: Story = {
  args: {
    notification: {
      ...sampleNotification,
      title: 'Warning',
      body: 'Your session will expire in 5 minutes.',
    },
    type: 'warning',
    duration: 0,
    onClose: () => console.log('Closed'),
  },
};

export const Error: Story = {
  args: {
    notification: {
      ...sampleNotification,
      title: 'Error',
      body: 'Failed to save changes. Please try again.',
    },
    type: 'error',
    duration: 0,
    onClose: () => console.log('Closed'),
  },
};

export const WithAction: Story = {
  args: {
    notification: {
      ...sampleNotification,
      title: 'New message from Alice',
      body: 'Can you review the design specs?',
    },
    type: 'info',
    duration: 0,
    actionLabel: 'Reply',
    onAction: () => console.log('Action clicked'),
    onClose: () => console.log('Closed'),
  },
};

export const AutoDismiss: Story = {
  args: {
    notification: {
      ...sampleNotification,
      title: 'Auto-dismissing toast',
      body: 'This will disappear in 5 seconds.',
    },
    type: 'success',
    duration: 5000,
    onClose: () => console.log('Closed'),
  },
};

export const TopCenter: Story = {
  args: {
    notification: sampleNotification,
    type: 'info',
    duration: 0,
    position: 'top-center',
    onClose: () => console.log('Closed'),
  },
};

export const TopRight: Story = {
  args: {
    notification: sampleNotification,
    type: 'info',
    duration: 0,
    position: 'top-right',
    onClose: () => console.log('Closed'),
  },
};

export const BottomCenter: Story = {
  args: {
    notification: sampleNotification,
    type: 'info',
    duration: 0,
    position: 'bottom-center',
    onClose: () => console.log('Closed'),
  },
};

export const LongMessage: Story = {
  args: {
    notification: {
      ...sampleNotification,
      title: 'Message with very long content',
      body: 'This is a notification with a very long body text that should be truncated or wrapped properly. It contains multiple sentences and demonstrates how the component handles overflow content. The text should not break the layout.',
    },
    type: 'info',
    duration: 0,
    onClose: () => console.log('Closed'),
  },
};

// Interactive demo with toast hook
function ToastDemo() {
  const { toasts, addToast, removeToast } = useToast();

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">Toast Notifications Demo</h2>
      <p className="text-muted-foreground">Click buttons to show different toast types:</p>
      
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() =>
            addToast(
              {
                id: Math.random().toString(),
                title: 'Info notification',
                body: 'This is an informational message.',
                type: 'mention',
                read: false,
                createdAt: new Date(),
                userId: 'user-1',
              },
              { type: 'info', duration: 5000 }
            )
          }
        >
          Show Info
        </Button>

        <Button
          onClick={() =>
            addToast(
              {
                id: Math.random().toString(),
                title: 'Success!',
                body: 'Operation completed successfully.',
                type: 'mention',
                read: false,
                createdAt: new Date(),
                userId: 'user-1',
              },
              { type: 'success', duration: 5000 }
            )
          }
          variant="default"
        >
          Show Success
        </Button>

        <Button
          onClick={() =>
            addToast(
              {
                id: Math.random().toString(),
                title: 'Warning',
                body: 'Please review this important message.',
                type: 'mention',
                read: false,
                createdAt: new Date(),
                userId: 'user-1',
              },
              { type: 'warning', duration: 5000 }
            )
          }
          variant="secondary"
        >
          Show Warning
        </Button>

        <Button
          onClick={() =>
            addToast(
              {
                id: Math.random().toString(),
                title: 'Error',
                body: 'Something went wrong. Please try again.',
                type: 'mention',
                read: false,
                createdAt: new Date(),
                userId: 'user-1',
              },
              { type: 'error', duration: 5000 }
            )
          }
          variant="destructive"
        >
          Show Error
        </Button>

        <Button
          onClick={() =>
            addToast(
              {
                id: Math.random().toString(),
                title: 'New message',
                body: 'Alice mentioned you in a comment.',
                type: 'mention',
                read: false,
                createdAt: new Date(),
                userId: 'user-1',
              },
              {
                type: 'info',
                duration: 10000,
                actionLabel: 'View',
                onAction: () => console.log('View clicked'),
              }
            )
          }
          variant="outline"
        >
          Show with Action
        </Button>
      </div>

      <ToastContainer
        toasts={toasts}
        onClose={removeToast}
        position="bottom-right"
        maxVisible={3}
      />
    </div>
  );
}

export const InteractiveDemo: Story = {
  render: () => <ToastDemo />,
};
