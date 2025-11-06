'use client'

import { BoardView } from './board-view'
import { useProjectBuckets, useProjectTasks } from '@/lib/api/hooks/use-projects'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { Task } from '@/types'

interface ProjectBoardPageProps {
  projectId: string
}

export function ProjectBoardPage({ projectId }: ProjectBoardPageProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  // Fetch buckets and tasks
  const {
    data: bucketsData,
    isLoading: bucketsLoading,
    error: bucketsError,
  } = useProjectBuckets(projectId)

  const {
    data: tasksData,
    isLoading: tasksLoading,
    error: tasksError,
  } = useProjectTasks(projectId, 1000)

  // Extract data from paginated response
  const buckets = bucketsData || []
  const tasks = tasksData?.pages.flatMap((page) => page.items) || []

  // Loading state
  if (bucketsLoading || tasksLoading) {
    return (
      <div className="flex h-full gap-4 overflow-x-auto p-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-shrink-0 w-80 space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ))}
      </div>
    )
  }

  // Error state
  if (bucketsError || tasksError) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load project board. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Empty state - no buckets
  if (buckets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <div className="max-w-md space-y-4">
          <h3 className="text-lg font-semibold">No columns yet</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Create your first column to start organizing tasks
          </p>
          <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
            Create Column
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <BoardView
        projectId={projectId}
        buckets={buckets}
        tasks={tasks}
        onAddTask={(bucketId) => {
          console.log('Add task to bucket:', bucketId)
          // TODO: Open task creation dialog
        }}
        onEditTask={(task) => {
          setSelectedTask(task)
          // TODO: Open task edit modal
        }}
      />

      {/* Task modal would go here */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">{selectedTask.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Task ID: {selectedTask.id}
            </p>
            <button
              onClick={() => setSelectedTask(null)}
              className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
