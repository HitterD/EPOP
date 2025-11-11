import { nanoid } from 'nanoid';
import type { Conversation, Message, User, Reaction } from '@/types/chat';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alice Chen',
    email: 'alice@epop.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    presence: 'online',
    customStatus: 'Working on design specs',
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@epop.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    presence: 'away',
  },
  {
    id: '3',
    name: 'Carol Lee',
    email: 'carol@epop.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol',
    presence: 'offline',
  },
  {
    id: '4',
    name: 'Dave Wilson',
    email: 'dave@epop.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dave',
    presence: 'online',
  },
];

export const mockMessages: Message[] = [
  {
    id: 'm1',
    clientId: nanoid(),
    conversationId: 'c1',
    content: 'Hey team! Can we discuss the project timeline?',
    author: mockUsers[0],
    timestamp: new Date(Date.now() - 3600000),
    reactions: [
      { emoji: '👍', users: [mockUsers[1], mockUsers[2]], count: 2 },
      { emoji: '❤️', users: [mockUsers[3]], count: 1 },
    ],
    readBy: [mockUsers[1], mockUsers[2], mockUsers[3]],
    replyCount: 2,
    status: 'sent',
  },
  {
    id: 'm2',
    clientId: nanoid(),
    conversationId: 'c1',
    content: 'Sure! I think we should aim for end of Q1',
    author: mockUsers[1],
    timestamp: new Date(Date.now() - 3000000),
    reactions: [{ emoji: '💯', users: [mockUsers[0]], count: 1 }],
    readBy: [mockUsers[0], mockUsers[2]],
    replyCount: 0,
    status: 'sent',
    parentId: 'm1',
  },
  {
    id: 'm3',
    clientId: nanoid(),
    conversationId: 'c1',
    content: 'Agreed! Let me update the Gantt chart',
    author: mockUsers[2],
    timestamp: new Date(Date.now() - 2400000),
    reactions: [],
    readBy: [mockUsers[0]],
    replyCount: 0,
    status: 'sent',
    parentId: 'm1',
  },
  {
    id: 'm4',
    clientId: nanoid(),
    conversationId: 'c1',
    content: 'I uploaded the specs document to Files',
    author: mockUsers[0],
    timestamp: new Date(Date.now() - 1800000),
    reactions: [],
    readBy: [],
    replyCount: 0,
    status: 'sent',
    attachments: [
      {
        id: 'a1',
        name: 'project-specs.pdf',
        size: 2457600,
        type: 'application/pdf',
        url: '/files/project-specs.pdf',
      },
    ],
  },
];

export const mockConversations: Conversation[] = [
  {
    id: 'c1',
    name: 'Engineering Team',
    avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=engineering',
    lastMessage: 'I uploaded the specs document to Files',
    timestamp: new Date(Date.now() - 1800000),
    unreadCount: 3,
    participants: [mockUsers[0], mockUsers[1], mockUsers[2]],
    typing: [],
  },
  {
    id: 'c2',
    name: 'Bob Smith',
    avatarUrl: mockUsers[1].avatarUrl,
    lastMessage: 'Can you review the PR?',
    timestamp: new Date(Date.now() - 7200000),
    unreadCount: 0,
    participants: [mockUsers[0], mockUsers[1]],
    typing: [],
  },
  {
    id: 'c3',
    name: 'Product Team',
    avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=product',
    lastMessage: 'Meeting starts in 10 minutes',
    timestamp: new Date(Date.now() - 10800000),
    unreadCount: 1,
    participants: [mockUsers[0], mockUsers[2], mockUsers[3]],
    typing: [mockUsers[3].id],
  },
];

export const mockSendingMessage: Message = {
  id: 'temp-' + nanoid(),
  clientId: nanoid(),
  conversationId: 'c1',
  content: 'Sending message...',
  author: mockUsers[0],
  timestamp: new Date(),
  reactions: [],
  readBy: [],
  replyCount: 0,
  status: 'sending',
};

export const mockFailedMessage: Message = {
  id: 'temp-failed',
  clientId: nanoid(),
  conversationId: 'c1',
  content: 'This message failed to send',
  author: mockUsers[0],
  timestamp: new Date(Date.now() - 60000),
  reactions: [],
  readBy: [],
  replyCount: 0,
  status: 'failed',
};
