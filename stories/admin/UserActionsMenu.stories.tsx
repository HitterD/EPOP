import type { Meta, StoryObj } from '@storybook/react';
import { UserActionsMenu } from '@/features/admin/UserActionsMenu';
import type { User } from '@/types/directory';

const meta: Meta<typeof UserActionsMenu> = {
  title: 'Admin/UserActionsMenu',
  component: UserActionsMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof UserActionsMenu>;

const sampleUser: User = {
  id: '1',
  name: 'Alice Chen',
  email: 'alice@company.com',
  role: 'member',
  department: 'Engineering',
  team: 'Frontend',
  status: 'active',
  avatarUrl: '',
  presence: 'online',
  joinedAt: new Date('2023-01-15'),
};

export const AdminView: Story = {
  args: {
    user: sampleUser,
    currentUserRole: 'admin',
    onEdit: (user) => console.log('Edit:', user.name),
    onResetPassword: (user) => console.log('Reset password:', user.name),
    onSendEmail: (user) => console.log('Send email to:', user.email),
    onViewAuditLog: (user) => console.log('View audit log:', user.name),
    onDeactivate: (user) => console.log('Deactivate:', user.name),
    onDelete: (user) => console.log('Delete:', user.name),
  },
};

export const SuperAdminView: Story = {
  args: {
    user: sampleUser,
    currentUserRole: 'super_admin',
    onEdit: (user) => console.log('Edit:', user.name),
    onResetPassword: (user) => console.log('Reset password:', user.name),
    onSendEmail: (user) => console.log('Send email to:', user.email),
    onViewAuditLog: (user) => console.log('View audit log:', user.name),
    onDeactivate: (user) => console.log('Deactivate:', user.name),
    onDelete: (user) => console.log('Delete:', user.name),
  },
};

export const ManagerView: Story = {
  args: {
    user: sampleUser,
    currentUserRole: 'manager',
    onEdit: (user) => console.log('Edit:', user.name),
    onResetPassword: (user) => console.log('Reset password:', user.name),
    onSendEmail: (user) => console.log('Send email to:', user.email),
    onViewAuditLog: (user) => console.log('View audit log:', user.name),
    onDeactivate: (user) => console.log('Deactivate:', user.name),
    onDelete: (user) => console.log('Delete:', user.name),
  },
};

export const InactiveUser: Story = {
  args: {
    user: {
      ...sampleUser,
      status: 'inactive',
    },
    currentUserRole: 'admin',
    onEdit: (user) => console.log('Edit:', user.name),
    onResetPassword: (user) => console.log('Reset password:', user.name),
    onSendEmail: (user) => console.log('Send email to:', user.email),
    onViewAuditLog: (user) => console.log('View audit log:', user.name),
    onDeactivate: (user) => console.log('Reactivate:', user.name),
    onDelete: (user) => console.log('Delete:', user.name),
  },
};

export const AdminUser: Story = {
  args: {
    user: {
      ...sampleUser,
      role: 'admin',
      name: 'Bob Smith',
      email: 'bob@company.com',
    },
    currentUserRole: 'super_admin',
    onEdit: (user) => console.log('Edit:', user.name),
    onResetPassword: (user) => console.log('Reset password:', user.name),
    onSendEmail: (user) => console.log('Send email to:', user.email),
    onViewAuditLog: (user) => console.log('View audit log:', user.name),
    onDeactivate: (user) => console.log('Deactivate:', user.name),
    onDelete: (user) => console.log('Delete:', user.name),
  },
};
