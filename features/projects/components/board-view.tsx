'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { BoardColumn } from './board-column'
import { TaskCardDraggable } from './task-card-draggable'
import { useMoveTask, useReorderTasks } from '@/lib/api/hooks/use-projects'
import { useProjectTaskEvents } from '@/lib/socket/hooks/use-project-events'
import { Task, Bucket } from '@/types'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BoardViewProps {
  projectId: string
  buckets: Bucket[]
  tasks: Task[]
  onAddTask?: (bucketId: string) => void
  onEditTask?: (task: Task) => void
}

export function BoardView({
  projectId,
  buckets,
  tasks,
  onAddTask,
  onEditTask,
}: BoardViewProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [localBuckets, setLocalBuckets] = useState(buckets)
  const [localTasks, setLocalTasks] = useState(tasks)

  // Mutations
  const { mutate: moveTask, isPending: isMoving } = useMoveTask(projectId)
  const { mutate: reorderTasks, isPending: isReordering } = useReorderTasks(projectId)

  // Real-time events
  useProjectTaskEvents(projectId, true)

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Update local state when props change
  useState(() => {
    setLocalBuckets(buckets)
    setLocalTasks(tasks)
  })

  // Group tasks by bucket
  const tasksByBucket = localTasks.reduce((acc, task) => {
    const bucketId = task.bucketId || 'unassigned'
    if (!acc[bucketId]) {
      acc[bucketId] = []
    }
    acc[bucketId].push(task)
    return acc
  }, {} as Record<string, Task[]>)

  // Sort tasks by order within each bucket
  Object.keys(tasksByBucket).forEach((bucketId) => {
    tasksByBucket[bucketId].sort((a, b) => (a.order || 0) - (b.order || 0))
  })

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    const task = localTasks.find((t) => t.id === active.id)
    setActiveTask(task || null)
  }, [localTasks])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find source and destination buckets
    const activeTask = localTasks.find((t) => t.id === activeId)
    if (!activeTask) return

    // Check if dragging over a bucket or a task
    const overBucket = localBuckets.find((b) => b.id === overId)
    const overTask = localTasks.find((t) => t.id === overId)

    const sourceBucketId = activeTask.bucketId
    const targetBucketId = overBucket?.id || overTask?.bucketId

    if (!targetBucketId || sourceBucketId === targetBucketId) return

    // Optimistic update: move task to new bucket
    setLocalTasks((tasks) => {
      const updatedTasks = tasks.map((task) =>
        task.id === activeId ? { ...task, bucketId: targetBucketId } : task
      )
      return updatedTasks
    })
  }, [localTasks, localBuckets])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeTask = localTasks.find((t) => t.id === activeId)
    if (!activeTask) return

    // Determine target bucket
    const overBucket = localBuckets.find((b) => b.id === overId)
    const overTask = localTasks.find((t) => t.id === overId)
    const targetBucketId = overBucket?.id || overTask?.bucketId || activeTask.bucketId

    const sourceBucketId = activeTask.bucketId

    // Case 1: Moving to different bucket
    if (sourceBucketId !== targetBucketId) {
      const targetBucketTasks = tasksByBucket[targetBucketId] || []
      const newOrderIndex = overTask
        ? targetBucketTasks.findIndex((t) => t.id === overTask.id)
        : targetBucketTasks.length

      // Optimistic update
      const previousTasks = [...localTasks]

      setLocalTasks((tasks) =>
        tasks.map((task) =>
          task.id === activeId
            ? { ...task, bucketId: targetBucketId, order: newOrderIndex }
            : task
        )
      )

      // API call with rollback on error
      moveTask(
        {
          taskId: activeId,
          toBucketId: targetBucketId,
          orderIndex: newOrderIndex,
        },
        {
          onError: (error) => {
            // Rollback
            setLocalTasks(previousTasks)
            toast.error('Failed to move task: ' + error.message)
          },
          onSuccess: () => {
            toast.success('Task moved successfully')
          },
        }
      )
    }
    // Case 2: Reordering within same bucket
    else if (activeId !== overId && sourceBucketId === targetBucketId) {
      const bucketTasks = tasksByBucket[sourceBucketId] || []
      const oldIndex = bucketTasks.findIndex((t) => t.id === activeId)
      const newIndex = bucketTasks.findIndex((t) => t.id === overId)

      if (oldIndex !== newIndex) {
        const reorderedTasks = arrayMove(bucketTasks, oldIndex, newIndex)
        const taskIds = reorderedTasks.map((t) => t.id)

        // Optimistic update
        const previousTasks = [...localTasks]

        setLocalTasks((tasks) =>
          tasks.map((task) => {
            const newOrder = taskIds.indexOf(task.id)
            return newOrder >= 0 ? { ...task, order: newOrder } : task
          })
        )

        // API call with rollback on error
        reorderTasks(
          {
            bucketId: sourceBucketId,
            taskIds,
          },
          {
            onError: (error) => {
              // Rollback
              setLocalTasks(previousTasks)
              toast.error('Failed to reorder tasks: ' + error.message)
            },
          }
        )
      }
    }
  }, [localTasks, localBuckets, tasksByBucket, moveTask, reorderTasks])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-4 overflow-x-auto p-4">
        {/* Render buckets */}
        {localBuckets.map((bucket) => {
          const bucketTasks = tasksByBucket[bucket.id] || []
          
          return (
            <BoardColumn
              key={bucket.id}
              bucket={bucket}
              tasks={bucketTasks}
              onAddTask={() => onAddTask?.(bucket.id)}
              onEditTask={onEditTask}
              isDragging={!!activeTask}
            />
          )
        })}

        {/* Add bucket button */}
        <div className="flex-shrink-0 w-80">
          <Button
            variant="outline"
            className="w-full h-12 border-dashed"
            onClick={() => {
              // TODO: Open add bucket dialog
            }}
          >
            <Plus size={16} className="mr-2" />
            Add Column
          </Button>
        </div>
      </div>

      {/* Drag overlay - shows task being dragged */}
      <DragOverlay>
        {activeTask ? (
          <div className="rotate-2 opacity-80">
            <TaskCardDraggable
              task={activeTask}
              isDragging={true}
              onEdit={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
