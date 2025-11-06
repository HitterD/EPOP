'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { NotificationList } from './notification-list'
import { useNotifications, useMarkAllNotificationsAsRead } from '@/lib/api/hooks/use-notifications'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const { data, fetchNextPage, hasNextPage } = useNotifications(20)
  const { mutate: markAllAsRead } = useMarkAllNotificationsAsRead()

  const notifications = data?.pages.flatMap((page) => page.items) || []
  const unreadCount = notifications.filter((n) => !n.isRead).length

  // Listen for new notifications via Socket.IO
  useEffect(() => {
    // Socket.IO listener would go here
    // socket.on('notification:created', handleNewNotification)
  }, [])

  const handleMarkAllAsRead = () => {
    markAllAsRead()
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-96 p-0"
        align="end"
        sideOffset={8}
      >
        <div className="flex flex-col max-h-[600px]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleMarkAllAsRead}
                className="h-7 text-xs"
              >
                Mark all as read
              </Button>
            )}
          </div>

          {/* Notifications list */}
          <NotificationList
            notifications={notifications}
            onLoadMore={() => hasNextPage && fetchNextPage()}
            hasMore={hasNextPage}
            onClose={() => setIsOpen(false)}
          />

          {/* Footer */}
          <div className="border-t px-4 py-2 text-center">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                setIsOpen(false)
                // Navigate to full notifications page
                window.location.href = '/notifications'
              }}
            >
              View all notifications
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
