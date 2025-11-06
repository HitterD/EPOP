'use client'

import { useState } from 'react'
import { 
  Reply, 
  ReplyAll, 
  Forward, 
  Archive, 
  Trash2, 
  Star, 
  MoreVertical,
  Download,
  Paperclip
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDate } from '@/lib/utils/format'
import { MailItem } from '@/types'
import { cn } from '@/lib/utils'

interface MailViewerProps {
  mail: MailItem
  onReply: () => void
  onReplyAll: () => void
  onForward: () => void
  onArchive: () => void
  onDelete: () => void
  onToggleStar: () => void
}

export function MailViewer({
  mail,
  onReply,
  onReplyAll,
  onForward,
  onArchive,
  onDelete,
  onToggleStar,
}: MailViewerProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b">
        <Button size="sm" variant="ghost" onClick={onArchive}>
          <Archive size={16} className="mr-2" />
          Archive
        </Button>
        <Button size="sm" variant="ghost" onClick={onDelete}>
          <Trash2 size={16} className="mr-2" />
          Delete
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onToggleStar}
          className={cn(mail.starred && 'text-yellow-500')}
        >
          <Star 
            size={16} 
            className={cn('mr-2', mail.starred && 'fill-yellow-500')} 
          />
          {mail.starred ? 'Starred' : 'Star'}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="ml-auto">
              <MoreVertical size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Mark as unread</DropdownMenuItem>
            <DropdownMenuItem>Add label</DropdownMenuItem>
            <DropdownMenuItem>Move to folder</DropdownMenuItem>
            <DropdownMenuItem>Print</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Subject */}
        <h1 className="text-2xl font-bold mb-4">{mail.subject || '(No subject)'}</h1>

        {/* Labels */}
        {mail.labels && mail.labels.length > 0 && (
          <div className="flex gap-1 mb-4">
            {mail.labels.map((label) => (
              <Badge key={label} variant="outline">
                {label}
              </Badge>
            ))}
          </div>
        )}

        {/* From */}
        <div className="flex items-start gap-3 mb-6">
          <Avatar>
            <AvatarImage src={mail.from.avatarUrl} />
            <AvatarFallback>
              {mail.from.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{mail.from.name}</span>
              <span className="text-sm text-gray-500">{mail.from.email}</span>
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                to {mail.to.map((t) => t.email).join(', ')}
              </span>
              
              {(mail.cc && mail.cc.length > 0) || (mail.bcc && mail.bcc.length > 0) ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-auto p-0 text-xs"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? 'hide details' : 'show details'}
                </Button>
              ) : null}
            </div>

            {showDetails && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {mail.cc && mail.cc.length > 0 && (
                  <div>cc: {mail.cc.map((c) => c.email).join(', ')}</div>
                )}
                {mail.bcc && mail.bcc.length > 0 && (
                  <div>bcc: {mail.bcc.map((b) => b.email).join(', ')}</div>
                )}
                <div>date: {formatDate(mail.createdAt, 'PPPppp')}</div>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-500 flex-shrink-0">
            {formatDate(mail.createdAt, 'PPP p')}
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Body */}
        <div 
          className="prose dark:prose-invert max-w-none mb-6"
          dangerouslySetInnerHTML={{ __html: mail.body }}
        />

        {/* Attachments */}
        {mail.attachments && mail.attachments.length > 0 && (
          <div className="mt-6 p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Paperclip size={16} />
              <span className="font-semibold">
                {mail.attachments.length} attachment{mail.attachments.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {mail.attachments.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{file.name}</div>
                    <div className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <Button size="icon" variant="ghost">
                    <Download size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-6 pt-6 border-t">
          <Button onClick={onReply}>
            <Reply size={14} className="mr-2" />
            Reply
          </Button>
          <Button variant="outline" onClick={onReplyAll}>
            <ReplyAll size={14} className="mr-2" />
            Reply All
          </Button>
          <Button variant="outline" onClick={onForward}>
            <Forward size={14} className="mr-2" />
            Forward
          </Button>
        </div>
      </div>
    </div>
  )
}
