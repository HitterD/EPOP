import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { KanbanLane } from './KanbanLane';
import type { KanbanBoardProps, Task } from '@/types/projects';

export function KanbanBoard({ lanes, onMove, onTaskClick }: KanbanBoardProps) {
  return (
    <ScrollArea className="w-full">
      <div
        role="group"
        aria-label="Kanban board"
        className="flex gap-4 p-4 min-h-[600px]"
      >
        {lanes.map((lane) => (
          <KanbanLane
            key={lane.id}
            lane={lane}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
