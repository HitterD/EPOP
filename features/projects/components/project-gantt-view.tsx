'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { AlertCircle } from 'lucide-react'
import { Task } from '@/types'
import { cn } from '@/lib/utils'
import { format, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, addMonths } from 'date-fns'

interface ProjectGanttViewProps {
  projectId: string
  tasks: Task[]
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>
  isLoading?: boolean
  error?: Error | null
  className?: string
}

export function ProjectGanttView({
  projectId,
  tasks,
  onTaskUpdate,
  isLoading = false,
  error = null,
  className,
}: ProjectGanttViewProps) {
  // Calculate timeline range
  const timelineData = useMemo(() => {
    const tasksWithDates = tasks.filter(t => t.startDate && t.dueDate)
    if (tasksWithDates.length === 0) return null

    const dates = tasksWithDates.flatMap(t => [
      new Date(t.startDate!),
      new Date(t.dueDate!)
    ])
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))

    const start = startOfMonth(minDate)
    const end = endOfMonth(addMonths(maxDate, 1))
    const totalDays = differenceInDays(end, start)

    return {
      start,
      end,
      totalDays,
      tasks: tasksWithDates.map(task => {
        const taskStart = new Date(task.startDate!)
        const taskEnd = new Date(task.dueDate!)
        const daysSinceStart = differenceInDays(taskStart, start)
        const duration = differenceInDays(taskEnd, taskStart) + 1
        const leftPercent = (daysSinceStart / totalDays) * 100
        const widthPercent = (duration / totalDays) * 100

        return {
          ...task,
          leftPercent,
          widthPercent,
          isOverdue: taskEnd < new Date() && task.progress < 100,
        }
      })
    }
  }, [tasks])

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[600px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!tasks || tasks.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No tasks to display in timeline view</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gantt Chart</CardTitle>
            <CardDescription>
              Visualize project timeline with drag-and-drop task management
            </CardDescription>
          </div>
        </div>

      </CardHeader>

      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold">{tasks.length}</div>
            <div className="text-xs text-muted-foreground">Total Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {tasks.filter(t => t.progress === 100).length}
            </div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {tasks.filter(t => t.progress > 0 && t.progress < 100).length}
            </div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length}
            </div>
            <div className="text-xs text-muted-foreground">Overdue</div>
          </div>
        </div>

        {/* Timeline View */}
        {timelineData ? (
          <div className="border rounded-lg overflow-auto bg-background">
            {/* Timeline Header */}
            <div className="bg-muted/30 border-b px-4 py-2 text-xs font-medium">
              {format(timelineData.start, 'MMM yyyy')} - {format(timelineData.end, 'MMM yyyy')}
            </div>

            {/* Timeline Grid */}
            <div className="relative" style={{ minHeight: `${timelineData.tasks.length * 50 + 40}px` }}>
              {/* Tasks */}
              {timelineData.tasks.map((task, index) => (
                <div key={task.id} className="relative border-b" style={{ height: '50px' }}>
                  {/* Task Name */}
                  <div className="absolute left-0 w-48 h-full flex items-center px-4 bg-background border-r truncate text-sm">
                    {task.title}
                  </div>

                  {/* Task Bar */}
                  <div
                    className="absolute h-8 top-2.5 rounded flex items-center px-2 text-xs text-white font-medium shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                    style={{
                      left: `calc(12rem + ${task.leftPercent}%)`,
                      width: `${task.widthPercent}%`,
                      minWidth: '40px',
                      backgroundColor: task.isOverdue
                        ? '#ef4444'
                        : task.progress === 100
                        ? '#10b981'
                        : '#3b82f6',
                    }}
                    title={`${task.title}\n${format(new Date(task.startDate!), 'PP')} - ${format(new Date(task.dueDate!), 'PP')}\nProgress: ${task.progress}%`}
                  >
                    <div className="truncate">{task.progress}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="border rounded-lg p-12 text-center text-muted-foreground">
            No tasks with dates to display in timeline view
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Critical Path</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span>Overdue</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 p-3 bg-muted/30 rounded-lg text-sm">
          <p className="font-medium mb-2">How to use:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Drag task bars to move dates</li>
            <li>Drag edges to resize duration</li>
            <li>Click on tasks to view details</li>
            <li>Use zoom controls for different views</li>
            <li>Enable Critical Path to highlight dependencies</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
