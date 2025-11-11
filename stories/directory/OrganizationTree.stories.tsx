import type { Meta, StoryObj } from '@storybook/react';
import { OrganizationTree } from '@/features/directory/OrganizationTree';
import { mockOrgTree } from '@/mocks/directory/users';

const meta: Meta<typeof OrganizationTree> = {
  title: 'Directory/OrganizationTree',
  component: OrganizationTree,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div className="w-[400px]"><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof OrganizationTree>;

export const Default: Story = {
  args: {
    tree: mockOrgTree,
    onNodeClick: (node) => console.log('Clicked:', node),
  },
};

export const DarkMode: Story = {
  args: Default.args,
  parameters: { backgrounds: { default: 'dark' } },
};
