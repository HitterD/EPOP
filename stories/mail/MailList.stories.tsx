import type { Meta, StoryObj } from '@storybook/react';
import { MailList } from '@/components/mail/MailList';
import { mockMessages } from '@/mocks/mail/messages';

const meta: Meta<typeof MailList> = {
  title: 'Mail/MailList',
  component: MailList,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div className="h-[600px]"><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof MailList>;

export const Default: Story = {
  args: {
    messages: mockMessages,
    selectedIds: [],
    onSelect: (id) => console.log('Selected:', id),
    onBulkAction: (action, ids) => console.log(action, ids),
    sortBy: 'date',
  },
};

export const WithSelection: Story = {
  args: {
    ...Default.args,
    selectedIds: ['m1', 'm2'],
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    ...Default.args,
    messages: [],
  },
};

export const Error: Story = {
  args: {
    ...Default.args,
    error: new Error('Failed to load'),
  },
};
