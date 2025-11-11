/**
 * Virtualized Gantt Columns
 * 
 * Column virtualization for Gantt chart using @tanstack/react-virtual
 * Handles day/week/month scales with snap rules
 */

import React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@/lib/utils';
import type { TimeScale } from '@/lib/projects/timezone';
import { getTimelineHeaders, snapToGrid } from '@/lib/projects/timezone';

export interface VirtualizedGanttColumnsProps {
  startDate: Date;
  endDate: Date;
  scale: TimeScale;
  timezone: string;
  columnWidth: number; // pixels per day/week/month
  children: (visibleRange: { start: Date; end: Date }) => React.ReactNode;
  className?: string;
}

export function VirtualizedGanttColumns({
  startDate,
  endDate,
  scale,
  timezone,
  columnWidth,
  children,
  className,
}: VirtualizedGanttColumnsProps) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  // Generate timeline headers
  const headers = React.useMemo(
    () => getTimelineHeaders(startDate, endDate, scale, timezone),
    [startDate, endDate, scale, timezone]
  );

  // Setup virtualizer
  const columnVirtualizer = useVirtualizer({
    count: headers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => columnWidth,
    horizontal: true,
    overscan: 3, // Render 3 extra columns on each side
  });

  const virtualColumns = columnVirtualizer.getVirtualItems();

  // Calculate visible date range
  const visibleRange = React.useMemo(() => {
    if (virtualColumns.length === 0) {
      return { start: startDate, end: endDate };
    }

    const firstVisible = headers[virtualColumns[0].index];
    const lastVisible = headers[virtualColumns[virtualColumns.length - 1].index];

    return {
      start: firstVisible?.date || startDate,
      end: lastVisible?.date || endDate,
    };
  }, [virtualColumns, headers, startDate, endDate]);

  return (
    <div
      ref={parentRef}
      className={cn('overflow-x-auto relative', className)}
      style={{ height: '100%' }}
    >
      {/* Virtual container */}
      <div
        style={{
          width: `${columnVirtualizer.getTotalSize()}px`,
          height: '100%',
          position: 'relative',
        }}
      >
        {/* Column headers */}
        <div className="sticky top-0 z-20 bg-background border-b">
          {virtualColumns.map((virtualColumn) => {
            const header = headers[virtualColumn.index];
            return (
              <div
                key={virtualColumn.key}
                className="absolute top-0 left-0 h-12 flex items-center justify-center border-r text-xs font-medium"
                style={{
                  width: `${virtualColumn.size}px`,
                  transform: `translateX(${virtualColumn.start}px)`,
                }}
              >
                {header.label}
              </div>
            );
          })}
        </div>

        {/* Grid lines */}
        <div className="absolute inset-0 pointer-events-none">
          {virtualColumns.map((virtualColumn) => (
            <div
              key={`grid-${virtualColumn.key}`}
              className="absolute top-0 bottom-0 border-r border-border/50"
              style={{
                left: `${virtualColumn.start}px`,
              }}
            />
          ))}
        </div>

        {/* Task rows (rendered by children) */}
        <div className="relative pt-12">
          {children(visibleRange)}
        </div>
      </div>
    </div>
  );
}

/**
 * Snap helper for drag operations
 */
export function useGanttSnap(
  scale: TimeScale,
  columnWidth: number
) {
  const snapToColumn = React.useCallback(
    (pixelX: number) => {
      // Calculate which column this pixel falls into
      const columnIndex = Math.round(pixelX / columnWidth);
      return columnIndex * columnWidth;
    },
    [columnWidth]
  );

  const snapDate = React.useCallback(
    (date: Date) => {
      return snapToGrid(date, scale);
    },
    [scale]
  );

  return {
    snapToColumn,
    snapDate,
  };
}

/**
 * Hook for Gantt virtualization
 */
export function useGanttVirtualization(
  tasks: Array<{ id: string; startDate: Date; endDate: Date }>,
  viewportStartDate: Date,
  scale: TimeScale,
  timezone: string,
  columnWidth: number = 40
) {
  const [visibleRange, setVisibleRange] = React.useState({
    start: viewportStartDate,
    end: new Date(viewportStartDate.getTime() + 30 * 24 * 60 * 60 * 1000), // +30 days
  });

  // Filter tasks that are visible in the current range
  const visibleTasks = React.useMemo(() => {
    return tasks.filter((task) => {
      // Task overlaps with visible range
      return (
        task.endDate >= visibleRange.start &&
        task.startDate <= visibleRange.end
      );
    });
  }, [tasks, visibleRange]);

  const updateVisibleRange = React.useCallback(
    (range: { start: Date; end: Date }) => {
      setVisibleRange(range);
    },
    []
  );

  return {
    visibleTasks,
    visibleRange,
    updateVisibleRange,
  };
}

/**
 * Example usage component
 */
export function GanttChartVirtualized({
  tasks,
  startDate,
  endDate,
  scale = 'week',
  timezone = 'UTC',
}: {
  tasks: Array<{
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
  }>;
  startDate: Date;
  endDate: Date;
  scale?: TimeScale;
  timezone?: string;
}) {
  const columnWidth = scale === 'day' ? 40 : scale === 'week' ? 120 : 200;

  const { visibleTasks, updateVisibleRange } = useGanttVirtualization(
    tasks,
    startDate,
    scale,
    timezone,
    columnWidth
  );

  return (
    <VirtualizedGanttColumns
      startDate={startDate}
      endDate={endDate}
      scale={scale}
      timezone={timezone}
      columnWidth={columnWidth}
      className="h-[600px]"
    >
      {(visibleRange) => {
        updateVisibleRange(visibleRange);

        return (
          <div className="space-y-1">
            {visibleTasks.map((task, index) => (
              <GanttTaskRow
                key={task.id}
                task={task}
                viewportStart={startDate}
                scale={scale}
                timezone={timezone}
                columnWidth={columnWidth}
                rowIndex={index}
              />
            ))}
          </div>
        );
      }}
    </VirtualizedGanttColumns>
  );
}

/**
 * Individual task row
 */
function GanttTaskRow({
  task,
  viewportStart,
  scale,
  timezone,
  columnWidth,
  rowIndex,
}: {
  task: { id: string; name: string; startDate: Date; endDate: Date };
  viewportStart: Date;
  scale: TimeScale;
  timezone: string;
  columnWidth: number;
  rowIndex: number;
}) {
  const { utcDateSpanToPx } = require('@/lib/projects/timezone');

  const position = utcDateSpanToPx(
    task.startDate,
    task.endDate,
    scale,
    timezone,
    viewportStart,
    columnWidth
  );

  return (
    <div
      className="relative h-10 flex items-center"
      style={{ top: rowIndex * 44 }}
    >
      <div
        className="absolute bg-primary/90 hover:bg-primary rounded px-2 py-1 text-xs text-primary-foreground truncate cursor-pointer transition-colors"
        style={{
          left: position.left,
          width: position.width,
        }}
        title={task.name}
      >
        {task.name}
      </div>
    </div>
  );
}
