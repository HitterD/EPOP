import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task } from '@/types/projects';

interface KanbanCardProps {
  task: Task;
  isDragging?: boolean;
  onClick: () => void;
}

export function KanbanCard({ task, isDragging, onClick }: KanbanCardProps) {
  const priorityColors = {
    low: 'bg-blue-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    critical: 'bg-red-500',
  };

  return (
    <Card
      className={cn(
        'p-3 cursor-pointer hover:shadow-md transition-shadow',
        isDragging && 'opacity-50 rotate-2 scale-105'
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="space-y-2">
        {/* Priority indicator */}
        <div className="flex items-center gap-2">
          <div className={cn('h-1 w-8 rounded', priorityColors[task.priority])} />
          <span className="text-xs text-muted-foreground uppercase">{task.priority}</span>
        </div>

        {/* Title */}
        <h4 className="font-medium line-clamp-2">{task.title}</h4>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          {/* Assignees */}
          <div className="flex -space-x-2">
            {task.assignees.map((assignee) => (
              <Avatar key={assignee.id} className="h-6 w-6 border-2 border-background">
                <AvatarImage src={assignee.avatarUrl} />
                <AvatarFallback className="text-xs">
                  {assignee.name.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>

          {/* Meta */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {task.estimatedHours && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {task.estimatedHours}h
              </span>
            )}
          </div>
        </div>

        {/* Progress */}
        {task.progress > 0 && (
          <div className="w-full bg-muted rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
