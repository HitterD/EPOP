'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Plus, LayoutGrid, BarChart3, Calendar, ListTree } from 'lucide-react'
import { ProjectBoard } from '@/features/projects/components/project-board'

export default function ProjectDetailPage({ params }: { params: { projectId: string } }) {
  const [activeView, setActiveView] = useState('board')

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Website Redesign</h1>
            <p className="text-sm text-muted-foreground">5 members • 24 tasks</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>

        {/* View Tabs */}
        <Tabs value={activeView} onValueChange={setActiveView} className="mt-4">
          <TabsList>
            <TabsTrigger value="board">
              <LayoutGrid className="mr-2 h-4 w-4" />
              Board
            </TabsTrigger>
            <TabsTrigger value="grid">
              <ListTree className="mr-2 h-4 w-4" />
              Grid
            </TabsTrigger>
            <TabsTrigger value="gantt">
              <BarChart3 className="mr-2 h-4 w-4" />
              Gantt
            </TabsTrigger>
            <TabsTrigger value="schedule">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="charts">
              <BarChart3 className="mr-2 h-4 w-4" />
              Charts
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeView === 'board' && <ProjectBoard projectId={params.projectId} />}
        {activeView === 'grid' && (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Grid view (SVAR DataGrid integration)
          </div>
        )}
        {activeView === 'gantt' && (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Gantt view (SVAR Gantt integration)
          </div>
        )}
        {activeView === 'schedule' && (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Schedule view (React Big Calendar)
          </div>
        )}
        {activeView === 'charts' && (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Charts view (Recharts)
          </div>
        )}
      </div>
    </div>
  )
}
