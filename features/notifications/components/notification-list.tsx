'use client'

import { useRef, useEffect } from 'react'
import { NotificationItem } from './notification-item'
import { Notification } from '@/types'
import { Loader2 } from 'lucide-react'

interface NotificationListProps {
  notifications: Notification[]
  onLoadMore?: () => void
  hasMore?: boolean
  onClose?: () => void
}

export function NotificationList({
  notifications,
  onLoadMore,
  hasMore,
  onClose,
}: NotificationListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Infinite scroll
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100

      if (isNearBottom && hasMore && onLoadMore) {
        onLoadMore()
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [hasMore, onLoadMore])

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
          <Bell size={24} className="text-gray-400" />
        </div>
        <h3 className="font-medium text-sm mb-1">No notifications</h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          You're all caught up!
        </p>
      </div>
    )
  }

  return (
    <div
      ref={scrollRef}
      className="overflow-y-auto flex-1"
      style={{ maxHeight: '400px' }}
    >
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            {...(onClose ? { onClose } : {})}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex items-center justify-center py-4">
          <Loader2 size={20} className="animate-spin text-gray-400" />
        </div>
      )}
    </div>
  )
}

function Bell({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}
