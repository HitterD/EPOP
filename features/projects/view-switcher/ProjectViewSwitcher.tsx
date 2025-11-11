import React from 'react';
import { Button } from '@/components/ui/button';
import { LayoutGrid, GanttChart, Table } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProjectViewSwitcherProps, ProjectViewMode } from '@/types/projects';

const views: { value: ProjectViewMode; label: string; icon: React.ReactNode }[] = [
  { value: 'kanban', label: 'Kanban', icon: <LayoutGrid className="h-4 w-4" /> },
  { value: 'gantt', label: 'Gantt', icon: <GanttChart className="h-4 w-4" /> },
  { value: 'table', label: 'Table', icon: <Table className="h-4 w-4" /> },
];

export function ProjectViewSwitcher({ view, onViewChange }: ProjectViewSwitcherProps) {
  return (
    <div
      role="tablist"
      aria-label="Project view"
      className="inline-flex items-center rounded-lg border p-1 bg-muted"
    >
      {views.map((v) => (
        <Button
          key={v.value}
          role="tab"
          aria-selected={view === v.value}
          variant={view === v.value ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onViewChange(v.value)}
          className={cn('gap-2', view === v.value && 'bg-background shadow-sm')}
        >
          {v.icon}
          {v.label}
        </Button>
      ))}
    </div>
  );
}
