import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Trash2, Archive, Mail, MailOpen, FolderInput, ChevronDown } from 'lucide-react';
import type { BulkActionBarProps } from '@/types/mail';

export function BulkActionBar({
  selectedCount,
  onDelete,
  onArchive,
  onMarkRead,
  onMarkUnread,
  onMove,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      role="toolbar"
      aria-label={`${selectedCount} messages selected`}
      className="sticky top-0 z-10 flex items-center gap-2 px-4 py-2 bg-accent border-b"
    >
      <span className="text-sm font-medium" aria-live="polite">
        {selectedCount} selected
      </span>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onArchive}
          className="gap-2"
        >
          <Archive className="h-4 w-4" />
          Archive
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onMarkRead}
          className="gap-2"
        >
          <MailOpen className="h-4 w-4" />
          Mark Read
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onMarkUnread}
          className="gap-2"
        >
          <Mail className="h-4 w-4" />
          Mark Unread
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <FolderInput className="h-4 w-4" />
              Move
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => onMove('inbox')}>
              Inbox
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMove('archive')}>
              Archive
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMove('deleted')}>
              Deleted
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
