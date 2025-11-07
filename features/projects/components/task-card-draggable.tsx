'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task } from '@/types'
import {
  Calendar,
  Paperclip,
  MessageSquare,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  MoreVertical,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatDate } from 'date-fns'

interface TaskCardDraggableProps {
  task: Task
  onEdit?: () => void
  onDelete?: () => void
  isDragging?: boolean
}

export function TaskCardDraggable({
  task,
  onEdit,
  onDelete,
  isDragging: isDraggingProp,
}: TaskCardDraggableProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Priority styling
  const priorityConfig = {
    low: {
      icon: null,
      color: 'bg-gray-100 text-gray-700 border-gray-300',
    },
    medium: {
      icon: <Clock size={12} />,
      color: 'bg-blue-100 text-blue-700 border-blue-300',
    },
    high: {
      icon: <AlertCircle size={12} />,
      color: 'bg-orange-100 text-orange-700 border-orange-300',
    },
    critical: {
      icon: <AlertCircle size={12} />,
      color: 'bg-red-100 text-red-700 border-red-300',
    },
  }

  const priority = (task.priority as keyof typeof priorityConfig) || 'low'
  const priorityStyle = priorityConfig[priority]

  // Check if overdue
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date()

  // Progress percentage
  const progress = task.progress || 0

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'group relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing',
        (isDragging || isDraggingProp) && 'opacity-50 rotate-2 shadow-xl scale-105 ring-2 ring-primary-500',
        isOverdue && 'border-error/50'
      )}
      onClick={(e) => {
        // Allow clicking the card to edit (but not when dragging)
        if (!isDragging && e.target === e.currentTarget) {
          onEdit?.()
        }
      }}
    >
      {/* Priority indicator */}
      {priority !== 'low' && (
        <div className={cn(
          'absolute top-0 left-0 w-1 h-full rounded-l-lg',
          priority === 'high' && 'bg-orange-500',
          priority === 'critical' && 'bg-red-500',
          priority === 'medium' && 'bg-blue-500'
        )} />
      )}

      {/* Card header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-sm line-clamp-2 flex-1">
          {task.title}
        </h4>

        {/* Actions menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical size={12} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              Edit task
            </DropdownMenuItem>
            <DropdownMenuItem>
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem>
              Move to...
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-error">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
          {task.description}
        </p>
      )}

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.labels.slice(0, 3).map((label) => (
            <Badge
              key={label.id}
              variant="outline"
              className="text-[10px] px-1.5 py-0"
              style={{
                borderColor: label.color,
                color: label.color,
              }}
            >
              {label.name}
            </Badge>
          ))}
          {task.labels.length > 3 && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              +{task.labels.length - 3}
            </Badge>
          )}
        </div>
      )}

      {/* Progress bar */}
      {progress > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-[10px] text-gray-600 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-300',
                progress === 100 ? 'bg-green-500' : 'bg-primary-500'
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer metadata */}
      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
        {/* Left side: Due date, attachments, comments */}
        <div className="flex items-center gap-2">
          {/* Due date */}
          {task.dueDate && (
            <div
              className={cn(
                'flex items-center gap-1',
                isOverdue && 'text-error font-medium'
              )}
            >
              <Calendar size={12} />
              <span>
                {formatDate(new Date(task.dueDate), 'MMM d')}
              </span>
            </div>
          )}

          {/* Attachments */}
          {task.attachmentCount !== undefined && task.attachmentCount > 0 && (
            <div className="flex items-center gap-1">
              <Paperclip size={12} />
              <span>{task.attachmentCount}</span>
            </div>
          )}

          {/* Comments */}
          {task.commentCount !== undefined && task.commentCount > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare size={12} />
              <span>{task.commentCount}</span>
            </div>
          )}

          {/* Status icon */}
          {task.status === 'done' && (
            <CheckCircle size={12} className="text-green-500" />
          )}
        </div>

        {/* Right side: Assignees */}
        {task.assignees && task.assignees.length > 0 && (
          <div className="flex -space-x-2">
            {task.assignees.slice(0, 3).map((assignee, idx) => (
              <Avatar
                key={assignee.id}
                src={assignee.avatar ?? ''}
                alt={assignee.name}
                size="xs"
                fallback={assignee.name?.[0] ?? '?'}
                className="ring-2 ring-white dark:ring-gray-800"
              />
            ))}
            {task.assignees.length > 3 && (
              <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-medium ring-2 ring-white dark:ring-gray-800">
                +{task.assignees.length - 3}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Priority badge (bottom right corner) */}
      {priority !== 'low' && (
        <div className="absolute bottom-2 right-2">
          <Badge
            variant="outline"
            className={cn(
              'text-[10px] px-1.5 py-0 gap-1',
              priorityStyle.color
            )}
          >
            {priorityStyle.icon}
            {priority}
          </Badge>
        </div>
      )}
    </div>
  )
}
