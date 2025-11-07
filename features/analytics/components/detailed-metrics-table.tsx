'use client'

import { useMemo, useRef } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
  SortingState,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { formatDate } from '@/lib/utils'

interface UserMetric {
  id: string
  userName: string
  email: string
  messageCount: number
  taskCount: number
  avgResponseTime: number // in hours
  lastActive: string
  status: 'active' | 'away' | 'offline'
}

// Mock data generator
function generateMockData(count: number = 100): UserMetric[] {
  const statuses: UserMetric['status'][] = ['active', 'away', 'offline']
  const names = ['Alice Johnson', 'Bob Smith', 'Carol White', 'David Brown', 'Eve Davis', 'Frank Wilson', 'Grace Lee', 'Henry Taylor']
  
  return Array.from({ length: count }, (_, i) => ({
    id: `user-${i}`,
    userName: names[i % names.length] + ` ${Math.floor(i / names.length) + 1}`,
    email: `user${i}@epop.com`,
    messageCount: Math.floor(Math.random() * 500) + 50,
    taskCount: Math.floor(Math.random() * 50) + 5,
    avgResponseTime: Math.random() * 8 + 0.5,
    lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: (statuses[Math.floor(Math.random() * statuses.length)] ?? 'active'),
  }))
}

export function DetailedMetricsTable() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const data = useMemo(() => generateMockData(100), [])

  const columns = useMemo<ColumnDef<UserMetric>[]>(
    () => [
      {
        accessorKey: 'userName',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4"
            >
              User
              {column.getIsSorted() === 'asc' ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === 'desc' ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          )
        },
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.userName}</span>
            <span className="text-xs text-muted-foreground">{row.original.email}</span>
          </div>
        ),
      },
      {
        accessorKey: 'messageCount',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4"
            >
              Messages
              {column.getIsSorted() === 'asc' ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === 'desc' ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          )
        },
        cell: ({ row }) => (
          <span className="font-mono">{row.original.messageCount.toLocaleString()}</span>
        ),
      },
      {
        accessorKey: 'taskCount',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4"
            >
              Tasks
              {column.getIsSorted() === 'asc' ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === 'desc' ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          )
        },
        cell: ({ row }) => (
          <span className="font-mono">{row.original.taskCount}</span>
        ),
      },
      {
        accessorKey: 'avgResponseTime',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4"
            >
              Avg Response
              {column.getIsSorted() === 'asc' ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === 'desc' ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          )
        },
        cell: ({ row }) => (
          <span className="font-mono">{row.original.avgResponseTime.toFixed(1)}h</span>
        ),
      },
      {
        accessorKey: 'lastActive',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4"
            >
              Last Active
              {column.getIsSorted() === 'asc' ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === 'desc' ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          )
        },
        cell: ({ row }) => (
          <span className="text-sm">{formatDate(row.original.lastActive, 'relative')}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status
          return (
            <Badge
              variant={
                status === 'active' ? 'default' : status === 'away' ? 'secondary' : 'outline'
              }
              className="capitalize"
            >
              {status}
            </Badge>
          )
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const { rows } = table.getRowModel()

  // Virtualization
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 10,
  })

  return (
    <div className="space-y-4">
      {/* Search */}
      <Input
        placeholder="Search users..."
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-sm"
      />

      {/* Table */}
      <div className="rounded-md border">
        <div className="overflow-hidden">
          {/* Header */}
          <div className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <div key={headerGroup.id} className="flex border-b">
                {headerGroup.headers.map((header) => (
                  <div
                    key={header.id}
                    className="flex-1 p-4 text-left text-sm font-medium"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Body (Virtualized) */}
          <div ref={parentRef} className="h-[400px] overflow-auto">
            <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const row = rows[virtualRow.index]
                if (!row) return null
                return (
                  <div
                    key={row.id}
                    className="absolute left-0 right-0 flex border-b transition-colors hover:bg-muted/50"
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <div key={cell.id} className="flex flex-1 items-center p-4 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {rows.length} of {data.length} users
        </div>
        <div>Virtualized for optimal performance</div>
      </div>
    </div>
  )
}
