import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Reply,
  ReplyAll,
  Forward,
  Trash2,
  Archive,
  Star,
  MoreVertical,
  Download,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/chat/format';
import { RichTextViewer } from './RichTextEditor';
import type { MailDetailProps } from '@/types/mail';
import DOMPurify from 'isomorphic-dompurify';

export function MailDetail({
  message,
  onReply,
  onReplyAll,
  onForward,
  onDelete,
  onArchive,
  onStar,
}: MailDetailProps) {
  const sanitizedBody = DOMPurify.sanitize(message.body, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'blockquote'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onReply}
            className="gap-2"
          >
            <Reply className="h-4 w-4" />
            Reply
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReplyAll}
            className="gap-2"
          >
            <ReplyAll className="h-4 w-4" />
            Reply All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onForward}
            className="gap-2"
          >
            <Forward className="h-4 w-4" />
            Forward
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onArchive}
          >
            <Archive className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onStar}
            className={cn(message.starred && 'text-yellow-500')}
          >
            <Star className={cn('h-4 w-4', message.starred && 'fill-current')} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Mark as unread</DropdownMenuItem>
              <DropdownMenuItem>Add label</DropdownMenuItem>
              <DropdownMenuItem>Block sender</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-4">
          {/* Subject */}
          <h1 className="text-2xl font-bold">{message.subject}</h1>

          {/* Sender info */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={message.from.avatarUrl} />
                <AvatarFallback>
                  {message.from.name.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{message.from.name}</p>
                <p className="text-sm text-muted-foreground">{message.from.email}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatRelativeTime(message.timestamp)}
            </p>
          </div>

          {/* Recipients */}
          <div className="text-sm space-y-1">
            <div>
              <span className="text-muted-foreground">To: </span>
              {message.to.map((r) => r.email).join(', ')}
            </div>
            {message.cc && message.cc.length > 0 && (
              <div>
                <span className="text-muted-foreground">Cc: </span>
                {message.cc.map((r) => r.email).join(', ')}
              </div>
            )}
          </div>

          <Separator />

          {/* Body */}
          <RichTextViewer content={sanitizedBody} />

          {/* Attachments */}
          {message.attachments.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-medium mb-2">
                  Attachments ({message.attachments.length})
                </h3>
                <div className="space-y-2">
                  {message.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 border rounded hover:bg-accent"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{attachment.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(attachment.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
