import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Plus, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Reaction, User } from '@/types/chat';

const COMMON_EMOJIS = ['👍', '❤️', '😊', '🎉', '👏', '🔥', '💯', '✅', '👀', '🤔'];

interface MessageReactionsProps {
  reactions: Reaction[];
  currentUserId: string;
  onReact: (emoji: string) => void;
  onRemoveReaction: (emoji: string) => void;
}

export function MessageReactions({
  reactions,
  currentUserId,
  onReact,
  onRemoveReaction,
}: MessageReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = {
        emoji: reaction.emoji,
        count: 0,
        users: [],
        hasReacted: false,
      };
    }
    acc[reaction.emoji].count++;
    acc[reaction.emoji].users.push(reaction.user);
    if (reaction.userId === currentUserId) {
      acc[reaction.emoji].hasReacted = true;
    }
    return acc;
  }, {} as Record<string, { emoji: string; count: number; users: User[]; hasReacted: boolean }>);

  const reactionsList = Object.values(groupedReactions);
  const visibleReactions = reactionsList.slice(0, 3);
  const hiddenReactions = reactionsList.slice(3);

  const handleReactionClick = (emoji: string, hasReacted: boolean) => {
    if (hasReacted) {
      onRemoveReaction(emoji);
    } else {
      onReact(emoji);
    }
  };

  const formatUsersList = (users: User[]) => {
    if (users.length === 0) return '';
    if (users.length === 1) return users[0].name;
    if (users.length === 2) return `${users[0].name} and ${users[1].name}`;
    return `${users[0].name}, ${users[1].name}, and ${users.length - 2} other${users.length - 2 > 1 ? 's' : ''}`;
  };

  if (reactions.length === 0) {
    return (
      <div className="flex items-center gap-1 mt-1">
        <Popover open={showPicker} onOpenChange={setShowPicker}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              aria-label="Add reaction"
            >
              <Smile className="h-3 w-3 mr-1" />
              React
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2">
            <div className="grid grid-cols-5 gap-1">
              {COMMON_EMOJIS.map((emoji) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-lg hover:bg-accent"
                  onClick={() => {
                    onReact(emoji);
                    setShowPicker(false);
                  }}
                  aria-label={`React with ${emoji}`}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <div
      className="flex flex-wrap items-center gap-1 mt-1"
      role="group"
      aria-label="Message reactions"
    >
      {/* Visible reactions */}
      {visibleReactions.map(({ emoji, count, users, hasReacted }) => (
        <button
          key={emoji}
          onClick={() => handleReactionClick(emoji, hasReacted)}
          className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors',
            'border hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
            hasReacted
              ? 'bg-primary/10 border-primary text-primary'
              : 'bg-muted/50 border-border text-foreground'
          )}
          title={formatUsersList(users)}
          aria-label={`${emoji} ${count} reaction${count > 1 ? 's' : ''} by ${formatUsersList(users)}. ${hasReacted ? 'Click to remove your reaction' : 'Click to add reaction'}`}
        >
          <span>{emoji}</span>
          <span>{count}</span>
        </button>
      ))}

      {/* Hidden reactions in popover */}
      {hiddenReactions.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs border rounded-full"
              aria-label={`${hiddenReactions.length} more reactions`}
            >
              +{hiddenReactions.length}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="flex flex-col gap-1">
              {hiddenReactions.map(({ emoji, count, users, hasReacted }) => (
                <button
                  key={emoji}
                  onClick={() => handleReactionClick(emoji, hasReacted)}
                  className={cn(
                    'inline-flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors',
                    'hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary',
                    hasReacted && 'bg-primary/10 text-primary'
                  )}
                  title={formatUsersList(users)}
                >
                  <span className="text-base">{emoji}</span>
                  <span>{count}</span>
                  <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                    {formatUsersList(users)}
                  </span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Add reaction button */}
      <Popover open={showPicker} onOpenChange={setShowPicker}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 rounded-full border border-dashed"
            aria-label="Add another reaction"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2">
          <div className="grid grid-cols-5 gap-1">
            {COMMON_EMOJIS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-lg hover:bg-accent"
                onClick={() => {
                  onReact(emoji);
                  setShowPicker(false);
                }}
                aria-label={`React with ${emoji}`}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
