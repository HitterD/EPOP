export const APP_NAME = 'EPOP'
export const APP_DESCRIPTION = 'Enterprise Collaboration Platform'

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  CHAT: '/chat',
  MAIL: '/mail',
  PROJECTS: '/projects',
  FILES: '/files',
  DIRECTORY: '/directory',
  ADMIN: '/admin',
  SETTINGS: '/settings',
} as const

export const KEYBOARD_SHORTCUTS = {
  SEARCH: 'ctrl+k',
  NEW_CHAT: 'ctrl+n',
  ACTIVITY: 'ctrl+1',
  CHAT: 'ctrl+2',
  PROJECTS: 'ctrl+3',
  FILES: 'ctrl+4',
  DIRECTORY: 'ctrl+5',
  ADMIN: 'ctrl+6',
} as const

export const PRESENCE_STATUS = {
  AVAILABLE: 'available',
  BUSY: 'busy',
  AWAY: 'away',
  OFFLINE: 'offline',
} as const

export const DELIVERY_PRIORITY = {
  NORMAL: 'normal',
  IMPORTANT: 'important',
  URGENT: 'urgent',
} as const

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const

export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  DONE: 'done',
} as const

export const FILE_UPLOAD_MAX_SIZE = 10 * 1024 * 1024 // 10MB
export const ALLOWED_FILE_TYPES = [
  'image/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/*',
]

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const

export const SOCKET_EVENTS = {
  // Chat domain events (domain.entity_action)
  CHAT_MESSAGE_CREATED: 'chat.message.created',
  CHAT_MESSAGE_UPDATED: 'chat.message.updated',
  CHAT_MESSAGE_DELETED: 'chat.message.deleted',
  CHAT_TYPING_START: 'chat.typing.start',
  CHAT_TYPING_STOP: 'chat.typing.stop',
  CHAT_REACTION_ADDED: 'chat.message.reaction.added',
  CHAT_REACTION_REMOVED: 'chat.message.reaction.removed',
  
  // Project domain events
  PROJECT_TASK_CREATED: 'project.task.created',
  PROJECT_TASK_UPDATED: 'project.task.updated',
  PROJECT_TASK_MOVED: 'project.task.moved',
  PROJECT_TASK_DELETED: 'project.task.deleted',
  PROJECT_MEMBER_ADDED: 'project.member.added',
  PROJECT_MEMBER_REMOVED: 'project.member.removed',
  
  // User domain events
  USER_PRESENCE_CHANGED: 'user.presence.updated',
  USER_UPDATED: 'user.updated',
  
  // Directory domain events
  DIRECTORY_USER_MOVED: 'directory.user.moved',
  DIRECTORY_UNIT_UPDATED: 'directory.unit.updated',
  
  // File domain events
  FILE_UPLOADED: 'file.uploaded',
  FILE_READY: 'file.ready',
  FILE_SCAN_COMPLETE: 'file.scan.complete',
  
  // Notification domain events
  NOTIFICATION_CREATED: 'notification.created',
  NOTIFICATION_READ: 'notification.read',
} as const
