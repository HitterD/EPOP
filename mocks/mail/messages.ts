import type { MailFolder, MailMessage, MailRecipient, MailDraft } from '@/types/mail';

export const mockFolders: MailFolder[] = [
  { id: 'inbox', name: 'Inbox', icon: 'inbox', unreadCount: 12 },
  { id: 'sent', name: 'Sent', icon: 'send', unreadCount: 0 },
  { id: 'drafts', name: 'Drafts', icon: 'file-text', unreadCount: 1 },
  { id: 'deleted', name: 'Deleted', icon: 'trash', unreadCount: 3 },
  { id: 'archive', name: 'Archive', icon: 'archive', unreadCount: 0 },
];

export const mockRecipients: MailRecipient[] = [
  {
    id: '1',
    name: 'Alice Chen',
    email: 'alice@epop.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@epop.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
  },
  {
    id: '3',
    name: 'Carol Lee',
    email: 'carol@epop.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol',
  },
  {
    id: '4',
    name: 'Dave Wilson',
    email: 'dave@epop.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dave',
  },
];

export const mockMessages: MailMessage[] = [
  {
    id: 'm1',
    from: mockRecipients[0],
    to: [mockRecipients[1]],
    subject: 'Q1 Project Timeline',
    body: '<p>Hi Bob,</p><p>Can we discuss the timeline for the Q1 project? I think we need to adjust some milestones.</p><p>Best regards,<br/>Alice</p>',
    preview: 'Can we discuss the timeline for the Q1 project? I think we need to adjust some milestones.',
    timestamp: new Date(Date.now() - 3600000),
    unread: true,
    starred: true,
    priority: 'high',
    attachments: [
      {
        id: 'a1',
        name: 'timeline.pdf',
        size: 2457600,
        type: 'application/pdf',
        url: '/files/timeline.pdf',
      },
    ],
    folder: 'inbox',
  },
  {
    id: 'm2',
    from: mockRecipients[1],
    to: [mockRecipients[0]],
    subject: 'Invoice #1234',
    body: '<p>Hi Alice,</p><p>Please find attached the invoice for last month.</p><p>Thanks,<br/>Bob</p>',
    preview: 'Please find attached the invoice for last month.',
    timestamp: new Date(Date.now() - 7200000),
    unread: false,
    starred: false,
    priority: 'normal',
    attachments: [
      {
        id: 'a2',
        name: 'invoice-1234.xlsx',
        size: 156000,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        url: '/files/invoice-1234.xlsx',
      },
    ],
    folder: 'inbox',
  },
  {
    id: 'm3',
    from: mockRecipients[2],
    to: [mockRecipients[0], mockRecipients[1]],
    cc: [mockRecipients[3]],
    subject: 'URGENT: Server Down',
    body: '<p>Team,</p><p>The production server is currently down. We are investigating the issue.</p><p>Carol</p>',
    preview: 'The production server is currently down. We are investigating the issue.',
    timestamp: new Date(Date.now() - 10800000),
    unread: true,
    starred: false,
    priority: 'high',
    attachments: [],
    folder: 'inbox',
  },
  {
    id: 'm4',
    from: mockRecipients[0],
    to: [mockRecipients[2]],
    subject: 'Re: Design Review',
    body: '<p>Carol,</p><p>Thanks for the design mockups. They look great!</p><p>Alice</p>',
    preview: 'Thanks for the design mockups. They look great!',
    timestamp: new Date(Date.now() - 86400000),
    unread: false,
    starred: false,
    priority: 'normal',
    attachments: [],
    folder: 'sent',
  },
];

export const mockDraft: MailDraft = {
  id: 'd1',
  to: [mockRecipients[1]],
  subject: 'Draft: Meeting Notes',
  body: '<p>Hi Bob,</p><p>Here are the notes from yesterday\'s meeting...</p>',
  attachments: [],
  timestamp: new Date(Date.now() - 1800000),
};

export const mockUnreadMessages = mockMessages.filter((m) => m.unread);
export const mockStarredMessages = mockMessages.filter((m) => m.starred);
export const mockHighPriorityMessages = mockMessages.filter((m) => m.priority === 'high');
