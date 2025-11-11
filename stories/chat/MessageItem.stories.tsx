import type { Meta, StoryObj } from '@storybook/react';
import { MessageItem } from '@/components/chat/MessageItem';
import { mockMessages, mockSendingMessage, mockFailedMessage } from '@/mocks/chat/conversations';

const meta: Meta<typeof MessageItem> = {
  title: 'Chat/MessageItem',
  component: MessageItem,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MessageItem>;

export const OtherMessage: Story = {
  args: {
    message: mockMessages[0],
    isMine: false,
    onReply: () => console.log('Reply'),
    onReact: (emoji) => console.log('React:', emoji),
  },
};

export const MyMessage: Story = {
  args: {
    message: mockMessages[0],
    isMine: true,
    onReply: () => console.log('Reply'),
    onReact: (emoji) => console.log('React:', emoji),
    onEdit: () => console.log('Edit'),
    onDelete: () => console.log('Delete'),
  },
};

export const WithReactions: Story = {
  args: {
    message: mockMessages[0],
    isMine: false,
    onReply: () => console.log('Reply'),
    onReact: (emoji) => console.log('React:', emoji),
  },
};

export const WithAttachment: Story = {
  args: {
    message: mockMessages[3],
    isMine: false,
    onReply: () => console.log('Reply'),
    onReact: (emoji) => console.log('React:', emoji),
  },
};

export const Sending: Story = {
  args: {
    message: mockSendingMessage,
    isMine: true,
    onReply: () => console.log('Reply'),
    onReact: (emoji) => console.log('React:', emoji),
  },
};

export const Failed: Story = {
  args: {
    message: mockFailedMessage,
    isMine: true,
    onReply: () => console.log('Reply'),
    onReact: (emoji) => console.log('React:', emoji),
    onEdit: () => console.log('Edit'),
    onDelete: () => console.log('Delete'),
  },
};

export const WithReadReceipts: Story = {
  args: {
    message: mockMessages[0],
    isMine: true,
    onReply: () => console.log('Reply'),
    onReact: (emoji) => console.log('React:', emoji),
  },
};

export const LongMessage: Story = {
  args: {
    message: {
      ...mockMessages[0],
      content: 'This is a very long message that contains a lot of text to demonstrate how the message component handles long content. It should wrap properly and maintain good readability even with multiple lines of text. The component should also maintain proper spacing and alignment with the avatar and other elements.',
    },
    isMine: false,
    onReply: () => console.log('Reply'),
    onReact: (emoji) => console.log('React:', emoji),
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="space-y-4 max-w-2xl">
      <MessageItem
        message={mockMessages[0]}
        isMine={false}
        onReply={() => {}}
        onReact={() => {}}
      />
      <MessageItem
        message={mockMessages[0]}
        isMine={true}
        onReply={() => {}}
        onReact={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
      <MessageItem
        message={mockSendingMessage}
        isMine={true}
        onReply={() => {}}
        onReact={() => {}}
      />
      <MessageItem
        message={mockFailedMessage}
        isMine={true}
        onReply={() => {}}
        onReact={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    </div>
  ),
};

export const DarkMode: Story = {
  args: {
    message: mockMessages[0],
    isMine: false,
    onReply: () => {},
    onReact: () => {},
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
  parameters: {
    backgrounds: { default: 'dark' },
  },
};
