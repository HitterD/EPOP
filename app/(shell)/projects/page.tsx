'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, FolderKanban, Users } from 'lucide-react'
import Link from 'next/link'
import { useProjects } from '@/lib/api/hooks/use-projects'

export default function ProjectsPage() {
  const { data: projects } = useProjects()

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage your projects and tasks</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(projects || []).map((project) => {
          const progress = 0

          return (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ backgroundColor: project.color + '20' }}
                    >
                      <FolderKanban className="h-5 w-5" style={{ color: project.color }} />
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <CardTitle className="mt-4">{project.name}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${progress}%`,
                            backgroundColor: project.color,
                          }}
                        />
                      </div>
                    </div>

                    {/* Members */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{project.memberIds.length} members</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
