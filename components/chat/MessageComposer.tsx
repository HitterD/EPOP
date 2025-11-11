import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Paperclip,
  Smile,
  Send,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/chat/format';
import type { MessageComposerProps, User } from '@/types/chat';

const COMMON_EMOJIS = ['👍', '❤️', '😊', '🎉', '👏', '🔥', '💯', '✅'];

export function MessageComposer({
  onSend,
  placeholder = 'Type a message...',
  disabled = false,
  maxLength = 5000,
  uploadProgress = {},
  mentionSuggestions = [],
}: MessageComposerProps) {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  // Detect @mentions
  useEffect(() => {
    const cursorPosition = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = content.substring(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setShowMentions(true);
    } else {
      setShowMentions(false);
      setMentionQuery('');
    }
  }, [content]);

  const handleSend = () => {
    if (!content.trim() && files.length === 0) return;
    if (disabled) return;

    onSend(content.trim(), files);
    setContent('');
    setFiles([]);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Send on Cmd/Ctrl + Enter
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }

    // Close mentions on Escape
    if (e.key === 'Escape' && showMentions) {
      e.preventDefault();
      setShowMentions(false);
    }

    // Navigate mentions with arrow keys
    if (showMentions && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      // Handle mention navigation
    }

    // Accept mention with Tab or Enter
    if (showMentions && (e.key === 'Tab' || e.key === 'Enter')) {
      e.preventDefault();
      // Insert selected mention
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const insertEmoji = (emoji: string) => {
    const cursorPosition = textareaRef.current?.selectionStart || content.length;
    const newContent =
      content.substring(0, cursorPosition) +
      emoji +
      content.substring(cursorPosition);
    setContent(newContent);
    setShowEmoji(false);
    textareaRef.current?.focus();
  };

  const insertMention = (user: User) => {
    const cursorPosition = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = content.substring(0, cursorPosition);
    const textAfterCursor = content.substring(cursorPosition);
    const mentionStart = textBeforeCursor.lastIndexOf('@');

    const newContent =
      content.substring(0, mentionStart) +
      `@${user.name} ` +
      textAfterCursor;

    setContent(newContent);
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  const filteredMentions = mentionSuggestions.filter((user) =>
    user.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const isUploading = Object.keys(uploadProgress).length > 0;
  const nearLimit = content.length > maxLength * 0.8;

  return (
    <div className="border-t bg-background">
      {/* File previews */}
      {files.length > 0 && (
        <div className="px-4 pt-3 pb-2 space-y-2 border-b">
          {files.map((file, index) => {
            const progress = uploadProgress[file.name];
            const isUploading = progress !== undefined && progress < 100;
            const hasError = progress === -1;

            return (
              <div
                key={index}
                className={cn(
                  'flex items-center gap-2 p-2 rounded border',
                  hasError && 'border-destructive'
                )}
              >
                <Paperclip className="h-4 w-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                  {isUploading && (
                    <Progress value={progress} className="mt-1 h-1" />
                  )}
                  {hasError && (
                    <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      Upload failed
                    </p>
                  )}
                </div>
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => removeFile(index)}
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Input area */}
      <div className="p-4">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'min-h-[80px] max-h-[200px] resize-none pr-24',
              nearLimit && 'border-warning'
            )}
            role="textbox"
            aria-label="Message input"
            aria-multiline="true"
            aria-disabled={disabled}
          />

          {/* Character count */}
          {nearLimit && (
            <div
              className="absolute bottom-2 left-2 text-xs text-muted-foreground"
              aria-live="polite"
            >
              {content.length}/{maxLength}
            </div>
          )}

          {/* Mention suggestions */}
          {showMentions && filteredMentions.length > 0 && (
            <div
              role="listbox"
              aria-label="Mention suggestions"
              className="absolute bottom-full left-0 right-0 mb-2 bg-popover border rounded-lg shadow-lg max-h-48 overflow-y-auto"
            >
              {filteredMentions.map((user) => (
                <button
                  key={user.id}
                  role="option"
                  className="w-full px-3 py-2 text-left hover:bg-accent transition-colors flex items-center gap-2"
                  onClick={() => insertMention(user)}
                >
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                    {user.name[0]}
                  </div>
                  <span className="text-sm">{user.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            {/* File upload */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              aria-label="Attach files"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              aria-hidden="true"
            />

            {/* Emoji picker */}
            <Popover open={showEmoji} onOpenChange={setShowEmoji}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  aria-label="Insert emoji"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2">
                <div className="grid grid-cols-8 gap-1">
                  {COMMON_EMOJIS.map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-lg"
                      onClick={() => insertEmoji(emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={
              disabled ||
              (!content.trim() && files.length === 0) ||
              isUploading
            }
            size="sm"
            className="gap-2"
            aria-label="Send message"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send
              </>
            )}
          </Button>
        </div>

        {/* Offline notice */}
        {disabled && (
          <p className="text-xs text-muted-foreground mt-2">
            You're offline. Messages will send when reconnected.
          </p>
        )}
      </div>
    </div>
  );
}
