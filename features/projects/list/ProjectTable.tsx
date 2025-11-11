import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task, ProjectTableProps } from '@/types/projects';
import { format } from 'date-fns';

export function ProjectTable({ tasks, onSort, onFilter, onTaskClick }: ProjectTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns = useMemo<ColumnDef<Task>[]>(
    () => [
      {
        accessorKey: 'title',
        header: ({ column }) => (
          <button
            className="flex items-center gap-2"
            onClick={() => column.toggleSorting()}
          >
            Title
            <ArrowUpDown className="h-4 w-4" />
          </button>
        ),
        cell: ({ row }) => (
          <div className="font-medium">{row.original.title}</div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const statusColors = {
            todo: 'bg-gray-500',
            'in-progress': 'bg-blue-500',
            review: 'bg-yellow-500',
            done: 'bg-green-500',
          };
          return (
            <Badge className={cn('capitalize', statusColors[row.original.status])}>
              {row.original.status}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">
            {row.original.priority}
          </Badge>
        ),
      },
      {
        accessorKey: 'assignees',
        header: 'Assignees',
        cell: ({ row }) => (
          <div className="flex -space-x-2">
            {row.original.assignees.map((assignee) => (
              <Avatar key={assignee.id} className="h-6 w-6 border-2 border-background">
                <AvatarImage src={assignee.avatarUrl} />
                <AvatarFallback className="text-xs">
                  {assignee.name.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        ),
      },
      {
        accessorKey: 'dueDate',
        header: 'Due Date',
        cell: ({ row }) => format(row.original.dueDate, 'MMM d, yyyy'),
      },
      {
        accessorKey: 'progress',
        header: 'Progress',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${row.original.progress}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{row.original.progress}%</span>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: tasks,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const { rows } = table.getRowModel();
  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 10,
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto border rounded-lg">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            return (
              <TableRow
                key={row.id}
                className="cursor-pointer hover:bg-accent absolute w-full"
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                onClick={() => onTaskClick(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
