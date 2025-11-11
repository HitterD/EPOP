import React, { useMemo } from 'react';
import { differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import type { GanttZoomLevel, Task } from '@/types/projects';

interface GanttBarsProps {
  tasks: Task[];
  zoom: GanttZoomLevel;
  onTaskClick: (task: Task) => void;
}

export function GanttBars({ tasks, zoom, onTaskClick }: GanttBarsProps) {
  const bars = useMemo(() => {
    if (tasks.length === 0) return [];

    const allDates = tasks.flatMap((t) => [t.startDate, t.dueDate]);
    const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
    const cellWidth = zoom === 'day' ? 60 : zoom === 'week' ? 100 : 150;

    return tasks.map((task, index) => {
      const startOffset = differenceInDays(task.startDate, minDate);
      const duration = differenceInDays(task.dueDate, task.startDate) + 1;
      
      return {
        task,
        x: startOffset * cellWidth,
        width: duration * cellWidth,
        y: index * 48,
      };
    });
  }, [tasks, zoom]);

  const priorityColors = {
    low: 'bg-blue-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    critical: 'bg-red-500',
  };

  return (
    <div className="relative" style={{ paddingTop: 48 }}>
      {bars.map(({ task, x, width, y }) => (
        <div
          key={task.id}
          className="absolute flex items-center"
          style={{ left: 192, top: y + 48, height: 40 }}
        >
          <div className="w-48 flex-shrink-0 pr-4 text-sm truncate">{task.title}</div>
          <button
            className={cn(
              'h-8 rounded transition-all hover:scale-105 relative overflow-hidden',
              priorityColors[task.priority]
            )}
            style={{ width, marginLeft: x }}
            onClick={() => onTaskClick(task)}
          >
            <div
              className="absolute top-0 left-0 h-full bg-white/20"
              style={{ width: `${task.progress}%` }}
            />
            <span className="relative z-10 text-xs text-white px-2 truncate">
              {task.title}
            </span>
          </button>
        </div>
      ))}
    </div>
  );
}
