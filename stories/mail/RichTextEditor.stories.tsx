import type { Meta, StoryObj } from '@storybook/react';
import { RichTextEditor, RichTextViewer } from '@/components/mail/RichTextEditor';
import { useState } from 'react';

const meta: Meta<typeof RichTextEditor> = {
  title: 'Mail/RichTextEditor',
  component: RichTextEditor,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RichTextEditor>;

function EditorDemo() {
  const [content, setContent] = useState('<p>Start typing your message...</p>');

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Rich Text Editor</h3>
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="Type your message..."
          minHeight="300px"
        />
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-2">HTML Output</h3>
        <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
          {content}
        </pre>
      </div>
    </div>
  );
}

export const Default: Story = {
  render: () => <EditorDemo />,
};

export const WithInitialContent: Story = {
  args: {
    content: `
      <p><strong>Hello!</strong> This is a <em>sample</em> message with:</p>
      <ul>
        <li>Bullet points</li>
        <li>Multiple items</li>
      </ul>
      <p>And a <a href="https://example.com">link</a>!</p>
      <blockquote>
        <p>A quote for emphasis</p>
      </blockquote>
    `,
    onChange: (html) => console.log('Content changed:', html),
  },
};

export const Readonly: Story = {
  args: {
    content: `
      <p>This editor is in <strong>read-only</strong> mode.</p>
      <p>You cannot edit the content.</p>
    `,
    onChange: () => {},
    editable: false,
  },
};

export const CustomMinHeight: Story = {
  args: {
    content: '<p>This editor has a custom minimum height of 500px</p>',
    onChange: (html) => console.log('Content changed:', html),
    minHeight: '500px',
  },
};

function ViewerDemo() {
  const sampleContent = `
    <h2>Email Subject</h2>
    <p>Dear Team,</p>
    <p>I wanted to share some <strong>important updates</strong> regarding our project:</p>
    <ul>
      <li>Phase 1 is complete</li>
      <li>Phase 2 begins next week</li>
      <li>Timeline is on track</li>
    </ul>
    <p>Please review the <a href="#">attached document</a> for more details.</p>
    <blockquote>
      <p>"Quality is never an accident; it is always the result of intelligent effort."</p>
    </blockquote>
    <p>Best regards,<br/>Alice</p>
  `;

  return (
    <div className="max-w-2xl">
      <h3 className="text-lg font-semibold mb-4">Read-Only Viewer</h3>
      <RichTextViewer content={sampleContent} />
    </div>
  );
}

export const Viewer: Story = {
  render: () => <ViewerDemo />,
};

function FormattingDemo() {
  const [content, setContent] = useState('<p>Try the formatting buttons:</p>');

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Test All Formatting Options</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Try using the toolbar buttons or keyboard shortcuts:
        </p>
        <ul className="text-sm text-muted-foreground list-disc list-inside mb-4">
          <li>Ctrl+B for bold</li>
          <li>Ctrl+I for italic</li>
          <li>Ctrl+U for underline</li>
          <li>Ctrl+K for links</li>
          <li>Ctrl+Z/Ctrl+Shift+Z for undo/redo</li>
        </ul>
      </div>
      
      <RichTextEditor
        content={content}
        onChange={setContent}
        placeholder="Type here and test formatting..."
        minHeight="400px"
      />
    </div>
  );
}

export const InteractiveFormatting: Story = {
  render: () => <FormattingDemo />,
};
