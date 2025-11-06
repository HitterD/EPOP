'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  CheckSquare,
  Clock,
  Download,
  Calendar as CalendarIcon,
  Filter,
} from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import {
  DynamicActivityTrendChart,
  DynamicMessageVolumeChart,
  DynamicTaskCompletionChart,
  DynamicResponseTimeChart,
  DynamicDetailedMetricsTable,
} from '@/lib/utils/dynamic-imports'
import { exportToCSV } from '@/lib/utils/csv-export'
import { toast } from 'sonner'

interface KPICardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  onClick?: () => void
}

function KPICard({ title, value, change, icon, onClick }: KPICardProps) {
  const isPositive = change && change > 0
  const isNegative = change && change < 0

  return (
    <Card
      className={onClick ? 'cursor-pointer transition-shadow hover:shadow-lg' : ''}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {isPositive && <TrendingUp className="h-3 w-3 text-green-600" />}
            {isNegative && <TrendingDown className="h-3 w-3 text-red-600" />}
            <span className={isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : ''}>
              {change > 0 ? '+' : ''}
              {change}%
            </span>
            <span>vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function AnalyticsPage() {
  // Date range state
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })

  // Filters state
  const [selectedOrgUnit, setSelectedOrgUnit] = useState<string>('all')
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [activeKPI, setActiveKPI] = useState<string | null>(null)

  // Mock data - replace with actual API calls
  const kpiData = useMemo(
    () => ({
      activeUsers: { value: 142, change: 12.5 },
      messagesPerDay: { value: 1847, change: -3.2 },
      taskThroughput: { value: 89, change: 8.7 },
      avgSLAReply: { value: '2.3h', change: -15.5 },
    }),
    []
  )

  const handleKPIDrillDown = (kpi: string) => {
    setActiveKPI(kpi)
    toast.info(`Filtering dashboard by: ${kpi}`)
  }

  const handleExportCSV = () => {
    // Prepare export data with current filters
    const exportData = [
      { metric: 'Active Users', value: kpiData.activeUsers.value, change: kpiData.activeUsers.change },
      { metric: 'Messages/Day', value: kpiData.messagesPerDay.value, change: kpiData.messagesPerDay.change },
      { metric: 'Task Throughput', value: kpiData.taskThroughput.value, change: kpiData.taskThroughput.change },
      { metric: 'Avg SLA Reply', value: kpiData.avgSLAReply.value, change: kpiData.avgSLAReply.change },
    ]

    const filename = `analytics-export-${format(new Date(), 'yyyy-MM-dd')}.csv`
    exportToCSV(exportData, filename)
    toast.success('CSV export downloaded')
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track KPIs, trends, and performance metrics across your organization
          </p>
        </div>
        <Button onClick={handleExportCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters Panel */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle className="text-lg">Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Date Range Picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, 'LLL dd')} - {format(dateRange.to, 'LLL dd, yyyy')}
                        </>
                      ) : (
                        format(dateRange.from, 'LLL dd, yyyy')
                      )
                    ) : (
                      'Select date range'
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Org Unit Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Organization Unit</label>
              <Select value={selectedOrgUnit} onValueChange={setSelectedOrgUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Units</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Project Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Project</label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectItem value="project-alpha">Project Alpha</SelectItem>
                  <SelectItem value="project-beta">Project Beta</SelectItem>
                  <SelectItem value="project-gamma">Project Gamma</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {activeKPI && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Active drill-down:</span>
              <Badge variant="secondary">
                {activeKPI}
                <button
                  className="ml-2 text-xs"
                  onClick={() => setActiveKPI(null)}
                >
                  ×
                </button>
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Active Users"
          value={kpiData.activeUsers.value}
          change={kpiData.activeUsers.change}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          onClick={() => handleKPIDrillDown('active-users')}
        />
        <KPICard
          title="Messages/Day"
          value={kpiData.messagesPerDay.value}
          change={kpiData.messagesPerDay.change}
          icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />}
          onClick={() => handleKPIDrillDown('messages-per-day')}
        />
        <KPICard
          title="Task Throughput"
          value={kpiData.taskThroughput.value}
          change={kpiData.taskThroughput.change}
          icon={<CheckSquare className="h-4 w-4 text-muted-foreground" />}
          onClick={() => handleKPIDrillDown('task-throughput')}
        />
        <KPICard
          title="Avg SLA Reply"
          value={kpiData.avgSLAReply.value}
          change={kpiData.avgSLAReply.change}
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          onClick={() => handleKPIDrillDown('avg-sla-reply')}
        />
      </div>

      {/* Charts Grid */}
      <Tabs defaultValue="overview" className="flex-1">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Activity</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Activity Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Trend</CardTitle>
                <CardDescription>User activity over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <DynamicActivityTrendChart drillDownMetric={activeKPI} />
              </CardContent>
            </Card>

            {/* Message Volume Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Message Volume</CardTitle>
                <CardDescription>Messages sent and received over the last 14 days</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <DynamicMessageVolumeChart />
              </CardContent>
            </Card>

            {/* Task Completion Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Task Completion Rate</CardTitle>
                <CardDescription>Tasks created vs completed over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <DynamicTaskCompletionChart />
              </CardContent>
            </Card>

            {/* Response Time Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Response Time Distribution</CardTitle>
                <CardDescription>SLA performance breakdown by time range</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <DynamicResponseTimeChart />
              </CardContent>
            </Card>
          </div>

          {/* Detailed Metrics Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Metrics</CardTitle>
              <CardDescription>
                User activity breakdown with sorting and filtering
                {activeKPI && <Badge className="ml-2">Filtered by: {activeKPI}</Badge>}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DynamicDetailedMetricsTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Engagement</CardTitle>
            </CardHeader>
            <CardContent className="flex h-[400px] items-center justify-center text-muted-foreground">
              User activity charts (Wave-2)
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Message Analytics</CardTitle>
            </CardHeader>
            <CardContent className="flex h-[400px] items-center justify-center text-muted-foreground">
              Message volume and patterns (Wave-2)
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Metrics</CardTitle>
            </CardHeader>
            <CardContent className="flex h-[400px] items-center justify-center text-muted-foreground">
              Task throughput and completion analytics (Wave-2)
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
