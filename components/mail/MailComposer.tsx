import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, Paperclip, X, Minimize2, Maximize2 } from 'lucide-react';
import { RecipientInput } from './RecipientInput';
import { AttachmentChip } from './AttachmentChip';
import { RichTextEditor } from './RichTextEditor';
import { cn } from '@/lib/utils';
import type { MailComposerProps, MailRecipient, MailAttachment, MailDraft } from '@/types/mail';

const AUTOSAVE_DELAY = 3000;
const MAX_ATTACHMENT_SIZE = 25 * 1024 * 1024; // 25MB

export function MailComposer({
  mode,
  replyTo,
  onSend,
  onSaveDraft,
  onDiscard,
  initialDraft,
}: MailComposerProps) {
  const [to, setTo] = useState<MailRecipient[]>(initialDraft?.to || []);
  const [cc, setCc] = useState<MailRecipient[]>(initialDraft?.cc || []);
  const [bcc, setBcc] = useState<MailRecipient[]>(initialDraft?.bcc || []);
  const [subject, setSubject] = useState(initialDraft?.subject || '');
  const [body, setBody] = useState(initialDraft?.body || '');
  const [attachments, setAttachments] = useState<MailAttachment[]>(initialDraft?.attachments || []);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [recipients, setRecipients] = useState<MailRecipient[]>([]);

  // Autosave to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      const draft: Partial<MailDraft> = {
        to,
        cc,
        bcc,
        subject,
        body,
        attachments,
      };
      localStorage.setItem('mail-draft', JSON.stringify(draft));
      onSaveDraft(draft);
    }, AUTOSAVE_DELAY);

    return () => clearTimeout(timer);
  }, [to, cc, bcc, subject, body, attachments, onSaveDraft]);

  // Load draft from localStorage
  useEffect(() => {
    if (!initialDraft) {
      const saved = localStorage.getItem('mail-draft');
      if (saved) {
        const draft = JSON.parse(saved);
        setTo(draft.to || []);
        setCc(draft.cc || []);
        setBcc(draft.bcc || []);
        setSubject(draft.subject || '');
        setBody(draft.body || '');
        setAttachments(draft.attachments || []);
      }
    }
  }, [initialDraft]);

  const handleSend = useCallback(() => {
    if (to.length === 0 || !subject.trim() || !body.trim()) {
      return;
    }

    const draft: MailDraft = {
      id: Date.now().toString(),
      to,
      cc,
      bcc,
      subject,
      body,
      attachments,
      timestamp: new Date(),
    };

    onSend(draft);
    localStorage.removeItem('mail-draft');
  }, [to, cc, bcc, subject, body, attachments, onSend]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach((file) => {
      if (file.size > MAX_ATTACHMENT_SIZE) {
        alert(`${file.name} exceeds 25MB limit`);
        return;
      }

      const attachment: MailAttachment = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadProgress: 0,
      };

      setAttachments((prev) => [...prev, attachment]);

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (progress >= 100) {
          clearInterval(interval);
          setAttachments((prev) =>
            prev.map((a) => (a.id === attachment.id ? { ...a, uploadProgress: 100 } : a))
          );
        } else {
          setAttachments((prev) =>
            prev.map((a) => (a.id === attachment.id ? { ...a, uploadProgress: progress } : a))
          );
        }
      }, 200);
    });
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const canSend = to.length > 0 && subject.trim() && body.trim();

  return (
    <div
      className={cn(
        'flex flex-col bg-background border rounded-lg shadow-lg',
        isMinimized ? 'h-14' : 'h-[600px]'
      )}
      onKeyDown={handleKeyDown}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <h2 className="font-semibold">
          {mode === 'compose' ? 'New Message' : mode === 'reply' ? 'Reply' : 'Forward'}
        </h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDiscard}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Recipients */}
          <div className="p-4 space-y-3">
            <RecipientInput
              value={to}
              onChange={setTo}
              suggestions={recipients}
              onSearch={(q) => {/* Mock search */}}
              label="To"
              placeholder="Add recipients..."
            />

            {showCc && (
              <RecipientInput
                value={cc}
                onChange={setCc}
                suggestions={recipients}
                onSearch={(q) => {/* Mock search */}}
                label="Cc"
                placeholder="Add Cc..."
              />
            )}

            {showBcc && (
              <RecipientInput
                value={bcc}
                onChange={setBcc}
                suggestions={recipients}
                onSearch={(q) => {/* Mock search */}}
                label="Bcc"
                placeholder="Add Bcc..."
              />
            )}

            {!showCc && !showBcc && (
              <div className="flex gap-2">
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() => setShowCc(true)}
                >
                  Cc
                </Button>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() => setShowBcc(true)}
                >
                  Bcc
                </Button>
              </div>
            )}

            <div>
              <Input
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="border-0 border-b rounded-none px-0 focus-visible:ring-0"
              />
            </div>
          </div>

          <Separator />

          {/* Body */}
          <div className="flex-1 overflow-hidden">
            <RichTextEditor
              content={body}
              onChange={setBody}
              placeholder="Write your message..."
              minHeight="300px"
              className="border-0 h-full"
            />
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <>
              <Separator />
              <div className="p-4 space-y-2 max-h-32 overflow-y-auto">
                {attachments.map((attachment) => (
                  <AttachmentChip
                    key={attachment.id}
                    file={attachment}
                    onRemove={() =>
                      setAttachments((prev) => prev.filter((a) => a.id !== attachment.id))
                    }
                  />
                ))}
              </div>
            </>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                onClick={handleSend}
                disabled={!canSend}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                Send
              </Button>

              <label>
                <Button variant="ghost" size="sm" asChild>
                  <span className="cursor-pointer">
                    <Paperclip className="h-4 w-4" />
                  </span>
                </Button>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="*/*"
                />
              </label>
            </div>

            <Button variant="ghost" size="sm" onClick={onDiscard}>
              Discard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
