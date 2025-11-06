'use client'

import { useDroppable } from '@dnd-kit/core'

interface DroppableSlotProps {
  id: string
  date: Date
  hour?: number
  children?: React.ReactNode
  className?: string
  onClick?: () => void
}

export function DroppableSlot({ id, date, hour, children, className = '', onClick }: DroppableSlotProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: { date, hour },
  })

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? 'bg-primary/10 ring-2 ring-primary ring-inset' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
