import type { Meta, StoryObj } from '@storybook/react';
import { SyncStatusIndicator, CompactSyncIndicator, useSyncStatus, type PendingAction } from '@/features/pwa/SyncStatusIndicator';
import { Button } from '@/components/ui/button';

const meta: Meta<typeof SyncStatusIndicator> = {
  title: 'PWA/SyncStatusIndicator',
  component: SyncStatusIndicator,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SyncStatusIndicator>;

const samplePendingActions: PendingAction[] = [
  {
    id: '1',
    type: 'message',
    description: 'Send message to Alice',
    timestamp: new Date(Date.now() - 5000),
    retryCount: 0,
  },
  {
    id: '2',
    type: 'file',
    description: 'Upload document.pdf',
    timestamp: new Date(Date.now() - 10000),
    retryCount: 1,
  },
  {
    id: '3',
    type: 'task',
    description: 'Update task status',
    timestamp: new Date(Date.now() - 15000),
    retryCount: 0,
    error: 'Network error',
  },
];

export const Idle: Story = {
  args: {
    pendingActions: [],
    syncStatus: 'idle',
  },
};

export const Syncing: Story = {
  args: {
    pendingActions: samplePendingActions,
    syncStatus: 'syncing',
    onRetry: (id) => console.log('Retry:', id),
    onRetryAll: () => console.log('Retry all'),
  },
};

export const Success: Story = {
  args: {
    pendingActions: [],
    syncStatus: 'success',
  },
};

export const Failed: Story = {
  args: {
    pendingActions: samplePendingActions,
    syncStatus: 'failed',
    onRetry: (id) => console.log('Retry:', id),
    onRetryAll: () => console.log('Retry all'),
  },
};

export const WithErrors: Story = {
  args: {
    pendingActions: samplePendingActions,
    syncStatus: 'idle',
    onRetry: (id) => console.log('Retry:', id),
    onRetryAll: () => console.log('Retry all'),
  },
};

function CompactDemo() {
  return (
    <div className="p-8">
      <CompactSyncIndicator
        pendingCount={3}
        syncStatus="syncing"
        onClick={() => console.log('Clicked')}
      />
    </div>
  );
}

export const Compact: Story = {
  render: () => <CompactDemo />,
};

function InteractiveDemo() {
  const { pendingActions, syncStatus, addPendingAction, syncAll, retryAction } = useSyncStatus();

  return (
    <div className="p-8 space-y-4">
      <div className="flex gap-2">
        <Button
          onClick={() =>
            addPendingAction({
              type: 'message',
              description: 'Send message to team',
            })
          }
        >
          Add Message Action
        </Button>
        <Button
          onClick={() =>
            addPendingAction({
              type: 'file',
              description: 'Upload report.pdf',
            })
          }
        >
          Add File Action
        </Button>
        <Button onClick={syncAll}>Sync All</Button>
      </div>

      <SyncStatusIndicator
        pendingActions={pendingActions}
        syncStatus={syncStatus}
        onRetry={retryAction}
        onRetryAll={syncAll}
      />
    </div>
  );
}

export const Interactive: Story = {
  render: () => <InteractiveDemo />,
};
