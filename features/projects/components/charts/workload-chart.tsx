'use client'

import { WorkloadData } from '@/types'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface WorkloadChartProps {
  data: WorkloadData[]
  className?: string
}

export function WorkloadChart({ data, className }: WorkloadChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        No workload data available
      </div>
    )
  }

  return (
    <div className={className} id="workload-chart">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="userName"
            className="text-xs"
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis className="text-xs" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar dataKey="done" stackId="a" fill="#10b981" name="Done" />
          <Bar dataKey="inProgress" stackId="a" fill="#3b82f6" name="In Progress" />
          <Bar dataKey="todo" stackId="a" fill="#94a3b8" name="To Do" />
        </BarChart>
      </ResponsiveContainer>
      
      {/* Summary */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <div className="font-medium">Most Tasks</div>
          <div className="text-muted-foreground">
            {data.reduce((max, item) => (item.total > max.total ? item : max), data[0])?.userName}
          </div>
        </div>
        <div>
          <div className="font-medium">Most Complete</div>
          <div className="text-muted-foreground">
            {data.reduce((max, item) => (item.done > max.done ? item : max), data[0])?.userName}
          </div>
        </div>
        <div>
          <div className="font-medium">Total Assigned</div>
          <div className="text-muted-foreground">
            {data.reduce((sum, item) => sum + item.total, 0)} tasks
          </div>
        </div>
      </div>
    </div>
  )
}
