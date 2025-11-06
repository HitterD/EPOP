'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { GanttChart } from '@/features/projects/components/gantt-chart'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'

export default function ProjectGanttPage() {
  const params = useParams()
  const projectId = params.id as string

  // Fetch project tasks
  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}`)
      if (!res.ok) throw new Error('Failed to fetch project')
      return res.json()
    },
  })

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['project-tasks', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/tasks`)
      if (!res.ok) throw new Error('Failed to fetch tasks')
      return res.json()
    },
  })

  if (isLoading || tasksLoading) {
    return (
      <div className="h-full p-6">
        <Skeleton className="h-full w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load project</h3>
          <p className="text-sm text-muted-foreground">Please try again later</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold">{project?.name || 'Project'} - Gantt View</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Timeline visualization of all tasks
        </p>
      </div>
      
      <div className="flex-1 p-6 overflow-hidden">
        <GanttChart 
          tasks={tasks} 
          onTaskClick={(task) => {
            // TODO: Open task detail modal/drawer
            console.log('Task clicked:', task)
          }}
        />
      </div>
    </div>
  )
}
