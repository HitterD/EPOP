export type PresenceStatus = 'online' | 'away' | 'offline';
export type MessageStatus = 'sending' | 'sent' | 'failed';
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  presence: PresenceStatus;
  customStatus?: string;
  extension?: string; // Phone extension number (e.g., "5555")
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  thumbnailUrl?: string;
}

export interface Reaction {
  id: string;
  messageId: string;
  emoji: string;
  userId: string;
  user: User;
  createdAt: Date;
}

export interface Message {
  id: string;
  clientId: string;
  conversationId: string;
  content: string;
  author: User;
  timestamp: Date;
  reactions: Reaction[];
  readBy: User[];
  replyCount: number;
  status: MessageStatus;
  parentId?: string;
  attachments?: Attachment[];
  isEdited?: boolean;
  isDeleted?: boolean;
}

export interface Conversation {
  id: string;
  name: string;
  avatarUrl?: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  participants: User[];
  typing: string[]; // User IDs currently typing
}

export interface ChatListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
  filter?: 'all' | 'unread' | 'mentions';
  loading?: boolean;
  error?: Error;
}

export interface ThreadViewProps {
  conversationId: string;
  messages: Message[];
  currentUserId: string;
  onReply: (messageId: string, content: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
  error?: Error;
  connectionStatus: ConnectionStatus;
}

export interface MessageComposerProps {
  onSend: (content: string, files?: File[]) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  uploadProgress?: Record<string, number>;
  mentionSuggestions?: User[];
}

export interface ReconnectBannerProps {
  status: 'connecting' | 'disconnected';
  onRetry?: () => void;
  autoRetryIn?: number;
}
