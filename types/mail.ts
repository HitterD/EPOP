export interface MailFolder {
  id: string;
  name: string;
  icon: string;
  unreadCount?: number;
}

export interface MailRecipient {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface MailAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadProgress?: number;
  error?: string;
}

export interface MailMessage {
  id: string;
  from: MailRecipient;
  to: MailRecipient[];
  cc?: MailRecipient[];
  bcc?: MailRecipient[];
  subject: string;
  body: string;
  preview: string;
  timestamp: Date;
  unread: boolean;
  starred: boolean;
  priority: 'normal' | 'high' | 'low';
  attachments: MailAttachment[];
  labels?: string[];
  folder: string;
}

export interface MailDraft {
  id: string;
  to: MailRecipient[];
  cc?: MailRecipient[];
  bcc?: MailRecipient[];
  subject: string;
  body: string;
  attachments: MailAttachment[];
  timestamp: Date;
}

export interface MailSidebarProps {
  folders: MailFolder[];
  selectedFolder: string;
  onSelectFolder: (id: string) => void;
  unreadCounts: Record<string, number>;
  onCompose: () => void;
}

export interface MailListProps {
  messages: MailMessage[];
  selectedIds: string[];
  onSelect: (id: string, multi?: boolean) => void;
  onBulkAction: (action: string, ids: string[]) => void;
  sortBy: 'date' | 'sender' | 'subject';
  loading?: boolean;
  error?: Error;
}

export interface MailDetailProps {
  message: MailMessage;
  onReply: () => void;
  onReplyAll: () => void;
  onForward: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onStar: () => void;
}

export interface MailComposerProps {
  mode: 'compose' | 'reply' | 'forward';
  replyTo?: MailMessage;
  onSend: (draft: MailDraft) => void;
  onSaveDraft: (draft: Partial<MailDraft>) => void;
  onDiscard: () => void;
  initialDraft?: Partial<MailDraft>;
}

export interface RecipientInputProps {
  value: MailRecipient[];
  onChange: (recipients: MailRecipient[]) => void;
  suggestions: MailRecipient[];
  onSearch: (query: string) => void;
  placeholder?: string;
  label?: string;
}

export interface AttachmentChipProps {
  file: MailAttachment;
  onRemove: () => void;
  onRetry?: () => void;
  onPreview?: () => void;
}

export interface BulkActionBarProps {
  selectedCount: number;
  onDelete: () => void;
  onArchive: () => void;
  onMarkRead: () => void;
  onMarkUnread: () => void;
  onMove: (folder: string) => void;
}
