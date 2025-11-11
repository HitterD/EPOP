import type { Meta, StoryObj } from '@storybook/react';
import { AdminPanel } from '@/features/admin/AdminPanel';
import { mockUsers } from '@/mocks/directory/users';

const meta: Meta<typeof AdminPanel> = {
  title: 'Admin/AdminPanel',
  component: AdminPanel,
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <div className="h-[800px]"><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof AdminPanel>;

export const Default: Story = {
  args: {
    users: mockUsers,
    onUserEdit: (user) => console.log('Edit:', user),
    onUserDelete: (id) => console.log('Delete:', id),
  },
};

export const DarkMode: Story = {
  args: Default.args,
  parameters: { backgrounds: { default: 'dark' } },
};
