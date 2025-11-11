import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { GanttTimeline } from './GanttTimeline';
import { GanttBars } from './GanttBars';
import type { GanttChartProps, GanttZoomLevel } from '@/types/projects';

const ZOOM_LEVELS: GanttZoomLevel[] = ['day', 'week', 'month'];

export function GanttChart({ tasks, zoom, onZoomChange, onTaskClick }: GanttChartProps) {
  const handleZoomIn = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoom);
    if (currentIndex > 0) {
      onZoomChange(ZOOM_LEVELS[currentIndex - 1]);
    }
  };

  const handleZoomOut = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoom);
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      onZoomChange(ZOOM_LEVELS[currentIndex + 1]);
    }
  };

  return (
    <div className="flex flex-col h-full border rounded-lg">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold">Gantt Chart</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Zoom: {zoom}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom === 'day'}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom === 'month'}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Gantt Grid */}
      <ScrollArea className="flex-1">
        <div className="relative min-h-[600px] p-4">
          <GanttTimeline zoom={zoom} tasks={tasks} />
          <GanttBars tasks={tasks} zoom={zoom} onTaskClick={onTaskClick} />
        </div>
      </ScrollArea>
    </div>
  );
}
