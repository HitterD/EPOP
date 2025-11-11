import type { Meta, StoryObj } from '@storybook/react';
import { MessageComposer } from '@/components/chat/MessageComposer';
import { mockUsers } from '@/mocks/chat/conversations';

const meta: Meta<typeof MessageComposer> = {
  title: 'Chat/MessageComposer',
  component: MessageComposer,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MessageComposer>;

export const Default: Story = {
  args: {
    onSend: (content, files) => console.log('Send:', { content, files }),
  },
};

export const Disabled: Story = {
  args: {
    onSend: (content, files) => console.log('Send:', { content, files }),
    disabled: true,
  },
};

export const WithPlaceholder: Story = {
  args: {
    onSend: (content, files) => console.log('Send:', { content, files }),
    placeholder: 'Type your message here...',
  },
};

export const Uploading: Story = {
  args: {
    onSend: (content, files) => console.log('Send:', { content, files }),
    uploadProgress: {
      'document.pdf': 45,
      'image.png': 78,
    },
  },
};

export const WithMentions: Story = {
  args: {
    onSend: (content, files) => console.log('Send:', { content, files }),
    mentionSuggestions: mockUsers,
  },
};

export const MaxLength: Story = {
  args: {
    onSend: (content, files) => console.log('Send:', { content, files }),
    maxLength: 100,
  },
};

export const DarkMode: Story = {
  args: {
    onSend: (content, files) => console.log('Send:', { content, files }),
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
