import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User } from '@/types/chat';

interface ReadReceiptsProps {
  readBy: User[];
  totalRecipients: number;
  isMine: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  className?: string;
}

export function ReadReceipts({
  readBy,
  totalRecipients,
  isMine,
  status = 'sent',
  className,
}: ReadReceiptsProps) {
  // Only show read receipts for messages sent by current user
  if (!isMine) {
    return null;
  }

  const readCount = readBy.length;
  const maxVisible = 3;
  const visibleUsers = readBy.slice(0, maxVisible);
  const hiddenCount = readCount - maxVisible;

  const formatUsersList = () => {
    if (readCount === 0) return 'No one has read this message';
    if (readCount === 1) return `Read by ${readBy[0].name}`;
    if (readCount === 2) return `Read by ${readBy[0].name} and ${readBy[1].name}`;
    if (readCount <= maxVisible) {
      const names = readBy.slice(0, -1).map(u => u.name).join(', ');
      return `Read by ${names}, and ${readBy[readCount - 1].name}`;
    }
    return `Read by ${visibleUsers.map(u => u.name).join(', ')}, and ${hiddenCount} other${hiddenCount > 1 ? 's' : ''}`;
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return (
          <Check className="h-3 w-3 text-muted-foreground" aria-label="Sending" />
        );
      case 'sent':
        return (
          <Check className="h-3 w-3 text-muted-foreground" aria-label="Sent" />
        );
      case 'delivered':
        return (
          <CheckCheck className="h-3 w-3 text-muted-foreground" aria-label="Delivered" />
        );
      case 'read':
        return (
          <CheckCheck className="h-3 w-3 text-primary" aria-label="Read" />
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn('flex items-center gap-2 mt-1', className)}>
      {/* Status icon */}
      <div className="flex items-center">
        {getStatusIcon()}
      </div>

      {/* Avatar stack for read receipts */}
      {readCount > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="flex items-center -space-x-2 cursor-help"
                role="group"
                aria-label={formatUsersList()}
              >
                {visibleUsers.map((user, index) => (
                  <div
                    key={user.id}
                    className={cn(
                      'relative inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium',
                      'ring-1 ring-primary/20'
                    )}
                    style={{ zIndex: maxVisible - index }}
                  >
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-primary">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                ))}
                {hiddenCount > 0 && (
                  <div
                    className="relative inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-primary text-[10px] font-medium text-primary-foreground"
                    style={{ zIndex: 0 }}
                  >
                    +{hiddenCount}
                  </div>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-xs">{formatUsersList()}</p>
              {totalRecipients > readCount && (
                <p className="text-xs text-muted-foreground mt-1">
                  {totalRecipients - readCount} recipient{totalRecipients - readCount > 1 ? 's' : ''} haven't read yet
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Read count text (alternative to avatars) */}
      {readCount > 0 && (
        <span className="text-xs text-muted-foreground">
          {readCount === totalRecipients
            ? 'Read by all'
            : `Read by ${readCount}${totalRecipients > 0 ? `/${totalRecipients}` : ''}`}
        </span>
      )}
    </div>
  );
}

// Alternative compact version
interface CompactReadReceiptsProps {
  readCount: number;
  totalRecipients: number;
  isMine: boolean;
}

export function CompactReadReceipts({
  readCount,
  totalRecipients,
  isMine,
}: CompactReadReceiptsProps) {
  if (!isMine || readCount === 0) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <CheckCheck
        className={cn('h-3 w-3', readCount > 0 && 'text-primary')}
        aria-label="Read"
      />
      <span aria-label={`Read by ${readCount} of ${totalRecipients} recipients`}>
        {readCount}/{totalRecipients}
      </span>
    </div>
  );
}
