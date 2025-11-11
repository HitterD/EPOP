import type { Meta, StoryObj } from '@storybook/react';
import { SearchCommandPalette } from '@/features/search/SearchCommandPalette';

const meta: Meta<typeof SearchCommandPalette> = {
  title: 'Search/SearchCommandPalette',
  component: SearchCommandPalette,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof SearchCommandPalette>;

export const Open: Story = {
  args: {
    open: true,
    onClose: () => console.log('Close'),
    onSearch: (q, s) => console.log('Search:', q, s),
  },
};

export const WithResults: Story = {
  args: Open.args,
};
