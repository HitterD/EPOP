import type { Meta, StoryObj } from '@storybook/react';
import { MessageActions, QuickMessageActions } from '@/components/chat/MessageActions';
import type { Message } from '@/types/chat';

const meta: Meta<typeof MessageActions> = {
  title: 'Chat/MessageActions',
  component: MessageActions,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MessageActions>;

const sampleMessage: Message = {
  id: 'msg-1',
  clientId: 'client-1',
  conversationId: 'conv-1',
  content: 'This is a sample message that can be edited or deleted.',
  author: {
    id: 'user-1',
    name: 'Alice Chen',
    email: 'alice@company.com',
    presence: 'online',
  },
  timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
  reactions: [],
  readBy: [],
  replyCount: 0,
  status: 'sent',
};

const oldMessage: Message = {
  ...sampleMessage,
  id: 'msg-2',
  timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
};

export const MyMessage: Story = {
  args: {
    message: sampleMessage,
    isMine: true,
    onEdit: (id, content) => console.log('Edit:', id, content),
    onDelete: (id) => console.log('Delete:', id),
    onReply: (id) => console.log('Reply:', id),
    onReact: (id) => console.log('React:', id),
  },
};

export const OtherMessage: Story = {
  args: {
    message: sampleMessage,
    isMine: false,
    onReply: (id) => console.log('Reply:', id),
    onReact: (id) => console.log('React:', id),
    onReport: (id) => console.log('Report:', id),
  },
};

export const OldMessageNoEdit: Story = {
  args: {
    message: oldMessage,
    isMine: true,
    onEdit: (id, content) => console.log('Edit:', id, content),
    onDelete: (id) => console.log('Delete:', id),
    onReply: (id) => console.log('Reply:', id),
  },
};

export const WithPinPermission: Story = {
  args: {
    message: sampleMessage,
    isMine: true,
    canPin: true,
    onEdit: (id, content) => console.log('Edit:', id, content),
    onDelete: (id) => console.log('Delete:', id),
    onReply: (id) => console.log('Reply:', id),
    onReact: (id) => console.log('React:', id),
    onPin: (id) => console.log('Pin:', id),
  },
};

function QuickActionsDemo() {
  return (
    <div className="relative group p-4 border rounded-lg hover:bg-accent/5">
      <p className="text-sm">{sampleMessage.content}</p>
      <QuickMessageActions
        message={sampleMessage}
        isMine={true}
        onReply={(id) => console.log('Reply:', id)}
        onReact={(id) => console.log('React:', id)}
        onEdit={(id, content) => console.log('Edit:', id, content)}
        onDelete={(id) => console.log('Delete:', id)}
      />
    </div>
  );
}

export const QuickActions: Story = {
  render: () => <QuickActionsDemo />,
};
