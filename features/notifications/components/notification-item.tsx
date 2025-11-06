'use client'

import { Notification } from '@/types'
import { Avatar } from '@/components/ui/avatar'
import { formatRelativeTime } from '@/lib/utils/format'
import { useMarkNotificationRead } from '@/lib/api/hooks/use-notifications'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  MessageCircle,
  AtSign,
  CheckSquare,
  Folder,
  Bell,
  Mail,
} from 'lucide-react'

interface NotificationItemProps {
  notification: Notification
  onClose?: () => void
}

export function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const { mutate: markAsRead } = useMarkNotificationRead()
  const router = useRouter()

  const handleClick = () => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead(notification.id)
    }

    // Navigate to action URL if available
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
      onClose?.()
    }
  }

  // Icon based on notification type
  const NotificationIcon = {
    chat_message: MessageCircle,
    chat_mention: AtSign,
    task_assigned: CheckSquare,
    project_update: Folder,
    system_announcement: Bell,
    mail_received: Mail,
  }[notification.type] || Bell

  const iconColor = {
    chat_message: 'text-blue-500 bg-blue-100 dark:bg-blue-900/20',
    chat_mention: 'text-orange-500 bg-orange-100 dark:bg-orange-900/20',
    task_assigned: 'text-purple-500 bg-purple-100 dark:bg-purple-900/20',
    project_update: 'text-green-500 bg-green-100 dark:bg-green-900/20',
    system_announcement: 'text-red-500 bg-red-100 dark:bg-red-900/20',
    mail_received: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/20',
  }[notification.type] || 'text-gray-500 bg-gray-100 dark:bg-gray-800'

  return (
    <div
      onClick={handleClick}
      className={cn(
        'flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors',
        !notification.isRead && 'bg-blue-50/50 dark:bg-blue-900/10'
      )}
    >
      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="flex-shrink-0 mt-2">
          <div className="w-2 h-2 rounded-full bg-primary-500" />
        </div>
      )}

      {/* Icon or Avatar */}
      <div className="flex-shrink-0">
        {notification.metadata?.senderAvatar ? (
          <Avatar
            src={notification.metadata.senderAvatar}
            alt={notification.metadata.senderName || 'User'}
            size="sm"
            fallback={notification.metadata.senderName?.[0] || 'U'}
          />
        ) : (
          <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', iconColor)}>
            <NotificationIcon size={18} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium line-clamp-1">{notification.title}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
          {notification.message}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          {formatRelativeTime(notification.timestamp)}
        </p>
      </div>
    </div>
  )
}
