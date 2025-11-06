import dynamic from 'next/dynamic'

const ProjectChartsView = dynamic(
  () => import('@/features/projects/components/project-charts-view').then(m => m.ProjectChartsView),
  { ssr: false, loading: () => <div className="min-h-[420px] w-full animate-pulse rounded-lg bg-muted/30" /> }
)

interface ProjectChartsPageProps {
  params: {
    projectId: string
  }
}

export default function ProjectChartsPage({ params }: ProjectChartsPageProps) {
  return (
    <div className="container max-w-6xl py-6">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Track progress, velocity, and team workload with interactive charts
          </p>
        </div>

        {/* Charts View */}
        <ProjectChartsView projectId={params.projectId} />
      </div>
    </div>
  )
}
