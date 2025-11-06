'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Badge } from '@/components/ui/badge'
import { GripVertical } from 'lucide-react'

interface DraggableEventProps {
  id: string
  title: string
  color: string
  type: 'task' | 'milestone' | 'mail' | 'reminder'
  startTime?: string
  endTime?: string
}

export function DraggableEvent({
  id,
  title,
  color,
  type,
  startTime,
  endTime,
}: DraggableEventProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { id, title, color, type, startTime, endTime },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`group relative rounded p-2 text-xs ${color} text-white transition-opacity`}
    >
      <div className="flex items-start gap-1">
        <div {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-70" />
        </div>
        <div className="flex-1">
          <div className="font-semibold">{title}</div>
          {startTime && (
            <div className="opacity-90">
              {startTime}
              {endTime && ` - ${endTime}`}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
