import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { KanbanCard } from './KanbanCard';
import { cn } from '@/lib/utils';
import type { KanbanLane as KanbanLaneType, Task } from '@/types/projects';

interface KanbanLaneProps {
  lane: KanbanLaneType;
  onTaskClick: (task: Task) => void;
  onDrop?: (taskId: string) => void;
}

export function KanbanLane({ lane, onTaskClick, onDrop }: KanbanLaneProps) {
  const isOverWipLimit = lane.wipLimit && lane.tasks.length > lane.wipLimit;

  return (
    <div
      className={cn(
        'flex flex-col bg-muted/50 rounded-lg border min-w-[280px] max-w-[320px]',
        isOverWipLimit && 'border-destructive'
      )}
      role="region"
      aria-label={`${lane.title} lane`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{lane.title}</h3>
          <Badge variant="secondary" className="rounded-full">
            {lane.tasks.length}
          </Badge>
        </div>
        {lane.wipLimit && (
          <Badge
            variant={isOverWipLimit ? 'destructive' : 'outline'}
            className="text-xs"
          >
            WIP: {lane.tasks.length}/{lane.wipLimit}
          </Badge>
        )}
      </div>

      {/* Cards */}
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-3">
          {lane.tasks.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              No tasks
            </div>
          ) : (
            lane.tasks.map((task) => (
              <KanbanCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick(task)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
