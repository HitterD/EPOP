'use client'

import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Mail, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils/format'
import { cn } from '@/lib/utils'
import { MailItem } from '@/types'

interface VirtualizedMailListProps {
  mails: MailItem[]
  selectedMail: MailItem | null
  selectedIds: string[]
  onSelectMail: (mail: MailItem) => void
  onToggleSelect: (id: string) => void
  onToggleSelectAll: () => void
  onRefresh: () => void
  loading?: boolean
}

export function VirtualizedMailList({
  mails,
  selectedMail,
  selectedIds,
  onSelectMail,
  onToggleSelect,
  onToggleSelectAll,
  onRefresh,
  loading = false,
}: VirtualizedMailListProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const allSelected = mails.length > 0 && selectedIds.length === mails.length

  // Configure virtualizer for 60fps with 10k+ items
  const virtualizer = useVirtualizer({
    count: mails.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Estimated row height
    overscan: 10, // Render 10 items above/below viewport
    ...(typeof window !== 'undefined' && navigator.userAgent.indexOf('Firefox') === -1
      ? {
          measureElement: (
            element: Element,
            _entry?: ResizeObserverEntry,
            _instance?: import('@tanstack/react-virtual').Virtualizer<HTMLDivElement, Element>,
          ) => (element as HTMLElement).getBoundingClientRect().height,
        }
      : {}),
  })

  const items = virtualizer.getVirtualItems()

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b flex-shrink-0">
        <Checkbox
          checked={allSelected}
          onCheckedChange={onToggleSelectAll}
          aria-label="Select all"
        />
        
        <div className="text-sm text-muted-foreground">
          {mails.length} emails
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={onRefresh}
          disabled={loading}
          className="ml-auto"
        >
          <RefreshCw size={14} className={cn('mr-2', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Virtualized Mail List */}
      <div
        ref={parentRef}
        className="flex-1 overflow-y-auto"
        style={{ contain: 'strict' }}
      >
        {mails.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Mail size={48} className="mx-auto mb-2 opacity-50" />
              <p>No emails</p>
            </div>
          </div>
        ) : (
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {items.map((virtualRow) => {
              const mail = mails[virtualRow.index]
              if (!mail) return null
              const isSelected = selectedIds.includes(mail.id)
              const isActive = selectedMail?.id === mail.id

              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <MailListItem
                    mail={mail}
                    isSelected={isSelected}
                    isActive={isActive}
                    onSelect={() => onSelectMail(mail)}
                    onToggleSelect={() => onToggleSelect(mail.id)}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

interface MailListItemProps {
  mail: MailItem
  isSelected: boolean
  isActive: boolean
  onSelect: () => void
  onToggleSelect: () => void
}

function MailListItem({
  mail,
  isSelected,
  isActive,
  onSelect,
  onToggleSelect,
}: MailListItemProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 border-b hover:bg-accent/50 cursor-pointer transition-colors',
        isActive && 'bg-accent',
        mail.isRead === false && 'font-semibold bg-blue-50 dark:bg-blue-950/20'
      )}
      onClick={onSelect}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={onToggleSelect}
        onClick={(e) => e.stopPropagation()}
        aria-label={`Select email from ${mail.from}`}
      />

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate">
            {mail.from}
          </span>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {formatDate(mail.date, 'relative')}
          </span>
        </div>

        <div className="text-sm truncate">
          {mail.subject}
        </div>

        <div className="text-xs text-muted-foreground truncate">
          {mail.snippet}
        </div>

        {mail.labels && mail.labels.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {mail.labels.map((label) => (
              <span key={label}>
                <Badge variant="secondary" className="text-xs">
                  {label}
                </Badge>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
