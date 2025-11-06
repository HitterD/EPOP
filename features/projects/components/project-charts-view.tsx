'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Download, Calendar, RefreshCw, AlertCircle } from 'lucide-react'
import { DateRange } from '@/types'
import { useProjectAnalytics, getDateRangePresets, exportChartToPNG } from '@/lib/api/hooks/use-project-analytics'
import { BurndownChart } from './charts/burndown-chart'
import { ProgressChart } from './charts/progress-chart'
import { WorkloadChart } from './charts/workload-chart'
import { TimelineChart } from './charts/timeline-chart'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ProjectChartsViewProps {
  projectId: string
  className?: string
}

type ChartType = 'burndown' | 'progress' | 'workload' | 'timeline'

const chartOptions = [
  { value: 'burndown', label: 'Burndown Chart', description: 'Track progress vs ideal pace' },
  { value: 'progress', label: 'Progress Overview', description: 'Task status distribution' },
  { value: 'workload', label: 'Workload Distribution', description: 'Tasks per team member' },
  { value: 'timeline', label: 'Timeline & Velocity', description: 'Task creation and completion over time' },
]

export function ProjectChartsView({ projectId, className }: ProjectChartsViewProps) {
  const [chartType, setChartType] = useState<ChartType>('burndown')
  const [dateRange, setDateRange] = useState<DateRange>(getDateRangePresets().last30Days)

  const { data: analytics, isLoading, error, refetch, isRefetching } = useProjectAnalytics({
    projectId,
    dateRange,
  })

  const handleExport = async () => {
    try {
      const chartId = `${chartType}-chart`
      const filename = `${projectId}-${chartType}-${Date.now()}.png`
      await exportChartToPNG(chartId, filename)
      toast.success('Chart exported successfully!')
    } catch (err) {
      toast.error('Failed to export chart')
    }
  }

  const handleDateRangeChange = (preset: string) => {
    const presets = getDateRangePresets()
    switch (preset) {
      case '7':
        setDateRange(presets.last7Days)
        break
      case '30':
        setDateRange(presets.last30Days)
        break
      case '90':
        setDateRange(presets.last90Days)
        break
    }
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load analytics: {error.message}
            </AlertDescription>
          </Alert>
          <div className="flex justify-center mt-4">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analytics) {
    return null
  }

  const selectedChart = chartOptions.find((c) => c.value === chartType)

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {selectedChart?.label}
              {isRefetching && (
                <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </CardTitle>
            <CardDescription>{selectedChart?.description}</CardDescription>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              title="Export as PNG"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
              title="Refresh data"
            >
              <RefreshCw className={cn('h-4 w-4', isRefetching && 'animate-spin')} />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mt-4">
          {/* Chart Type Selector */}
          <div className="flex-1">
            <Select value={chartType} onValueChange={(value) => setChartType(value as ChartType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {chartOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Selector */}
          <div className="w-48">
            <Select
              value={
                dateRange === getDateRangePresets().last7Days
                  ? '7'
                  : dateRange === getDateRangePresets().last30Days
                  ? '30'
                  : '90'
              }
              onValueChange={handleDateRangeChange}
            >
              <SelectTrigger>
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Summary Stats */}
        {analytics.summary && (
          <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold">{analytics.summary.totalTasks}</div>
              <div className="text-xs text-muted-foreground">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {analytics.summary.completedTasks}
              </div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{analytics.summary.completionRate}%</div>
              <div className="text-xs text-muted-foreground">Completion Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{analytics.summary.averageVelocity.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">Avg Velocity/Day</div>
            </div>
          </div>
        )}

        {/* Chart Display */}
        {chartType === 'burndown' && <BurndownChart data={analytics.burndown} />}
        {chartType === 'progress' && <ProgressChart data={analytics.progress} />}
        {chartType === 'workload' && <WorkloadChart data={analytics.workload} />}
        {chartType === 'timeline' && <TimelineChart data={analytics.timeline} />}
      </CardContent>
    </Card>
  )
}
