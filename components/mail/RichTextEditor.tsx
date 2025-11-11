import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link as LinkIcon,
  Unlink,
  Undo,
  Redo,
  Quote,
  Code,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
  minHeight?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Type your message...',
  editable = true,
  className,
  minHeight = '200px',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      Underline,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none focus:outline-none',
          'dark:prose-invert',
          'px-3 py-2'
        ),
      },
    },
  });

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url })
      .run();
  };

  return (
    <div
      className={cn(
        'border rounded-lg overflow-hidden bg-background',
        !editable && 'opacity-50',
        className
      )}
    >
      {editable && <EditorToolbar editor={editor} onSetLink={setLink} />}
      <div
        className="overflow-y-auto"
        style={{ minHeight }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

// Toolbar component
function EditorToolbar({
  editor,
  onSetLink,
}: {
  editor: any;
  onSetLink: () => void;
}) {
  if (!editor) {
    return null;
  }

  const ToolbarButton = ({
    onClick,
    isActive,
    disabled,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <Button
      variant={isActive ? 'default' : 'ghost'}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="h-8 w-8 p-0"
      title={title}
      type="button"
    >
      {children}
    </Button>
  );

  return (
    <div className="border-b bg-muted/30 p-2 flex flex-wrap gap-1">
      {/* Text Formatting */}
      <div className="flex gap-1 mr-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="Code (Ctrl+E)"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Lists */}
      <div className="flex gap-1 mr-2 border-l pl-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Links */}
      <div className="flex gap-1 mr-2 border-l pl-2">
        <ToolbarButton
          onClick={onSetLink}
          isActive={editor.isActive('link')}
          title="Insert Link (Ctrl+K)"
        >
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive('link')}
          title="Remove Link"
        >
          <Unlink className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* History */}
      <div className="flex gap-1 border-l pl-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>
    </div>
  );
}

// Read-only version for displaying HTML content
export function RichTextViewer({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'prose prose-sm max-w-none',
        'dark:prose-invert',
        'px-3 py-2',
        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

// Hook for getting plain text from HTML
export function useEditorContent() {
  const getPlainText = (html: string): string => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const isEmpty = (html: string): boolean => {
    const text = getPlainText(html);
    return !text.trim();
  };

  const getWordCount = (html: string): number => {
    const text = getPlainText(html);
    return text.split(/\s+/).filter((word) => word.length > 0).length;
  };

  return {
    getPlainText,
    isEmpty,
    getWordCount,
  };
}
