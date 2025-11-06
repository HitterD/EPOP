'use client'

import { ProgressData } from '@/types'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface ProgressChartProps {
  data: ProgressData
  className?: string
}

const COLORS = {
  done: '#10b981', // green
  inProgress: '#3b82f6', // blue
  todo: '#94a3b8', // gray
}

export function ProgressChart({ data, className }: ProgressChartProps) {
  if (!data || data.total === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        No progress data available
      </div>
    )
  }

  const chartData = [
    { name: 'Done', value: data.done, percentage: Math.round((data.done / data.total) * 100) },
    { name: 'In Progress', value: data.inProgress, percentage: Math.round((data.inProgress / data.total) * 100) },
    { name: 'To Do', value: data.todo, percentage: Math.round((data.todo / data.total) * 100) },
  ].filter((item) => item.value > 0)

  return (
    <div className={className} id="progress-chart">
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name}: ${percentage}%`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.name === 'Done'
                    ? COLORS.done
                    : entry.name === 'In Progress'
                    ? COLORS.inProgress
                    : COLORS.todo
                }
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [value, 'Tasks']}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Summary */}
      <div className="mt-4 text-center">
        <div className="text-2xl font-bold">
          {Math.round((data.done / data.total) * 100)}%
        </div>
        <div className="text-sm text-muted-foreground">
          Completion Rate ({data.done} of {data.total} tasks)
        </div>
      </div>
    </div>
  )
}
