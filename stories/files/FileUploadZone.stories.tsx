import type { Meta, StoryObj } from '@storybook/react';
import { FileUploadZone } from '@/features/files/FileUploadZone';

const meta: Meta<typeof FileUploadZone> = {
  title: 'Files/FileUploadZone',
  component: FileUploadZone,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof FileUploadZone>;

export const Default: Story = {
  args: {
    onFilesSelected: (files) => console.log('Files:', files),
    maxSize: 100 * 1024 * 1024,
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
};

export const WithTypeRestriction: Story = {
  args: {
    ...Default.args,
    acceptedTypes: ['image/*', 'application/pdf'],
  },
};
