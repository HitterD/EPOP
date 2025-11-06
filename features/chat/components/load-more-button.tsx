'use client'

import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LoadMoreButtonProps {
  onClick?: () => void
  loading?: boolean
}

export function LoadMoreButton({ onClick, loading }: LoadMoreButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={loading}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {loading ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          Loading...
        </>
      ) : (
        'Load more messages'
      )}
    </Button>
  )
}
