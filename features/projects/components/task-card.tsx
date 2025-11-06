'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn, getPriorityColor } from '@/lib/utils'
import { Calendar, MessageSquare, Paperclip, CheckSquare } from 'lucide-react'
import { formatInUserTimezone } from '@/lib/utils/timezone'

interface TaskCardProps {
  task: Task
  isDragging?: boolean
}

export function TaskCard({ task, isDragging = false }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const completedChecklist = task.checklist.filter((item) => item.isCompleted).length
  const totalChecklist = task.checklist.length

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        className={cn(
          'cursor-grab active:cursor-grabbing',
          isDragging && 'opacity-50 shadow-lg'
        )}
      >
        <CardContent className="p-3">
          {/* Labels */}
          {task.labels.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1">
              {task.labels.map((label) => (
                <Badge
                  key={label.id}
                  variant="outline"
                  className="text-xs"
                  style={{
                    borderColor: label.color,
                    color: label.color,
                  }}
                >
                  {label.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Title */}
          <h4 className="mb-2 font-medium">{task.title}</h4>

          {/* Description */}
          {task.description && (
            <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
              {task.description}
            </p>
          )}

          {/* Progress */}
          {task.progress > 0 && (
            <div className="mb-3 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{task.progress}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {/* Due date */}
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatInUserTimezone(task.dueDate, 'MMM d')}</span>
              </div>
            )}

            {/* Priority */}
            <Badge
              variant="outline"
              className={cn('h-5 text-xs', getPriorityColor(task.priority))}
            >
              {task.priority}
            </Badge>

            {/* Checklist */}
            {totalChecklist > 0 && (
              <div className="flex items-center gap-1">
                <CheckSquare className="h-3 w-3" />
                <span>
                  {completedChecklist}/{totalChecklist}
                </span>
              </div>
            )}

            {/* Comments */}
            {task.comments.length > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>{task.comments.length}</span>
              </div>
            )}

            {/* Attachments */}
            {task.attachments && task.attachments.length > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip className="h-3 w-3" />
                <span>{task.attachments.length}</span>
              </div>
            )}
          </div>

          {/* Assignees */}
          {task.assigneeIds.length > 0 && (
            <div className="mt-3 flex -space-x-2">
              {task.assigneeIds.slice(0, 3).map((assigneeId, index) => (
                <div
                  key={assigneeId}
                  className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium"
                  title={`User ${index + 1}`}
                >
                  U{index + 1}
                </div>
              ))}
              {task.assigneeIds.length > 3 && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                  +{task.assigneeIds.length - 3}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
