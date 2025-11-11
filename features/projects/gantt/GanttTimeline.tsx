import React, { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';
import type { GanttZoomLevel, Task } from '@/types/projects';

interface GanttTimelineProps {
  zoom: GanttZoomLevel;
  tasks: Task[];
}

export function GanttTimeline({ zoom, tasks }: GanttTimelineProps) {
  const timeline = useMemo(() => {
    if (tasks.length === 0) return [];

    const allDates = tasks.flatMap((t) => [t.startDate, t.dueDate]);
    const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));

    if (zoom === 'day') {
      return eachDayOfInterval({ start: minDate, end: maxDate }).map((date) => ({
        date,
        label: format(date, 'MMM d'),
      }));
    } else if (zoom === 'week') {
      return eachWeekOfInterval({ start: minDate, end: maxDate }).map((date) => ({
        date,
        label: format(date, 'MMM d'),
      }));
    } else {
      return eachMonthOfInterval({ start: minDate, end: maxDate }).map((date) => ({
        date,
        label: format(date, 'MMM yyyy'),
      }));
    }
  }, [zoom, tasks]);

  const cellWidth = zoom === 'day' ? 60 : zoom === 'week' ? 100 : 150;

  return (
    <div className="flex border-b sticky top-0 bg-background z-10">
      <div className="w-48 flex-shrink-0 p-2 border-r font-semibold">Task</div>
      <div className="flex">
        {timeline.map((item, i) => (
          <div
            key={i}
            className="border-r p-2 text-xs text-center"
            style={{ minWidth: cellWidth }}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
