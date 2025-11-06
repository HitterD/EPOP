'use client'

import { TimelineData } from '@/types'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'

interface TimelineChartProps {
  data: TimelineData[]
  className?: string
}

export function TimelineChart({ data, className }: TimelineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        No timeline data available
      </div>
    )
  }

  const averageVelocity = data.reduce((sum, item) => sum + item.velocity, 0) / data.length

  return (
    <div className={className} id="timeline-chart">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            tickFormatter={(value) => format(new Date(value), 'MMM dd')}
            className="text-xs"
          />
          <YAxis className="text-xs" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            labelFormatter={(value) => format(new Date(value), 'PPP')}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="created"
            stroke="#3b82f6"
            name="Tasks Created"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="completed"
            stroke="#10b981"
            name="Tasks Completed"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="velocity"
            stroke="#8b5cf6"
            name="Velocity"
            strokeWidth={2}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
      
      {/* Summary */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <div className="font-medium">Total Created</div>
          <div className="text-muted-foreground">
            {data.reduce((sum, item) => sum + item.created, 0)} tasks
          </div>
        </div>
        <div>
          <div className="font-medium">Total Completed</div>
          <div className="text-muted-foreground">
            {data.reduce((sum, item) => sum + item.completed, 0)} tasks
          </div>
        </div>
        <div>
          <div className="font-medium">Avg Velocity</div>
          <div className="text-muted-foreground">
            {averageVelocity.toFixed(1)} tasks/day
          </div>
        </div>
      </div>
    </div>
  )
}
