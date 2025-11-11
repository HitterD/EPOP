import type { Meta, StoryObj } from '@storybook/react';
import { MailComposer } from '@/components/mail/MailComposer';
import { mockRecipients } from '@/mocks/mail/messages';

const meta: Meta<typeof MailComposer> = {
  title: 'Mail/MailComposer',
  component: MailComposer,
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div className="w-[700px]"><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof MailComposer>;

export const Compose: Story = {
  args: {
    mode: 'compose',
    onSend: (draft) => console.log('Send:', draft),
    onSaveDraft: (draft) => console.log('Save:', draft),
    onDiscard: () => console.log('Discard'),
  },
};

export const Reply: Story = {
  args: {
    mode: 'reply',
    onSend: (draft) => console.log('Send:', draft),
    onSaveDraft: (draft) => console.log('Save:', draft),
    onDiscard: () => console.log('Discard'),
  },
};

export const WithDraft: Story = {
  args: {
    ...Compose.args,
    initialDraft: {
      to: [mockRecipients[0]],
      subject: 'Draft: Meeting Notes',
      body: 'Hi,\n\nHere are the notes...',
      attachments: [],
    },
  },
};
