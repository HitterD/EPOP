'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MessageSquare, FolderKanban, CheckSquare, Calendar, HardDrive } from 'lucide-react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { DashboardSummary } from '@/types'
import { formatDate } from '@/lib/utils'

export default function DashboardPage() {
  const { data } = useQuery({
    queryKey: ['me-summary'],
    queryFn: async () => {
      const res = await apiClient.get<DashboardSummary>('/me/summary')
      if (!res.success || !res.data) throw new Error('Failed to load summary')
      return res.data
    },
    staleTime: 60_000,
  })

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Current Projects */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Current Projects</CardTitle>
              <FolderKanban className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>Active projects you're working on</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(data?.currentProjects || []).map((project) => (
              <div key={project.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{project.name}</span>
                  <span className="text-muted-foreground">0%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full transition-all" style={{ width: '0%', backgroundColor: project.color }} />
                </div>
              </div>
            ))}
            <Link href="/projects">
              <Button variant="outline" className="w-full" size="sm">
                View all projects
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Unread Messages */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Unread Messages</CardTitle>
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>Recent conversations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Total unread</p>
              <Badge variant="destructive">{data?.unreadMessages ?? 0}</Badge>
            </div>
            <Link href="/chat">
              <Button variant="outline" className="mt-4 w-full" size="sm">
                View all messages
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* My Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">My Tasks</CardTitle>
              <CheckSquare className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>Tasks due today and this week</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data?.myTasks || []).map((task) => (
              <div key={task.id} className="flex items-start gap-3">
                <input type="checkbox" className="mt-1" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{task.title}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
                    </Badge>
                    <Badge
                      variant={task.priority === 'high' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
            <Link href="/projects">
              <Button variant="outline" className="w-full" size="sm">
                View all tasks
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Upcoming Agenda */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Upcoming Agenda</CardTitle>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>Your schedule for the week</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data?.upcomingAgenda || []).map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(item.startDate, 'long')}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Storage Usage */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Storage Usage</CardTitle>
              <HardDrive className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>File storage overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Used</span>
                  <span className="text-muted-foreground">{Math.round((((data?.storageUsage.used || 0) / (1024*1024*1024)) + Number.EPSILON) * 10) / 10} GB / 10 GB</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full transition-all" style={{ width: `${data?.storageUsage.percentage ?? 0}%`, backgroundColor: '#3B82F6' }} />
                </div>
              </div>
              <Link href="/files">
                <Button variant="outline" className="w-full" size="sm">
                  Manage files
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
