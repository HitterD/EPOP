'use client'

import { useState } from 'react'
import { Mail, Star, Archive, Trash2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils/format'
import { cn } from '@/lib/utils'
import { MailItem } from '@/types'

interface MailListProps {
  mails: MailItem[]
  selectedMail: MailItem | null
  selectedIds: string[]
  onSelectMail: (mail: MailItem) => void
  onToggleSelect: (id: string) => void
  onToggleSelectAll: () => void
  onRefresh: () => void
  loading?: boolean
}

export function MailList({
  mails,
  selectedMail,
  selectedIds,
  onSelectMail,
  onToggleSelect,
  onToggleSelectAll,
  onRefresh,
  loading = false,
}: MailListProps) {
  const allSelected = mails.length > 0 && selectedIds.length === mails.length

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b">
        <Checkbox
          checked={allSelected}
          onCheckedChange={onToggleSelectAll}
          aria-label="Select all"
        />
        
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

      {/* Mail List */}
      <div className="flex-1 overflow-y-auto">
        {mails.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Mail size={48} className="mx-auto mb-2 opacity-50" />
              <p>No emails</p>
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {mails.map((mail) => (
              <MailListItem
                key={mail.id}
                mail={mail}
                isSelected={selectedIds.includes(mail.id)}
                isActive={selectedMail?.id === mail.id}
                onSelect={() => onSelectMail(mail)}
                onToggleSelect={() => onToggleSelect(mail.id)}
              />
            ))}
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
        'flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
        isActive && 'bg-blue-50 dark:bg-blue-900/20',
        !mail.isRead && 'font-semibold'
      )}
      onClick={onSelect}
      data-testid="mail-item"
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => {
          onToggleSelect()
        }}
        onClick={(e) => e.stopPropagation()}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium truncate break-all">{mail.from}</span>
          
          {mail.isStarred && (
            <Star size={14} className="text-yellow-500 fill-yellow-500 flex-shrink-0" />
          )}
          
          {mail.attachments && mail.attachments.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {mail.attachments.length} file{mail.attachments.length > 1 ? 's' : ''}
            </Badge>
          )}
          
          <span className="text-xs text-gray-500 ml-auto flex-shrink-0">
            {formatDate(mail.createdAt, 'PP')}
          </span>
        </div>

        <div className="text-sm mb-1 truncate">
          {mail.subject || '(No subject)'}
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
          {mail.snippet}
        </div>

        {mail.labels && mail.labels.length > 0 && (
          <div className="flex gap-1 mt-2">
            {mail.labels.map((label) => (
              <Badge key={label} variant="secondary" className="text-xs">
                {label}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
