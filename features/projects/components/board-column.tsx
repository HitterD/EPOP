'use client'

import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { TaskCardDraggable } from './task-card-draggable'
import { Task, Bucket } from '@/types'
import { Plus, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface BoardColumnProps {
  bucket: Bucket
  tasks: Task[]
  onAddTask?: () => void
  onEditTask?: (task: Task) => void
  onEditBucket?: () => void
  onDeleteBucket?: () => void
  isDragging?: boolean
}

export function BoardColumn({
  bucket,
  tasks,
  onAddTask,
  onEditTask,
  onEditBucket,
  onDeleteBucket,
  isDragging,
}: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: bucket.id,
  })

  const taskIds = tasks.map((task) => task.id)

  // Calculate bucket stats
  const completedTasks = tasks.filter((t) => t.status === 'done').length
  const totalTasks = tasks.length

  // Bucket color variants
  const colorClasses = {
    gray: 'bg-gray-100 dark:bg-gray-800 border-gray-300',
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-300',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-300',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-300',
  }

  const bucketColor = (bucket.color as keyof typeof colorClasses) || 'gray'

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex-shrink-0 w-80 h-full flex flex-col rounded-lg border-2 transition-all',
        colorClasses[bucketColor],
        isOver && 'ring-2 ring-primary-500 ring-offset-2 shadow-lg scale-[1.02]',
        isDragging && 'opacity-50'
      )}
    >
      {/* Column header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{bucket.name}</h3>
          <Badge variant="secondary" className="text-xs">
            {totalTasks}
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          {/* Add task button */}
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={onAddTask}
          >
            <Plus size={16} />
          </Button>

          {/* Bucket menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEditBucket}>
                Edit column
              </DropdownMenuItem>
              <DropdownMenuItem>
                Set color
              </DropdownMenuItem>
              <DropdownMenuItem>
                Sort tasks
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDeleteBucket}
                className="text-error"
              >
                Delete column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Progress bar */}
      {totalTasks > 0 && (
        <div className="px-4 py-2">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{Math.round((completedTasks / totalTasks) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 transition-all duration-300"
              style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Tasks list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[200px]">
        <SortableContext
          items={taskIds}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="text-gray-400 dark:text-gray-600 mb-2">
                <Plus size={32} />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                No tasks yet
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={onAddTask}
              >
                Add first task
              </Button>
            </div>
          ) : (
            // Tasks
            tasks.map((task) => (
              <TaskCardDraggable
                key={task.id}
                task={task}
                onEdit={() => onEditTask?.(task)}
              />
            ))
          )}
        </SortableContext>
      </div>

      {/* Add task at bottom */}
      {tasks.length > 0 && (
        <div className="p-2 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-gray-600 dark:text-gray-400"
            onClick={onAddTask}
          >
            <Plus size={14} className="mr-2" />
            Add task
          </Button>
        </div>
      )}
    </div>
  )
}
