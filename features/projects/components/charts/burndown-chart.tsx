'use client'

import { BurndownData } from '@/types'
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

interface BurndownChartProps {
  data: BurndownData[]
  className?: string
}

export function BurndownChart({ data, className }: BurndownChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        No burndown data available
      </div>
    )
  }

  return (
    <div className={className} id="burndown-chart">
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
            dataKey="ideal"
            stroke="#94a3b8"
            strokeDasharray="5 5"
            name="Ideal"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#3b82f6"
            name="Actual"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="remaining"
            stroke="#f59e0b"
            name="Remaining"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
