import type { Meta, StoryObj } from '@storybook/react';
import { RolePermissionsMatrix } from '@/features/admin/RolePermissionsMatrix';

const meta: Meta<typeof RolePermissionsMatrix> = {
  title: 'Admin/RolePermissionsMatrix',
  component: RolePermissionsMatrix,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RolePermissionsMatrix>;

export const Default: Story = {
  args: {
    onChange: (permissions) => console.log('Permissions changed:', permissions),
  },
};

export const ReadOnly: Story = {
  args: {
    onChange: (permissions) => console.log('Permissions changed:', permissions),
    readOnly: true,
  },
};
