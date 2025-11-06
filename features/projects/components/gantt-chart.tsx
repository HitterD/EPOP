'use client'

/**
 * FE-UX-1: Gantt Chart Component
 * Self-hosted Gantt chart for project task visualization
 * Works with current task structure, ready for dependencies API enhancement
 */

import { useMemo, useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, differenceInDays, parseISO, isWithinInterval } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar, ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Task } from '@/types'

interface GanttChartProps {
  tasks: Task[]
  onTaskClick?: (task: Task) => void
  className?: string
}

type ViewMode = 'day' | 'week' | 'month'

export function GanttChart({ tasks, onTaskClick, className }: GanttChartProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('week')

  // Filter tasks with valid dates
  const validTasks = useMemo(() => {
    return tasks.filter(task => task.startDate && task.dueDate)
  }, [tasks])

  // Calculate date range
  const dateRange = useMemo(() => {
    const start = startOfMonth(subMonths(currentDate, 1))
    const end = endOfMonth(addMonths(currentDate, 2))
    return { start, end }
  }, [currentDate])

  // Generate days for the timeline
  const days = useMemo(() => {
    return eachDayOfInterval(dateRange)
  }, [dateRange])

  // Calculate task positions
  const getTaskPosition = (task: Task) => {
    if (!task.startDate || !task.dueDate) return null

    const taskStart = parseISO(task.startDate)
    const taskEnd = parseISO(task.dueDate)
    
    const startOffset = differenceInDays(taskStart, dateRange.start)
    const duration = differenceInDays(taskEnd, taskStart) + 1
    
    return {
      left: `${(startOffset / days.length) * 100}%`,
      width: `${(duration / days.length) * 100}%`,
    }
  }

  // Get task color based on status
  const getTaskColor = (task: Task) => {
    const colors = {
      todo: 'bg-gray-400',
      in_progress: 'bg-blue-500',
      review: 'bg-yellow-500',
      done: 'bg-green-500',
    }
    return colors[task.status] || colors.todo
  }

  // Navigate timeline
  const handlePrevMonth = () => setCurrentDate(prev => subMonths(prev, 1))
  const handleNextMonth = () => setCurrentDate(prev => addMonths(prev, 1))
  const handleToday = () => setCurrentDate(new Date())

  return (
    <div className={cn('flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg border', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday}>
            <Calendar className="h-4 w-4 mr-2" />
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <div className="text-sm font-medium ml-4">
            {format(currentDate, 'MMMM yyyy')}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded p-1">
            <Button
              variant={viewMode === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('day')}
              className="h-7 px-2 text-xs"
            >
              Day
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('week')}
              className="h-7 px-2 text-xs"
            >
              Week
            </Button>
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('month')}
              className="h-7 px-2 text-xs"
            >
              Month
            </Button>
          </div>
        </div>
      </div>

      {/* Gantt Grid */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[1200px]">
          {/* Timeline Header */}
          <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 border-b">
            <div className="flex">
              {/* Task column header */}
              <div className="w-64 flex-shrink-0 p-3 border-r font-medium text-sm">
                Task
              </div>
              
              {/* Date columns */}
              <div className="flex-1 flex">
                {days.map((day, index) => {
                  const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6
                  
                  return (
                    <div
                      key={index}
                      className={cn(
                        'flex-1 min-w-[40px] p-2 border-r text-center text-xs',
                        isToday && 'bg-blue-50 dark:bg-blue-950/20',
                        isWeekend && 'bg-gray-100 dark:bg-gray-900'
                      )}
                    >
                      <div className="font-medium">{format(day, 'd')}</div>
                      <div className="text-gray-500 dark:text-gray-400">{format(day, 'EEE')}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Task Rows */}
          <div className="relative">
            {validTasks.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No tasks with dates</p>
                  <p className="text-sm mt-1">Add start and due dates to tasks to see them here</p>
                </div>
              </div>
            ) : (
              validTasks.map((task, taskIndex) => {
                const position = getTaskPosition(task)
                if (!position) return null

                return (
                  <div key={task.id} className="flex border-b hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    {/* Task info */}
                    <div className="w-64 flex-shrink-0 p-3 border-r">
                      <div className="text-sm font-medium truncate">{task.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn('px-2 py-0.5 rounded text-xs', getTaskColor(task), 'text-white')}>
                          {task.status.replace('_', ' ')}
                        </span>
                        {task.assignees && task.assignees.length > 0 && (
                          <span className="text-xs text-gray-500">
                            {task.assignees.length} assigned
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Timeline bar */}
                    <div className="flex-1 relative" style={{ minHeight: '60px' }}>
                      {/* Background grid */}
                      <div className="absolute inset-0 flex">
                        {days.map((day, index) => {
                          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                          const isWeekend = day.getDay() === 0 || day.getDay() === 6
                          
                          return (
                            <div
                              key={index}
                              className={cn(
                                'flex-1 min-w-[40px] border-r',
                                isToday && 'bg-blue-50/50 dark:bg-blue-950/10',
                                isWeekend && 'bg-gray-50 dark:bg-gray-900/50'
                              )}
                            />
                          )
                        })}
                      </div>

                      {/* Task bar */}
                      <div
                        className={cn(
                          'absolute top-1/2 -translate-y-1/2 h-8 rounded cursor-pointer transition-all hover:opacity-80',
                          getTaskColor(task)
                        )}
                        style={{
                          left: position.left,
                          width: position.width,
                          minWidth: '60px',
                        }}
                        onClick={() => onTaskClick?.(task)}
                        title={`${task.title}\n${task.startDate} - ${task.dueDate}`}
                      >
                        <div className="flex items-center justify-between h-full px-2 text-white text-xs">
                          <span className="truncate">{task.title}</span>
                          {task.progress > 0 && (
                            <span className="ml-2 bg-white/20 px-1.5 rounded">{task.progress}%</span>
                          )}
                        </div>
                        
                        {/* Progress bar */}
                        {task.progress > 0 && (
                          <div className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b">
                            <div
                              className="h-full bg-white/60 rounded-b"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Today indicator line */}
                      {(() => {
                        const today = new Date()
                        if (isWithinInterval(today, dateRange)) {
                          const todayOffset = differenceInDays(today, dateRange.start)
                          const todayPosition = `${(todayOffset / days.length) * 100}%`
                          
                          return (
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10"
                              style={{ left: todayPosition }}
                            />
                          )
                        }
                        return null
                      })()}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="border-t p-3 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-400" />
            <span>To Do</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500" />
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500" />
            <span>Review</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span>Done</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <div className="w-0.5 h-4 bg-blue-500" />
            <span className="text-gray-600 dark:text-gray-400">Today</span>
          </div>
        </div>
      </div>
    </div>
  )
}
