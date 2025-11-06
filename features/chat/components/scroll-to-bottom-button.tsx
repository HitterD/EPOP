'use client'

import { ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ScrollToBottomButtonProps {
  onClick: () => void
  unreadCount?: number
}

export function ScrollToBottomButton({ onClick, unreadCount }: ScrollToBottomButtonProps) {
  return (
    <div className="absolute bottom-20 right-4 z-20">
      <Button
        onClick={onClick}
        size="icon"
        className="h-10 w-10 rounded-full shadow-lg bg-primary-500 hover:bg-primary-600 text-white"
        aria-label="Scroll to bottom"
      >
        <ArrowDown size={20} />
        {unreadCount && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-error text-white text-xs flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>
    </div>
  )
}
