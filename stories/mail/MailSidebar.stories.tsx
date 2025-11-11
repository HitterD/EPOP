import type { Meta, StoryObj } from '@storybook/react';
import { MailSidebar } from '@/components/mail/MailSidebar';
import { mockFolders } from '@/mocks/mail/messages';

const meta: Meta<typeof MailSidebar> = {
  title: 'Mail/MailSidebar',
  component: MailSidebar,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div className="h-[600px] w-[280px]"><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof MailSidebar>;

export const Default: Story = {
  args: {
    folders: mockFolders,
    selectedFolder: 'inbox',
    onSelectFolder: (id) => console.log('Selected:', id),
    unreadCounts: { inbox: 12, drafts: 1, deleted: 3 },
    onCompose: () => console.log('Compose'),
  },
};

export const NoUnread: Story = {
  args: {
    ...Default.args,
    unreadCounts: {},
  },
};

export const DarkMode: Story = {
  args: Default.args,
  parameters: { backgrounds: { default: 'dark' } },
};
